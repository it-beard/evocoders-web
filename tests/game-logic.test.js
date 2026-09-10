import test from 'node:test';
import assert from 'node:assert/strict';
import { loadPage } from './helpers/dom.js';
import { readRepoFile } from './helpers/paths.js';

/* ────────────────────────── Game of Life (фон лендинга) ────────────────────────── */

const golPage = await loadPage({ scripts: ['gameOfLife.js'] });
test.after(() => golPage.close());

/**
 * Мелкая сетка нужна намеренно: update() перезапускает поле, если живых клеток
 * меньше 0.3% от размера. На 10×10 порог обнуляется и фигуры доживают до проверки.
 */
function makeLife({ size = 120, cellSize = 12 } = {}) {
    const { window, document } = golPage;
    for (const dim of ['innerWidth', 'innerHeight']) {
        Object.defineProperty(window, dim, { value: size, configurable: true });
    }
    const canvas = document.createElement('canvas');
    canvas.id = `gol-${Math.random().toString(36).slice(2)}`;
    document.body.appendChild(canvas);

    const game = new window.GameOfLife(canvas.id, cellSize, 0, 20, 6000);
    game.current.fill(0);
    return game;
}

const aliveCells = (game) => {
    const out = [];
    for (let y = 0; y < game.rows; y++) {
        for (let x = 0; x < game.cols; x++) if (game.current[game.idx(x, y)]) out.push(`${x},${y}`);
    }
    return out.sort();
};

test('поле нарезается по размеру окна', () => {
    const game = makeLife({ size: 120, cellSize: 12 });
    assert.equal(game.cols, 10);
    assert.equal(game.rows, 10);
    assert.equal(game.current.length, 100);
});

test('мигалка переворачивается за такт и возвращается за два', () => {
    const game = makeLife();
    [[5, 4], [5, 5], [5, 6]].forEach(([x, y]) => game.setCell(x, y, 1));

    game.update();
    assert.deepEqual(aliveCells(game), ['4,5', '5,5', '6,5'].sort());

    game.update();
    assert.deepEqual(aliveCells(game), ['5,4', '5,5', '5,6'].sort());
});

test('квадрат — устойчивая фигура', () => {
    const game = makeLife();
    [[2, 2], [3, 2], [2, 3], [3, 3]].forEach(([x, y]) => game.setCell(x, y, 1));

    const before = aliveCells(game);
    game.update();
    assert.deepEqual(aliveCells(game), before);
});

test('одинокая клетка умирает', () => {
    const game = makeLife();
    game.setCell(4, 4, 1);
    game.update();
    assert.deepEqual(aliveCells(game), []);
});

test('поле замкнуто в тор: координаты заворачиваются', () => {
    const game = makeLife();
    game.setCell(-1, -1, 1);
    assert.deepEqual(aliveCells(game), [`${game.cols - 1},${game.rows - 1}`]);

    game.setCell(game.cols, game.rows, 1);
    assert.ok(game.current[game.idx(0, 0)] === 1);
});

test('клик по фону подсыпает клетки вокруг точки', () => {
    const game = makeLife();
    // Скрипт исполняется в реалме jsdom — подменять надо его Math, а не наш.
    const { Math: pageMath } = golPage.window;
    const random = pageMath.random;
    pageMath.random = () => 0; // burst срабатывает на каждой клетке
    try {
        game.injectAtClient(60, 36); // cellSize 12 → клетка (5, 3)
    } finally {
        pageMath.random = random;
    }

    assert.equal(game.current[game.idx(5, 3)], 1, 'центр burst не заполнен');
    assert.equal(game.current[game.idx(8, 6)], 1, 'край burst (radius 3) не заполнен');
    assert.equal(game.current[game.idx(1, 3)], 0, 'burst задел клетки за радиусом');
});

/* ─────────────────────────── Battle City (пасхалка) ─────────────────────────── */

/**
 * Константы уровня спрятаны в IIFE. Чтобы не тащить их копию в тест (она бы
 * разъехалась с игрой), выносим их наружу через ту же строку, которой файл
 * публикует сам себя.
 */
async function loadBattleCity() {
    const page = await loadPage({ scripts: ['battleCitySounds.js'] });
    const anchor = 'window.BattleCity = BattleCity;';
    const src = readRepoFile('js', 'battleCity.js');
    assert.ok(src.includes(anchor), 'js/battleCity.js больше не публикует себя этой строкой — поправь тест');

    const el = page.document.createElement('script');
    el.textContent = src.replace(anchor, `${anchor}
window.__bc = { CELL, GRID, FIELD, TANK_SIZE, TOTAL_ENEMIES, MAX_LEVEL, T, DIRS, ENEMY_TYPES,
    LEVEL_COMPOSITIONS, LEVEL_MAPS, POWERUP_TYPES, FORTRESS_CELLS, EAGLE_X, EAGLE_Y,
    clamp, rectsIntersect, cellRangeStart, cellRangeEnd };`);
    page.document.body.appendChild(el);

    return { page, bc: page.window.__bc };
}

