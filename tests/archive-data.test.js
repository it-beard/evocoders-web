import test from 'node:test';
import assert from 'node:assert/strict';
import { loadArchive } from './helpers/archive.js';

const archive = await loadArchive();
test.after(() => archive.page.close());

/**
 * Снимок текущего наполнения архива. Числа меняются осознанно — вместе
 * с добавлением контента в js/archive.js, а не «само собой».
 */
const EXPECTED = {
    workshops:  { label: 'Воркшопы',      icon: 'fas fa-flask-vial',                count: 40 },
    clubcalls:  { label: 'Созвоны',       icon: 'fas fa-headset',                   count: 38 },
    latecoffee: { label: 'Late Coffee',   icon: 'fas fa-mug-hot',                   count: 1  },
    interviews: { label: 'Интервью',      icon: 'fas fa-microphone',                count: 9  },
    reviews:    { label: 'Обзоры',        icon: 'fas fa-magnifying-glass-chart',    count: 26 },
    booksclub:  { label: 'Книжный клуб',  icon: 'fas fa-book-open',                 count: 16 },
    lessons:    { label: 'Обучалки',      icon: 'fas fa-chalkboard-user',           count: 8  },
    talks:      { label: 'Доклады',       icon: 'fas fa-person-chalkboard',         count: 3  }
};

const TOTAL = 141;

test('порядок вкладок зафиксирован', () => {
    assert.deepEqual(archive.order, Object.keys(EXPECTED));
});

test('страница поднимается без JS-ошибок', () => {
    assert.deepEqual(archive.page.jsErrors, []);
});

test('каждая категория: подпись, иконка и количество записей', () => {
    for (const [key, expected] of Object.entries(EXPECTED)) {
        const cat = archive.categories[key];
        assert.ok(cat, `нет категории ${key}`);
        assert.equal(cat.label, expected.label, `подпись вкладки ${key}`);
        assert.equal(cat.icon, expected.icon, `иконка вкладки ${key}`);
        assert.equal(cat.items.length, expected.count, `число записей в ${key}`);
    }
});

test('счётчик на вкладке совпадает с числом отрендеренных записей', () => {
    for (const cat of Object.values(archive.categories)) {
        assert.equal(cat.badgeCount, cat.items.length, `счётчик вкладки ${cat.key}`);
    }
});

test('всего записей в архиве', () => {
    assert.equal(archive.total, TOTAL);
});

test('даты — либо YYYY.MM.DD, либо голый год', () => {
    for (const cat of Object.values(archive.categories)) {
        for (const item of cat.items) {
            const ok = /^\d{4}\.\d{2}\.\d{2}$/.test(item.date) || /^\d{4}$/.test(item.date);
            assert.ok(ok, `${cat.key}: некорректная дата "${item.date}" у «${item.title}»`);
        }
    }
});

test('дата всегда попадает в свой годовой блок', () => {
    for (const cat of Object.values(archive.categories)) {
        for (const item of cat.items) {
            assert.equal(
                Number(item.date.slice(0, 4)), item.year,
                `${cat.key}: «${item.title}» лежит в блоке ${item.year}, а датирован ${item.date}`
            );
        }
    }
});

test('внутри категории нет дублей', () => {
    for (const cat of Object.values(archive.categories)) {
        const seen = new Set();
        for (const item of cat.items) {
            const key = `${item.date}|${item.title}`;
            assert.ok(!seen.has(key), `${cat.key}: дубль записи ${key}`);
            seen.add(key);
        }
    }
});

test('записи отсортированы по убыванию даты', () => {
    for (const cat of Object.values(archive.categories)) {
        const dates = cat.items.map((i) => i.date);
        const sorted = [...dates].sort().reverse();
        assert.deepEqual(dates, sorted, `${cat.key}: нарушен порядок дат`);
    }
});

test('годовые блоки идут от свежего к старому и не повторяются', () => {
    for (const cat of Object.values(archive.categories)) {
        const years = cat.years.map((y) => y.year);
        assert.deepEqual(years, [...years].sort((a, b) => b - a), `${cat.key}: порядок годов`);
        assert.equal(new Set(years).size, years.length, `${cat.key}: повторяющийся год`);
    }
});

test('заголовок года отрисован в ретро-рамке', () => {
    for (const cat of Object.values(archive.categories)) {
        for (const { year, heading } of cat.years) {
            assert.equal(heading, `▓▒░ ${year} ░▒▓`);
        }
    }
});

test('у записи с голым годом дата не выводится', () => {
    for (const cat of Object.values(archive.categories)) {
        for (const item of cat.items) {
            const isBareYear = /^\d{4}$/.test(item.date);
            assert.equal(item.dated, !isBareYear, `${cat.key}: «${item.title}»`);
        }
    }
});

test('у каждой записи есть непустой заголовок', () => {
    for (const cat of Object.values(archive.categories)) {
        for (const item of cat.items) {
            assert.ok(item.title.length > 3, `${cat.key}: пустой заголовок у ${item.date}`);
        }
    }
});