const { page: bcPage, bc } = await loadBattleCity();
test.after(() => bcPage.close());

test('игра экспортируется наружу', () => {
    assert.equal(typeof bcPage.window.BattleCity, 'function');
});

test('геометрия поля согласована', () => {
    assert.equal(bc.FIELD, bc.CELL * bc.GRID);
    assert.equal(bc.TANK_SIZE, bc.CELL * 2, 'танк должен быть ровно 2×2 клетки');
    assert.equal(bc.EAGLE_X % bc.TANK_SIZE, 0, 'штаб не попадает в сетку блоков');
    assert.equal(bc.EAGLE_Y % bc.TANK_SIZE, 0);
});

test('карты есть на все уровни и нарисованы 13×13', () => {
    const levels = Object.keys(bc.LEVEL_MAPS).map(Number).sort((a, b) => a - b);
    assert.deepEqual(levels, Array.from({ length: bc.MAX_LEVEL }, (_, i) => i + 1));

    const allowed = new Set(['.', 'B', 'S', 'W', 'T', 'I']);
    for (const [level, rows] of Object.entries(bc.LEVEL_MAPS)) {
        assert.equal(rows.length, 13, `уровень ${level}: не 13 строк`);
        rows.forEach((row, y) => {
            assert.equal(row.length, 13, `уровень ${level}, строка ${y}: не 13 символов`);
            for (const ch of row) {
                assert.ok(allowed.has(ch), `уровень ${level}: неизвестный символ «${ch}»`);
            }
        });
    }
});

test('на каждом уровне ровно 20 танков и только известные типы', () => {
    const types = Object.keys(bc.ENEMY_TYPES);
    assert.deepEqual(types, ['basic', 'fast', 'power', 'armor']);

    for (let level = 1; level <= bc.MAX_LEVEL; level++) {
        const comp = bc.LEVEL_COMPOSITIONS[level];
        assert.ok(comp, `нет состава для уровня ${level}`);
        assert.equal(comp.length, types.length, `уровень ${level}: состав не по типам врагов`);
        assert.equal(
            comp.reduce((a, b) => a + b, 0), bc.TOTAL_ENEMIES,
            `уровень ${level}: сумма врагов ≠ ${bc.TOTAL_ENEMIES}`
        );
        assert.ok(comp.every((n) => n >= 0), `уровень ${level}: отрицательное число врагов`);
    }
});

test('крепость окружает штаб и не накрывает его', () => {
    assert.equal(bc.FORTRESS_CELLS.length, 20, 'кольцо вокруг штаба — 6 блоков минус сам штаб');

    const eagleCell = [bc.EAGLE_Y / bc.CELL, bc.EAGLE_X / bc.CELL];
    const covers = bc.FORTRESS_CELLS.some(([cy, cx]) => cy === eagleCell[0] && cx === eagleCell[1]);
    assert.equal(covers, false, 'кирпич стоит на самом штабе');
});

test('все бонусы имеют уникальные типы', () => {
    assert.equal(new Set(bc.POWERUP_TYPES).size, bc.POWERUP_TYPES.length);
    assert.ok(bc.POWERUP_TYPES.includes('helmet') && bc.POWERUP_TYPES.includes('shovel'));
});

test('направления движения взаимно обратны', () => {
    const { up, down, left, right } = bc.DIRS;
    assert.deepEqual([up.dx + down.dx, up.dy + down.dy], [0, 0]);
    assert.deepEqual([left.dx + right.dx, left.dy + right.dy], [0, 0]);
});

test('clamp зажимает значение в границах', () => {
    assert.equal(bc.clamp(5, 0, 10), 5);
    assert.equal(bc.clamp(-3, 0, 10), 0);
    assert.equal(bc.clamp(42, 0, 10), 10);
});

test('rectsIntersect: касание сторон не считается пересечением', () => {
    const a = { x: 0, y: 0, width: 10, height: 10 };
    assert.equal(bc.rectsIntersect(a, { x: 5, y: 5, width: 10, height: 10 }), true);
    assert.equal(bc.rectsIntersect(a, { x: 10, y: 0, width: 10, height: 10 }), false, 'впритык — не пересечение');
    assert.equal(bc.rectsIntersect(a, { x: 20, y: 20, width: 5, height: 5 }), false);
});

test('диапазон клеток не выходит за поле', () => {
    assert.equal(bc.cellRangeStart(-50), 0);
    assert.equal(bc.cellRangeStart(bc.CELL * 3), 3);
    assert.equal(bc.cellRangeEnd(bc.FIELD * 2, bc.TANK_SIZE), bc.GRID - 1);
    assert.equal(bc.cellRangeEnd(0, bc.CELL), 0, 'объект ровно в клетку не должен задевать соседнюю');
});
