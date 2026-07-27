(function () {
'use strict';

// Field: 26x26 cells of 16px (416x416). One "block" = 2x2 cells, tanks are 1 block.
// Bricks/steel are destroyed per-cell, bullets carve a tank-wide strip — like the NES original.
const CELL = 16;
const GRID = 26;
const FIELD = CELL * GRID;
const TANK_SIZE = 32;
const BULLET_SIZE = 8;
const TOTAL_ENEMIES = 20;
const MAX_ENEMIES_ON_FIELD = 4;
const BONUS_SPAWN_NUMBERS = [4, 11, 18];
const MAX_LEVEL = 10;

const T = { EMPTY: 0, BRICK: 1, STEEL: 2, WATER: 3, TREES: 4, ICE: 5 };

const DIRS = {
    up:    { dx: 0,  dy: -1, angle: 0 },
    right: { dx: 1,  dy: 0,  angle: Math.PI / 2 },
    down:  { dx: 0,  dy: 1,  angle: Math.PI },
    left:  { dx: -1, dy: 0,  angle: -Math.PI / 2 }
};

const ENEMY_TYPES = {
    basic: { speed: 55,  bulletSpeed: 200, hp: 1, score: 100 },
    fast:  { speed: 110, bulletSpeed: 200, hp: 1, score: 200 },
    power: { speed: 75,  bulletSpeed: 360, hp: 1, score: 300 },
    armor: { speed: 55,  bulletSpeed: 200, hp: 4, score: 400 }
};

// [basic, fast, power, armor] per stage — sums to 20, close to the original tables
const LEVEL_COMPOSITIONS = {
    1:  [18, 2, 0, 0],
    2:  [14, 4, 0, 2],
    3:  [14, 4, 0, 2],
    4:  [2, 5, 10, 3],
    5:  [8, 5, 5, 2],
    6:  [9, 2, 7, 2],
    7:  [7, 4, 6, 3],
    8:  [7, 4, 7, 2],
    9:  [6, 4, 7, 3],
    10: [12, 2, 4, 2]
};

const POWERUP_TYPES = ['helmet', 'clock', 'shovel', 'star', 'grenade', 'tank'];

// 13x13 blocks: . empty, B brick, S steel, W water, T trees, I ice.
// The eagle fortress and spawn corridors are stamped in programmatically.
const LEVEL_MAPS = {
    1: [
        '.............',
        '.B.B.B.B.B.B.',
        '.B.B.B.B.B.B.',
        '.B.B.B.B.B.B.',
        '.B.B.BSB.B.B.',
        '.B.B.B.B.B.B.',
        'S.....B.....S',
        '.B.B.B.B.B.B.',
        '.B.B.B.B.B.B.',
        '.B.BB...BB.B.',
        '.B.B.B.B.B.B.',
        '.B.B.......B.',
        '.............'
    ],
    2: [
        '.............',
        '..B..B.B..B..',
        '..B..B.B..B..',
        '.BB..B.B..BB.',
        '.....WWW.....',
        '.SS.WWWWW.SS.',
        '.....WWW.....',
        '.BB..B.B..BB.',
        '..B..B.B..B..',
        '..B.SB.BS.B..',
        '..B..B.B..B..',
        '.............',
        '.............'
    ],
    3: [
        '.............',
        '.TTT.....TTT.',
        '.TBT..S..TBT.',
        '.TTT.BBB.TTT.',
        '.....B.B.....',
        '.TT.BB.BB.TT.',
        '.TT.B...B.TT.',
        '.....BBB.....',
        '.TTT.....TTT.',
        '.TBT.SSS.TBT.',
        '.TTT.....TTT.',
        '.............',
        '.............'
    ],
    4: [
        '.............',
        '.IIIIIIIIIII.',
        '.I.B.....B.I.',
        '.I.B.SSS.B.I.',
        '.I.B.....B.I.',
        '.I..BB.BB..I.',
        '.I..B...B..I.',
        '.I..BB.BB..I.',
        '.I.B.....B.I.',
        '.I.B.SSS.B.I.',
        '.I.B.....B.I.',
        '.IIIII.IIIII.',
        '.............'
    ],
    5: [
        '.............',
        '..BBB...BBB..',
        '..B.......B..',
        '..B.WWWWW.B..',
        '....W...W....',
        '.BB.W.S.W.BB.',
        '....W...W....',
        '..B.WW.WW.B..',
        '..B.......B..',
        '..BBB.S.BBB..',
        '......B......',
        '..T.......T..',
        '.............'
    ],
    6: [
        '.............',
        '.SS.......SS.',
        '....BBBBB....',
        '..B.B...B.B..',
        '..B.B.S.B.B..',
        '..B.B...B.B..',
        '..B..BBB..B..',
        '..B.......B..',
        '..BBB.T.BBB..',
        '....B.T.B....',
        '.S..B.T.B..S.',
        '.............',
        '.............'
    ],
    7: [
        '.............',
        '.BBBBB.BBBBB.',
        '.B.........B.',
        '.B.BBB.BBB.B.',
        '...B.....B...',
        '.B.B.SSS.B.B.',
        '.B...S.S...B.',
        '.B.B.SSS.B.B.',
        '...B.....B...',
        '.B.BBB.BBB.B.',
        '.B.........B.',
        '.BBBB...BBBB.',
        '.............'
    ],
    8: [
        '.............',
        '.B.T.....T.B.',
        '.B.TT.S.TT.B.',
        '.B..T...T..B.',
        '.BB.......BB.',
        '....WWWWW....',
        '.SS.W...W.SS.',
        '....WWWWW....',
        '.BB.......BB.',
        '.B..T...T..B.',
        '.B.TT.S.TT.B.',
        '.B.T.....T.B.',
        '.............'
    ],
    9: [
        '.............',
        '..S..S.S..S..',
        '.............',
        '.B.B.B.B.B.B.',
        '.B.B.B.B.B.B.',
        '......S......',
        '.SS.BB.BB.SS.',
        '......S......',
        '.B.B.B.B.B.B.',
        '.B.B.B.B.B.B.',
        '.............',
        '..S..S.S..S..',
        '.............'
    ],
    10: [
        '.............',
        '.BBBBBBBBBBB.',
        '.B....S....B.',
        '.B.BBB.BBB.B.',
        '.B.B..T..B.B.',
        '.B.B.TTT.B.B.',
        '...B.TST.B...',
        '.B.B.TTT.B.B.',
        '.B.B..T..B.B.',
        '.B.BBB.BBB.B.',
        '.B....S....B.',
        '.BBBB...BBBB.',
        '.............'
    ]
};

// Eagle fortress cells (in 16px cells): brick ring around the eagle at blocks (5..7, 11..12)
const FORTRESS_CELLS = [];
for (let by = 11; by <= 12; by++) {
    for (let bx = 5; bx <= 7; bx++) {
        if (bx === 6 && by === 12) continue; // eagle itself
        for (let cy = by * 2; cy < by * 2 + 2; cy++) {
            for (let cx = bx * 2; cx < bx * 2 + 2; cx++) {
                FORTRESS_CELLS.push([cy, cx]);
            }
        }
    }
}

const EAGLE_X = 6 * 32;   // 192
const EAGLE_Y = 12 * 32;  // 384
const PLAYER_SPAWN_X = 4 * 32;
const PLAYER_SPAWN_Y = 12 * 32;
const ENEMY_SPAWN_XS = [0, 12 * CELL, 24 * CELL];

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function rectsIntersect(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x &&
           a.y < b.y + b.height && a.y + a.height > b.y;
}

function cellRangeStart(pos) { return Math.max(0, Math.floor(pos / CELL)); }
function cellRangeEnd(pos, size) { return Math.min(GRID - 1, Math.floor((pos + size - 0.01) / CELL)); }

class Tank {
    constructor(game, x, y, direction, isPlayer, enemyType, isBonus) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = TANK_SIZE;
        this.height = TANK_SIZE;
        this.direction = direction;
        this.isPlayer = isPlayer;
        this.destroyed = false;

        if (isPlayer) {
            this.speed = 90;
            this.hp = 1;
            this.power = 0; // 0..3 star upgrades
            this.shieldUntil = game.time + 3.5;
        } else {
            this.type = enemyType;
            const def = ENEMY_TYPES[enemyType];
            this.speed = def.speed;
            this.hp = def.hp;
            this.score = def.score;
            this.bulletSpeed = def.bulletSpeed;
            this.isBonus = !!isBonus;
            this.decideTimer = 0.3 + Math.random();
            this.shieldUntil = 0;
        }

        this.lastShotAt = -10;
        this.moveAnim = 0;
        this.iceMomentum = 0;
        this.iceDir = direction;
    }

    get centerX() { return this.x + this.width / 2; }
    get centerY() { return this.y + this.height / 2; }

    hasShield() { return this.game.time < this.shieldUntil; }

    turnTo(dir) {
        if (this.direction === dir) return;
        const wasVert = this.direction === 'up' || this.direction === 'down';
        const isVert = dir === 'up' || dir === 'down';
        // Snap the perpendicular axis to the half-block grid, like the original
        if (wasVert !== isVert) {
            if (isVert) {
                const sx = Math.round(this.x / CELL) * CELL;
                if (!this.game.rectBlockedByGrid(sx, this.y, this.width, this.height)) this.x = sx;
            } else {
                const sy = Math.round(this.y / CELL) * CELL;
                if (!this.game.rectBlockedByGrid(this.x, sy, this.width, this.height)) this.y = sy;
            }
        }
        this.direction = dir;
    }

    moveForward(dt) {
        const d = DIRS[this.direction];
        const dist = this.speed * dt;
        const moved = this.game.moveEntity(this, d.dx * dist, d.dy * dist);
        if (moved) this.moveAnim += dt;
        return !moved;
    }

    onIce() {
        const r = Math.floor(this.centerY / CELL);
        const c = Math.floor(this.centerX / CELL);
        return this.game.grid[r] && this.game.grid[r][c] === T.ICE;
    }

    maxBullets() {
        if (!this.isPlayer) return 1;
        return this.power >= 2 ? 2 : 1;
    }

    shoot() {
        const game = this.game;
        if (game.time - this.lastShotAt < 0.2) return;
        const active = game.bullets.filter(b => b.owner === this && !b.destroyed).length;
        if (active >= this.maxBullets()) return;

        const d = DIRS[this.direction];
        const bx = this.centerX + d.dx * (this.width / 2) - BULLET_SIZE / 2 + d.dx * 2;
        const by = this.centerY + d.dy * (this.height / 2) - BULLET_SIZE / 2 + d.dy * 2;
        const speed = this.isPlayer
            ? (this.power >= 1 ? 360 : 220)
            : this.bulletSpeed;

        const bullet = new Bullet(bx, by, this.direction, this, speed);
        bullet.steelBreaker = this.isPlayer && this.power >= 3;
        game.bullets.push(bullet);
        if (this.isPlayer) game.sounds.playShootSound();
        this.lastShotAt = game.time;
    }

    hit() {
        if (this.hasShield()) return;
        this.hp--;
        if (this.hp <= 0) {
            this.destroyed = true;
        } else {
            this.game.sounds.playHitSteelSound();
        }
    }

    updateAI(dt) {
        const game = this.game;
        if (game.time < game.freezeUntil) return;

        this.decideTimer -= dt;
        const blocked = this.moveForward(dt);

        if (blocked || this.decideTimer <= 0) {
            this.chooseDirection(blocked);
            this.decideTimer = 0.7 + Math.random() * 2;
        }

        let fireRate = 0.6;
        if (this.isAimedAtTarget()) fireRate = 2.4;
        if (Math.random() < fireRate * dt) this.shoot();
    }

    chooseDirection(blocked) {
        const w = { up: 1, down: 3, left: 2, right: 2 };
        // In the lower half, drift toward the eagle
        if (this.y > FIELD * 0.5) {
            if (this.centerX < EAGLE_X - 8) w.right += 3;
            else if (this.centerX > EAGLE_X + TANK_SIZE + 8) w.left += 3;
            else w.down += 3;
        }
        if (blocked) w[this.direction] = 0;

        const entries = Object.entries(w).filter(([, weight]) => weight > 0);
        const total = entries.reduce((s, [, weight]) => s + weight, 0);
        let roll = Math.random() * total;
        for (const [dir, weight] of entries) {
            roll -= weight;
            if (roll <= 0) { this.turnTo(dir); return; }
        }
    }

    isAimedAtTarget() {
        const targets = [];
        if (this.game.player && !this.game.player.destroyed) targets.push(this.game.player);
        if (this.game.eagle && !this.game.eagle.destroyed) {
            targets.push({ centerX: EAGLE_X + 16, centerY: EAGLE_Y + 16 });
        }
        for (const t of targets) {
            if (Math.abs(t.centerX - this.centerX) < 12) {
                if (t.centerY < this.centerY && this.direction === 'up') return true;
                if (t.centerY > this.centerY && this.direction === 'down') return true;
            }
            if (Math.abs(t.centerY - this.centerY) < 12) {
                if (t.centerX < this.centerX && this.direction === 'left') return true;
                if (t.centerX > this.centerX && this.direction === 'right') return true;
            }
        }
        return false;
    }
}

class Bullet {
    constructor(x, y, direction, owner, speed) {
        this.x = x;
        this.y = y;
        this.width = BULLET_SIZE;
        this.height = BULLET_SIZE;
        this.direction = direction;
        this.speed = speed;
        this.owner = owner;
        this.fromPlayer = owner.isPlayer;
        this.steelBreaker = false;
        this.destroyed = false;
    }

    update(dt) {
        const d = DIRS[this.direction];
        this.x += d.dx * this.speed * dt;
        this.y += d.dy * this.speed * dt;
    }
}

class PowerUp {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.width = TANK_SIZE;
        this.height = TANK_SIZE;
        this.taken = false;
    }
}

class Explosion {
    constructor(x, y, big) {
        this.x = x;
        this.y = y;
        this.big = big;
        this.t = 0;
        this.duration = big ? 0.45 : 0.2;
        this.done = false;
    }

    update(dt) {
        this.t += dt;
        if (this.t >= this.duration) this.done = true;
    }
}

class SpawnStar {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.t = 0;
        this.ready = false;
    }

    update(dt) {
        this.t += dt;
        if (this.t >= 1) this.ready = true;
    }
}

class FloatingScore {
    constructor(x, y, value) {
        this.x = x;
        this.y = y;
        this.value = value;
        this.t = 0;
        this.done = false;
    }

    update(dt) {
        this.t += dt;
        if (this.t >= 0.8) this.done = true;
    }
}

class BattleCity {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = FIELD;
        this.canvas.height = FIELD;

        this.sounds = new BattleCitySounds();

        this.currentLevel = 1;
        this.score = 0;
        this.lives = 3;
        this.loadProgress();

        // 'stage' | 'playing' | 'levelClear' | 'transition' | 'gameover' | 'gameoverScreen' | 'victory'
        this.state = 'stage';
        this.isPaused = false;
        this.time = 0;
        this.stateTimer = 0;

        this.dirKeys = [];
        this.firing = false;
        this.animationId = null;
        this.lastFrameAt = 0;
        this.hidden = false;

        this._onKeyDown = this.onKeyDown.bind(this);
        this._onKeyUp = this.onKeyUp.bind(this);
        this._onVisibility = () => {
            if (document.hidden) this.pauseForClose();
            else if (this.isActive()) this.resumeFromOpen();
        };
        document.addEventListener('keydown', this._onKeyDown);
        document.addEventListener('keyup', this._onKeyUp);
        document.addEventListener('visibilitychange', this._onVisibility);
    }

    // ---------- lifecycle ----------

    init() {
        this.container.innerHTML = '';
        this.container.appendChild(this.canvas);
        this.createUI();
        this.startLevel(this.currentLevel);
        this.lastFrameAt = performance.now();
        this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
    }

    destroy() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.animationId = null;
        document.removeEventListener('keydown', this._onKeyDown);
        document.removeEventListener('keyup', this._onKeyUp);
        document.removeEventListener('visibilitychange', this._onVisibility);
        this.sounds.suspend();
    }

    isActive() {
        const modal = this.container.closest('#battle-city-modal');
        return modal ? modal.classList.contains('active') : true;
    }

    pauseForClose() {
        this.hidden = true;
        if (this.state === 'playing') this.isPaused = true;
        this.dirKeys = [];
        this.firing = false;
        this.sounds.suspend();
    }

    resumeFromOpen() {
        this.hidden = false;
        this.lastFrameAt = performance.now();
        this.sounds.resume();
    }

    // ---------- level setup ----------

    startLevel(levelNum) {
        this.currentLevel = levelNum;
        this.bullets = [];
        this.enemies = [];
        this.powerUps = [];
        this.explosions = [];
        this.spawnStars = [];
        this.floatingScores = [];

        this.enemiesKilled = 0;
        this.spawnedCount = 0;
        this.spawnPointIndex = 0;
        this.spawnTimer = 10; // spawn the first enemy right away
        this.freezeUntil = 0;
        this.shovelUntil = 0;
        this.playerRespawnTimer = 0;

        this.spawnQueue = this.buildSpawnList(LEVEL_COMPOSITIONS[levelNum] || LEVEL_COMPOSITIONS[1]);
        this.buildGrid(LEVEL_MAPS[levelNum] || LEVEL_MAPS[1]);

        this.eagle = { x: EAGLE_X, y: EAGLE_Y, width: TANK_SIZE, height: TANK_SIZE, destroyed: false };
        this.player = new Tank(this, PLAYER_SPAWN_X, PLAYER_SPAWN_Y, 'up', true);

        this.state = 'stage';
        this.stateTimer = 0;
        this.isPaused = false;
        this.hideRestartButton();
        this.updateUI();
        this.sounds.playStartMusic();
    }

    buildSpawnList(comp) {
        // Spread the types evenly through the 20-tank queue
        const types = ['basic', 'fast', 'power', 'armor'];
        const entries = [];
        types.forEach((type, ti) => {
            const n = comp[ti];
            for (let i = 0; i < n; i++) {
                entries.push({ type, key: (i + 0.5) / n + ti * 0.001 });
            }
        });
        entries.sort((a, b) => a.key - b.key);
        return entries.map(e => e.type);
    }

    buildGrid(blockMap) {
        this.grid = [];
        for (let r = 0; r < GRID; r++) this.grid.push(new Array(GRID).fill(T.EMPTY));

        const CHAR_TO_TILE = { B: T.BRICK, S: T.STEEL, W: T.WATER, T: T.TREES, I: T.ICE };
        for (let by = 0; by < 13; by++) {
            const row = blockMap[by] || '';
            for (let bx = 0; bx < 13; bx++) {
                const tile = CHAR_TO_TILE[row[bx]] || T.EMPTY;
                if (tile === T.EMPTY) continue;
                for (let cy = by * 2; cy < by * 2 + 2; cy++) {
                    for (let cx = bx * 2; cx < bx * 2 + 2; cx++) {
                        this.grid[cy][cx] = tile;
                    }
                }
            }
        }

        // Clear spawn areas: enemy corners/center-top and player block
        [[0, 0], [6, 0], [12, 0], [4, 12], [6, 12]].forEach(([bx, by]) => {
            for (let cy = by * 2; cy < by * 2 + 2; cy++) {
                for (let cx = bx * 2; cx < bx * 2 + 2; cx++) {
                    this.grid[cy][cx] = T.EMPTY;
                }
            }
        });

        this.setFortress(T.BRICK);
    }

    setFortress(tile) {
        FORTRESS_CELLS.forEach(([r, c]) => { this.grid[r][c] = tile; });
    }

    // ---------- input ----------

    keyToDir(e) {
        // e.code is layout-independent (works with Russian layout too)
        const byCode = {
            KeyW: 'up', ArrowUp: 'up',
            KeyS: 'down', ArrowDown: 'down',
            KeyA: 'left', ArrowLeft: 'left',
            KeyD: 'right', ArrowRight: 'right'
        };
        return byCode[e.code] || null;
    }

    onKeyDown(e) {
        if (!this.isActive()) return;

        const key = (e.key || '').toLowerCase();

        if (e.code === 'KeyP' || key === 'p') {
            e.preventDefault();
            this.togglePause();
            return;
        }
        if (e.code === 'KeyR' || key === 'r') {
            if (this.isPaused || this.state === 'gameoverScreen' || this.state === 'victory') {
                e.preventDefault();
                this.restart();
            }
            return;
        }
        if (e.code === 'Space' || e.key === ' ') {
            e.preventDefault();
            this.firing = true;
            return;
        }
        const dir = this.keyToDir(e);
        if (dir) {
            e.preventDefault();
            if (!this.dirKeys.includes(dir)) this.dirKeys.push(dir);
        }
    }

    onKeyUp(e) {
        if (e.code === 'Space' || e.key === ' ') this.firing = false;
        const dir = this.keyToDir(e);
        if (dir) this.dirKeys = this.dirKeys.filter(d => d !== dir);
    }

    pressDir(dir) {
        if (!this.dirKeys.includes(dir)) this.dirKeys.push(dir);
    }

    releaseDir(dir) {
        this.dirKeys = this.dirKeys.filter(d => d !== dir);
    }

    togglePause() {
        if (this.state !== 'playing') return;
        this.isPaused = !this.isPaused;
        this.sounds.playPauseSound();
    }

    restart() {
        if (this.state === 'victory') {
            this.currentLevel = 1;
            this.saveLevelOnly(1);
        }
        this.score = 0;
        this.lives = 3;
        this.isPaused = false;
        this.startLevel(this.currentLevel);
    }

    // ---------- collision / movement ----------

    tileSolidForTank(tile) {
        return tile === T.BRICK || tile === T.STEEL || tile === T.WATER;
    }

    rectBlockedByGrid(x, y, w, h) {
        if (x < 0 || y < 0 || x + w > FIELD || y + h > FIELD) return true;
        const r0 = cellRangeStart(y), r1 = cellRangeEnd(y, h);
        const c0 = cellRangeStart(x), c1 = cellRangeEnd(x, w);
        for (let r = r0; r <= r1; r++) {
            for (let c = c0; c <= c1; c++) {
                if (this.tileSolidForTank(this.grid[r][c])) return true;
            }
        }
        return false;
    }

    // Moves a tank, clamping against the grid, other tanks, the eagle and field bounds.
    // Returns true if any movement happened.
    moveEntity(tank, dx, dy) {
        const startX = tank.x, startY = tank.y;

        if (dx !== 0) {
            let nx = clamp(tank.x + dx, 0, FIELD - tank.width);
            const r0 = cellRangeStart(tank.y), r1 = cellRangeEnd(tank.y, tank.height);
            if (dx > 0) {
                const col = Math.floor((nx + tank.width - 0.01) / CELL);
                for (let r = r0; r <= r1; r++) {
                    if (this.tileSolidForTank(this.grid[r][col])) { nx = Math.min(nx, col * CELL - tank.width); break; }
                }
            } else {
                const col = Math.floor(nx / CELL);
                for (let r = r0; r <= r1; r++) {
                    if (this.tileSolidForTank(this.grid[r][col])) { nx = Math.max(nx, (col + 1) * CELL); break; }
                }
            }
            const candidate = { x: nx, y: tank.y, width: tank.width, height: tank.height };
            if (!this.collidesWithActors(candidate, tank)) tank.x = nx;
        }

        if (dy !== 0) {
            let ny = clamp(tank.y + dy, 0, FIELD - tank.height);
            const c0 = cellRangeStart(tank.x), c1 = cellRangeEnd(tank.x, tank.width);
            if (dy > 0) {
                const row = Math.floor((ny + tank.height - 0.01) / CELL);
                for (let c = c0; c <= c1; c++) {
                    if (this.tileSolidForTank(this.grid[row][c])) { ny = Math.min(ny, row * CELL - tank.height); break; }
                }
            } else {
                const row = Math.floor(ny / CELL);
                for (let c = c0; c <= c1; c++) {
                    if (this.tileSolidForTank(this.grid[row][c])) { ny = Math.max(ny, (row + 1) * CELL); break; }
                }
            }
            const candidate = { x: tank.x, y: ny, width: tank.width, height: tank.height };
            if (!this.collidesWithActors(candidate, tank)) tank.y = ny;
        }

        return Math.abs(tank.x - startX) > 0.01 || Math.abs(tank.y - startY) > 0.01;
    }

    collidesWithActors(rect, self) {
        if (this.eagle && rectsIntersect(rect, this.eagle)) return true;
        const tanks = [this.player, ...this.enemies];
        for (const t of tanks) {
            if (!t || t === self || t.destroyed) continue;
            if (rectsIntersect(rect, t)) return true;
        }
        return false;
    }

    // ---------- main loop ----------

    gameLoop(now) {
        this.animationId = requestAnimationFrame((t) => this.gameLoop(t));

        let dt = (now - this.lastFrameAt) / 1000;
        this.lastFrameAt = now;
        dt = clamp(dt, 0, 0.05);

        // Modal closed or tab hidden: freeze the whole game, render nothing
        if (this.hidden) return;

        this.updateState(dt);
        this.render();
    }

    updateState(dt) {
        switch (this.state) {
            case 'stage':
                this.stateTimer += dt;
                if (this.stateTimer > 1.6) {
                    this.state = 'playing';
                    this.stateTimer = 0;
                }
                break;
            case 'playing':
                if (!this.isPaused) {
                    this.time += dt;
                    this.updatePlaying(dt);
                }
                break;
            case 'levelClear':
                this.time += dt;
                this.updateEffects(dt);
                this.stateTimer += dt;
                if (this.stateTimer > 2) {
                    if (this.currentLevel >= MAX_LEVEL) {
                        this.saveBestScore();
                        this.state = 'victory';
                        this.showRestartButton();
                    } else {
                        this.state = 'transition';
                    }
                    this.stateTimer = 0;
                }
                break;
            case 'transition':
                this.stateTimer += dt;
                if (this.stateTimer > 1.8) {
                    const next = this.currentLevel + 1;
                    this.saveLevelOnly(next);
                    this.startLevel(next);
                }
                break;
            case 'gameover':
                this.time += dt;
                this.updateEffects(dt);
                this.updateBullets(dt);
                this.stateTimer += dt;
                if (this.stateTimer > 2.4) {
                    this.state = 'gameoverScreen';
                    this.stateTimer = 0;
                    this.showRestartButton();
                }
                break;
            default:
                break;
        }
    }

    updatePlaying(dt) {
        this.updateEnemySpawning(dt);
        this.updatePlayer(dt);
        this.enemies.forEach(e => e.updateAI(dt));
        this.updateBullets(dt);
        this.updatePowerUps();
        this.updateEffects(dt);

        if (this.shovelUntil > 0 && this.time >= this.shovelUntil) {
            this.shovelUntil = 0;
            this.setFortress(T.BRICK);
        }

        this.enemies = this.enemies.filter(e => !e.destroyed);

        if (this.eagle.destroyed) {
            this.triggerGameOver();
            return;
        }

        if (this.player && this.player.destroyed) {
            this.spawnExplosion(this.player.centerX, this.player.centerY, true);
            this.sounds.playExplosionSound();
            this.player = null;
            this.lives--;
            this.updateUI();
            if (this.lives <= 0) {
                this.triggerGameOver();
                return;
            }
            this.playerRespawnTimer = 1;
        }

        if (!this.player && this.playerRespawnTimer > 0) {
            this.playerRespawnTimer -= dt;
            if (this.playerRespawnTimer <= 0) {
                this.player = new Tank(this, PLAYER_SPAWN_X, PLAYER_SPAWN_Y, 'up', true);
            }
        }

        if (this.spawnQueue.length === 0 && this.spawnStars.length === 0 &&
            this.enemies.length === 0 && this.enemiesKilled >= this.spawnedCount) {
            this.sounds.playLevelCompleteSound();
            this.saveBestScore();
            this.state = 'levelClear';
            this.stateTimer = 0;
        }
    }

    updateEnemySpawning(dt) {
        this.spawnTimer += dt;
        const delay = Math.max(1.4, 3 - (this.currentLevel - 1) * 0.15);
        const pending = this.spawnStars.length;

        if (this.spawnQueue.length > 0 &&
            this.enemies.length + pending < MAX_ENEMIES_ON_FIELD &&
            this.spawnTimer >= delay) {
            this.spawnTimer = 0;
            const x = ENEMY_SPAWN_XS[this.spawnPointIndex % ENEMY_SPAWN_XS.length];
            this.spawnPointIndex++;
            this.spawnStars.push(new SpawnStar(x, 0));
        }

        this.spawnStars.forEach(star => star.update(dt));
        this.spawnStars = this.spawnStars.filter(star => {
            if (!star.ready) return true;
            const rect = { x: star.x, y: star.y, width: TANK_SIZE, height: TANK_SIZE };
            if (this.collidesWithActors(rect, null)) return true; // wait until the spot is free
            const type = this.spawnQueue.shift();
            if (!type) return false;
            this.spawnedCount++;
            const isBonus = BONUS_SPAWN_NUMBERS.includes(this.spawnedCount);
            if (isBonus) this.sounds.playPowerUpAppearSound();
            this.enemies.push(new Tank(this, star.x, star.y, 'down', false, type, isBonus));
            this.updateUI();
            return false;
        });
    }

    updatePlayer(dt) {
        const player = this.player;
        if (!player) return;

        const dir = this.dirKeys[this.dirKeys.length - 1];
        if (dir) {
            player.turnTo(dir);
            player.moveForward(dt);
            if (player.onIce()) {
                player.iceMomentum = 0.25;
                player.iceDir = player.direction;
            } else {
                player.iceMomentum = 0;
            }
            if (Math.random() < 3 * dt) this.sounds.playMoveSound();
        } else if (player.iceMomentum > 0) {
            // slide on ice after releasing controls
            player.iceMomentum -= dt;
            const d = DIRS[player.iceDir];
            this.moveEntity(player, d.dx * player.speed * 0.7 * dt, d.dy * player.speed * 0.7 * dt);
            if (!player.onIce()) player.iceMomentum = 0;
        }

        if (this.firing) player.shoot();
    }

    updateBullets(dt) {
        this.bullets.forEach(bullet => {
            if (bullet.destroyed) return;
            bullet.update(dt);

            // field bounds
            if (bullet.x < 0 || bullet.x + bullet.width > FIELD ||
                bullet.y < 0 || bullet.y + bullet.height > FIELD) {
                bullet.x = clamp(bullet.x, 0, FIELD - bullet.width);
                bullet.y = clamp(bullet.y, 0, FIELD - bullet.height);
                bullet.destroyed = true;
                this.spawnExplosion(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, false);
                if (bullet.fromPlayer) this.sounds.playHitSteelSound();
                return;
            }

            // walls
            if (this.bulletGridCollide(bullet)) return;

            // bullet vs bullet (opposing sides cancel out)
            for (const other of this.bullets) {
                if (other === bullet || other.destroyed) continue;
                if (other.fromPlayer !== bullet.fromPlayer && rectsIntersect(bullet, other)) {
                    bullet.destroyed = true;
                    other.destroyed = true;
                    return;
                }
            }

            // eagle — any side can destroy it
            if (!this.eagle.destroyed && rectsIntersect(bullet, this.eagle)) {
                bullet.destroyed = true;
                this.eagle.destroyed = true;
                this.spawnExplosion(EAGLE_X + 16, EAGLE_Y + 16, true);
                this.sounds.playExplosionSound();
                return;
            }

            // tanks
            if (bullet.fromPlayer) {
                for (const enemy of this.enemies) {
                    if (enemy.destroyed) continue;
                    if (rectsIntersect(bullet, enemy)) {
                        bullet.destroyed = true;
                        enemy.hit();
                        if (enemy.destroyed) this.onEnemyKilled(enemy, true);
                        return;
                    }
                }
            } else if (this.player && !this.player.destroyed && rectsIntersect(bullet, this.player)) {
                bullet.destroyed = true;
                if (!this.player.hasShield()) {
                    this.player.hit();
                }
                return;
            }
        });

        this.bullets = this.bullets.filter(b => !b.destroyed);
    }

    bulletGridCollide(bullet) {
        const r0 = cellRangeStart(bullet.y), r1 = cellRangeEnd(bullet.y, bullet.height);
        const c0 = cellRangeStart(bullet.x), c1 = cellRangeEnd(bullet.x, bullet.width);
        const isShootable = (t) => t === T.BRICK || t === T.STEEL;

        const solidRows = [], solidCols = [];
        for (let r = r0; r <= r1; r++) {
            for (let c = c0; c <= c1; c++) {
                if (isShootable(this.grid[r][c])) { solidRows.push(r); solidCols.push(c); }
            }
        }
        if (!solidRows.length) return false;

        let hitBrick = false, hitSteel = false, brokeSteel = false;
        const destroyCell = (r, c) => {
            if (r < 0 || r >= GRID || c < 0 || c >= GRID) return;
            const tile = this.grid[r][c];
            if (tile === T.BRICK) {
                this.grid[r][c] = T.EMPTY;
                hitBrick = true;
            } else if (tile === T.STEEL) {
                if (bullet.steelBreaker) {
                    this.grid[r][c] = T.EMPTY;
                    brokeSteel = true;
                } else {
                    hitSteel = true;
                }
            }
        };

        // Carve a tank-wide strip, one cell deep, on the impact side — like the original
        if (bullet.direction === 'up' || bullet.direction === 'down') {
            const row = bullet.direction === 'up' ? Math.min(...solidRows) : Math.max(...solidRows);
            const cx = bullet.x + bullet.width / 2;
            const sc0 = Math.floor((cx - CELL) / CELL);
            const sc1 = Math.floor((cx + CELL - 0.01) / CELL);
            for (let c = sc0; c <= sc1; c++) destroyCell(row, c);
        } else {
            const col = bullet.direction === 'left' ? Math.min(...solidCols) : Math.max(...solidCols);
            const cy = bullet.y + bullet.height / 2;
            const sr0 = Math.floor((cy - CELL) / CELL);
            const sr1 = Math.floor((cy + CELL - 0.01) / CELL);
            for (let r = sr0; r <= sr1; r++) destroyCell(r, col);
        }

        bullet.destroyed = true;
        this.spawnExplosion(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, false);
        if (bullet.fromPlayer) {
            if (hitBrick || brokeSteel) this.sounds.playHitWallSound();
            else if (hitSteel) this.sounds.playHitSteelSound();
        }
        return true;
    }

    onEnemyKilled(enemy, givePoints) {
        this.enemiesKilled++;
        this.spawnExplosion(enemy.centerX, enemy.centerY, true);
        this.sounds.playExplosionSound();
        if (givePoints) {
            this.score += enemy.score;
            this.floatingScores.push(new FloatingScore(enemy.centerX, enemy.centerY, enemy.score));
        }
        if (enemy.isBonus) this.spawnPowerUp();
        this.updateUI();
    }

    spawnPowerUp() {
        const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
        // Random half-block aligned spot away from the eagle
        for (let attempt = 0; attempt < 30; attempt++) {
            const x = Math.floor(Math.random() * (GRID - 2)) * CELL;
            const y = Math.floor(Math.random() * (GRID - 2)) * CELL;
            const rect = { x, y, width: TANK_SIZE, height: TANK_SIZE };
            if (rectsIntersect(rect, this.eagle)) continue;
            this.powerUps = []; // only one power-up on the field, like the original
            this.powerUps.push(new PowerUp(type, x, y));
            this.sounds.playPowerUpAppearSound();
            return;
        }
    }

    updatePowerUps() {
        if (!this.player || this.player.destroyed) return;
        this.powerUps.forEach(p => {
            if (p.taken || !rectsIntersect(p, this.player)) return;
            p.taken = true;
            this.score += 500;
            this.floatingScores.push(new FloatingScore(p.x + 16, p.y + 16, 500));
            this.applyPowerUp(p.type);
        });
        this.powerUps = this.powerUps.filter(p => !p.taken);
    }

    applyPowerUp(type) {
        switch (type) {
            case 'helmet':
                this.player.shieldUntil = this.time + 10;
                this.sounds.playPowerUpPickupSound();
                break;
            case 'clock':
                this.freezeUntil = this.time + 10;
                this.sounds.playPowerUpPickupSound();
                break;
            case 'shovel':
                this.shovelUntil = this.time + 15;
                this.setFortress(T.STEEL);
                this.sounds.playPowerUpPickupSound();
                break;
            case 'star':
                this.player.power = Math.min(3, this.player.power + 1);
                this.sounds.playPowerUpPickupSound();
                break;
            case 'grenade':
                [...this.enemies].forEach(enemy => {
                    enemy.destroyed = true;
                    this.onEnemyKilled(enemy, false);
                });
                this.enemies = [];
                break;
            case 'tank':
                this.lives++;
                this.sounds.playExtraLifeSound();
                break;
        }
        this.updateUI();
    }

    updateEffects(dt) {
        this.explosions.forEach(e => e.update(dt));
        this.explosions = this.explosions.filter(e => !e.done);
        this.floatingScores.forEach(f => f.update(dt));
        this.floatingScores = this.floatingScores.filter(f => !f.done);
    }

    spawnExplosion(cx, cy, big) {
        this.explosions.push(new Explosion(cx, cy, big));
    }

    triggerGameOver() {
        if (this.state === 'gameover' || this.state === 'gameoverScreen') return;
        this.state = 'gameover';
        this.stateTimer = 0;
        this.dirKeys = [];
        this.firing = false;
        this.saveBestScore();
        this.sounds.playGameOverSound();
    }

    // ---------- persistence ----------

    loadProgress() {
        const saved = parseInt(localStorage.getItem('battleCityLevel') || '0');
        if (!Number.isNaN(saved) && saved > 0) {
            this.currentLevel = clamp(saved, 1, MAX_LEVEL);
        }
    }

    saveLevelOnly(level) {
        try { localStorage.setItem('battleCityLevel', String(level)); } catch (_) {}
    }

    saveBestScore() {
        if (this.score > this.getBestScore()) {
            try {
                localStorage.setItem('battleCityBestScore', String(this.score));
            } catch (_) {}
        }
        const el = document.getElementById('bc-best');
        if (el) el.textContent = this.getBestScore();
    }

    getBestScore() {
        return parseInt(localStorage.getItem('battleCityBestScore') || '0');
    }

    // ---------- DOM UI ----------

    createUI() {
        const ui = document.createElement('div');
        ui.className = 'battle-city-ui';
        ui.innerHTML = `
            <div class="bc-stats">
                <div class="bc-stat">УР: <span id="bc-level">${this.currentLevel}</span></div>
                <div class="bc-stat">ОЧКИ: <span id="bc-score">${this.score}</span></div>
                <div class="bc-stat">ЖИЗНИ: <span id="bc-lives">${this.lives}</span></div>
                <div class="bc-stat">ВРАГИ: <span id="bc-enemies">${TOTAL_ENEMIES}</span> | УБ: <span id="bc-killed">0</span></div>
                <div class="bc-stat">РЕКОРД: <span id="bc-best">${this.getBestScore()}</span></div>
                <div class="bc-stat bc-sound-toggle" id="bc-sound-toggle">🔊 ЗВУК ВКЛ</div>
            </div>
            <div class="bc-controls">
                <div class="bc-help">WASD/Стрелки — движение, ПРОБЕЛ — огонь, P — пауза, R — рестарт (на паузе)</div>
            </div>
            <div class="bc-mobile-controls" id="bc-mobile-controls">
                <div class="bc-dpad">
                    <button class="bc-btn bc-up" data-dir="up">▲</button>
                    <button class="bc-btn bc-left" data-dir="left">◄</button>
                    <button class="bc-btn bc-down" data-dir="down">▼</button>
                    <button class="bc-btn bc-right" data-dir="right">►</button>
                </div>
                <div class="bc-action-btns">
                    <button class="bc-btn bc-fire" data-action="fire">ОГОНЬ</button>
                    <button class="bc-btn bc-pause" data-action="pause">ПАУЗА</button>
                    <button class="bc-btn bc-restart" id="bc-restart-btn" style="display: none;">РЕСТАРТ</button>
                </div>
            </div>
        `;
        this.container.appendChild(ui);

        const soundToggle = document.getElementById('bc-sound-toggle');
        soundToggle.addEventListener('click', () => {
            const enabled = this.sounds.toggle();
            soundToggle.textContent = enabled ? '🔊 ЗВУК ВКЛ' : '🔇 ЗВУК ВЫКЛ';
        });

        this.initMobileControls(ui);
    }

    initMobileControls(ui) {
        ui.querySelectorAll('.bc-btn[data-dir]').forEach(btn => {
            const dir = btn.getAttribute('data-dir');
            const press = (e) => { e.preventDefault(); this.pressDir(dir); btn.classList.add('active'); };
            const release = (e) => { e.preventDefault(); this.releaseDir(dir); btn.classList.remove('active'); };
            btn.addEventListener('touchstart', press, { passive: false });
            btn.addEventListener('touchend', release, { passive: false });
            btn.addEventListener('touchcancel', release, { passive: false });
            btn.addEventListener('mousedown', press);
            btn.addEventListener('mouseup', release);
            btn.addEventListener('mouseleave', release);
        });

        const fireBtn = ui.querySelector('.bc-btn[data-action="fire"]');
        if (fireBtn) {
            const press = (e) => { e.preventDefault(); this.firing = true; fireBtn.classList.add('active'); };
            const release = (e) => { e.preventDefault(); this.firing = false; fireBtn.classList.remove('active'); };
            fireBtn.addEventListener('touchstart', press, { passive: false });
            fireBtn.addEventListener('touchend', release, { passive: false });
            fireBtn.addEventListener('touchcancel', release, { passive: false });
            fireBtn.addEventListener('mousedown', press);
            fireBtn.addEventListener('mouseup', release);
            fireBtn.addEventListener('mouseleave', release);
        }

        const pauseBtn = ui.querySelector('.bc-btn[data-action="pause"]');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', (e) => { e.preventDefault(); this.togglePause(); });
        }

        const restartBtn = ui.querySelector('#bc-restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', (e) => { e.preventDefault(); this.restart(); });
        }
    }

    showRestartButton() {
        const btn = document.getElementById('bc-restart-btn');
        if (btn) btn.style.display = 'block';
    }

    hideRestartButton() {
        const btn = document.getElementById('bc-restart-btn');
        if (btn) btn.style.display = 'none';
    }

    updateUI() {
        const set = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        };
        set('bc-level', this.currentLevel);
        set('bc-score', this.score);
        set('bc-lives', this.lives);
        // a spawn star's tank is still in spawnQueue, so don't count stars separately
        set('bc-enemies', this.spawnQueue.length + this.enemies.length);
        set('bc-killed', this.enemiesKilled);
        set('bc-best', this.getBestScore());
    }

    // ---------- rendering ----------

    render() {
        const ctx = this.ctx;

        if (this.state === 'stage') {
            this.drawStageCurtain(ctx);
            return;
        }
        if (this.state === 'victory') {
            this.drawField(ctx);
            this.drawOverlay(ctx, 'ПОБЕДА!', 'Игра пройдена! R — сыграть ещё', '#00ff41');
            return;
        }
        if (this.state === 'gameoverScreen') {
            this.drawField(ctx);
            this.drawOverlay(ctx, 'КОНЕЦ ИГРЫ', 'R или РЕСТАРТ — попробовать снова', '#ff3355');
            return;
        }

        this.drawField(ctx);

        if (this.state === 'transition') {
            this.drawOverlay(ctx, `УРОВЕНЬ ${this.currentLevel}`, 'ПРОЙДЕН!', '#00f5d4');
        } else if (this.state === 'gameover') {
            // GAME OVER rises from the bottom of the field, like the original
            const progress = clamp(this.stateTimer / 2, 0, 1);
            const y = FIELD - progress * (FIELD / 2);
            ctx.fillStyle = '#ff3355';
            ctx.font = '22px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', FIELD / 2, y);
        } else if (this.isPaused) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(0, 0, FIELD, FIELD);
            if (Math.floor(performance.now() / 400) % 2 === 0) {
                ctx.fillStyle = '#ffb300';
                ctx.font = '24px "Press Start 2P", monospace';
                ctx.textAlign = 'center';
                ctx.fillText('ПАУЗА', FIELD / 2, FIELD / 2 - 10);
            }
            ctx.fillStyle = '#00ff41';
            ctx.font = '10px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('P — продолжить, R — рестарт', FIELD / 2, FIELD / 2 + 26);
        }
    }

    drawStageCurtain(ctx) {
        ctx.fillStyle = '#636363';
        ctx.fillRect(0, 0, FIELD, FIELD);
        ctx.fillStyle = '#000';
        ctx.font = '18px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`УРОВЕНЬ ${this.currentLevel}`, FIELD / 2, FIELD / 2 + 6);
    }

    drawOverlay(ctx, title, subtitle, color) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, FIELD, FIELD);
        ctx.fillStyle = color;
        ctx.font = '20px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(title, FIELD / 2, FIELD / 2 - 14);
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillText(subtitle, FIELD / 2, FIELD / 2 + 20);
    }

    drawField(ctx) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, FIELD, FIELD);

        // ground tiles (ice, water) and walls
        for (let r = 0; r < GRID; r++) {
            for (let c = 0; c < GRID; c++) {
                const tile = this.grid[r][c];
                if (tile === T.EMPTY || tile === T.TREES) continue;
                const x = c * CELL, y = r * CELL;
                if (tile === T.BRICK) this.drawBrickCell(ctx, x, y);
                else if (tile === T.STEEL) this.drawSteelCell(ctx, x, y);
                else if (tile === T.WATER) this.drawWaterCell(ctx, x, y);
                else if (tile === T.ICE) this.drawIceCell(ctx, x, y);
            }
        }

        this.drawEagle(ctx);

        this.bullets.forEach(b => {
            ctx.fillStyle = '#e8e8e8';
            ctx.fillRect(Math.floor(b.x), Math.floor(b.y), b.width, b.height);
            ctx.fillStyle = '#909090';
            const d = DIRS[b.direction];
            ctx.fillRect(Math.floor(b.x - d.dx * 2), Math.floor(b.y - d.dy * 2), b.width, b.height);
        });

        if (this.player && !this.player.destroyed) this.drawTank(ctx, this.player);
        this.enemies.forEach(e => this.drawTank(ctx, e));

        // trees overlay hides tanks beneath, like the original
        for (let r = 0; r < GRID; r++) {
            for (let c = 0; c < GRID; c++) {
                if (this.grid[r][c] === T.TREES) this.drawTreesCell(ctx, c * CELL, r * CELL);
            }
        }

        this.spawnStars.forEach(s => this.drawSpawnStar(ctx, s));
        this.powerUps.forEach(p => this.drawPowerUp(ctx, p));
        this.explosions.forEach(e => this.drawExplosion(ctx, e));
        this.floatingScores.forEach(f => {
            ctx.globalAlpha = 1 - f.t / 0.8;
            ctx.fillStyle = '#ffffff';
            ctx.font = '9px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(String(f.value), f.x, f.y - f.t * 24);
            ctx.globalAlpha = 1;
        });
    }

    drawBrickCell(ctx, x, y) {
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(x, y, CELL, CELL);
        ctx.fillStyle = '#b5400e';
        ctx.fillRect(x, y, 7, 7);
        ctx.fillRect(x + 9, y, 7, 7);
        ctx.fillRect(x + 4, y + 9, 8, 7);
        ctx.fillRect(x, y + 9, 3, 7);
        ctx.fillRect(x + 13, y + 9, 3, 7);
        ctx.fillStyle = '#e07038';
        ctx.fillRect(x, y, 7, 2);
        ctx.fillRect(x + 9, y, 7, 2);
        ctx.fillRect(x + 4, y + 9, 8, 2);
    }

    drawSteelCell(ctx, x, y) {
        ctx.fillStyle = '#adadad';
        ctx.fillRect(x, y, CELL, CELL);
        ctx.fillStyle = '#efefef';
        ctx.fillRect(x + 2, y + 2, CELL - 4, CELL - 4);
        ctx.fillStyle = '#636363';
        ctx.fillRect(x + 5, y + 5, CELL - 10, CELL - 10);
    }

    drawWaterCell(ctx, x, y) {
        ctx.fillStyle = '#1040c8';
        ctx.fillRect(x, y, CELL, CELL);
        const phase = Math.floor(performance.now() / 500) % 2;
        ctx.fillStyle = '#4a90ff';
        if (phase === 0) {
            ctx.fillRect(x + 2, y + 3, 5, 2);
            ctx.fillRect(x + 9, y + 10, 5, 2);
        } else {
            ctx.fillRect(x + 9, y + 3, 5, 2);
            ctx.fillRect(x + 2, y + 10, 5, 2);
        }
    }

    drawIceCell(ctx, x, y) {
        ctx.fillStyle = '#a8c0c8';
        ctx.fillRect(x, y, CELL, CELL);
        ctx.fillStyle = '#e0f0f4';
        ctx.fillRect(x + 2, y + 2, 3, 3);
        ctx.fillRect(x + 10, y + 8, 3, 3);
        ctx.fillRect(x + 5, y + 12, 2, 2);
    }

    drawTreesCell(ctx, x, y) {
        ctx.fillStyle = 'rgba(10, 82, 10, 0.92)';
        ctx.fillRect(x, y, CELL, CELL);
        ctx.fillStyle = 'rgba(47, 191, 47, 0.9)';
        // deterministic speckle pattern per cell
        const seed = (x * 7 + y * 13) % 5;
        const spots = [[1, 2], [8, 1], [12, 6], [4, 8], [9, 11], [2, 12], [13, 13]];
        spots.forEach(([sx, sy], i) => {
            if ((i + seed) % 3 !== 0) ctx.fillRect(x + sx, y + sy, 3, 3);
        });
    }

    drawEagle(ctx) {
        const x = EAGLE_X, y = EAGLE_Y;
        if (this.eagle.destroyed) {
            ctx.fillStyle = '#4a4a4a';
            ctx.fillRect(x + 2, y + 12, 28, 20);
            ctx.fillStyle = '#787878';
            ctx.fillRect(x + 6, y + 16, 8, 8);
            ctx.fillRect(x + 18, y + 20, 8, 6);
            return;
        }
        // pedestal
        ctx.fillStyle = '#787878';
        ctx.fillRect(x + 2, y + 24, 28, 8);
        // wings
        ctx.fillStyle = '#c87800';
        ctx.fillRect(x + 2, y + 10, 28, 8);
        ctx.fillRect(x + 6, y + 6, 20, 6);
        // body
        ctx.fillStyle = '#e8a000';
        ctx.fillRect(x + 12, y + 4, 8, 20);
        // head
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 14, y + 2, 4, 4);
        // beak
        ctx.fillStyle = '#ff6000';
        ctx.fillRect(x + 18, y + 3, 3, 2);
    }

    drawTank(ctx, tank) {
        const t = performance.now();
        let base, light, dark;

        if (tank.isPlayer) {
            base = '#e8b800'; light = '#ffe97f'; dark = '#8a6d00';
        } else if (tank.isBonus && Math.floor(t / 200) % 2 === 0) {
            base = '#e05050'; light = '#ff9090'; dark = '#802020';
        } else if (tank.type === 'armor') {
            const armorColors = {
                4: ['#d8d8d8', '#ffffff', '#707070'],
                3: ['#a8d8a8', '#d8ffd8', '#4a7a4a'],
                2: ['#d8d888', '#ffffb0', '#7a7a30'],
                1: ['#b8b8b8', '#e0e0e0', '#606060']
            };
            [base, light, dark] = armorColors[clamp(tank.hp, 1, 4)];
        } else if (tank.type === 'fast') {
            base = '#a8bcd0'; light = '#dce8f4'; dark = '#54606c';
        } else if (tank.type === 'power') {
            base = '#c8a890'; light = '#ecd4c0'; dark = '#6c5240';
        } else {
            base = '#b8b8b8'; light = '#e8e8e8'; dark = '#606060';
        }

        ctx.save();
        ctx.translate(Math.floor(tank.centerX), Math.floor(tank.centerY));
        ctx.rotate(DIRS[tank.direction].angle);

        const u = 2; // sprite pixel = 2 canvas px, sprite is 16x16 units centered
        const px = (cx, cy, w, h) => ctx.fillRect(cx * u - 16, cy * u - 16, w * u, h * u);
        const trackFrame = Math.floor(tank.moveAnim * 16) % 2;

        // tracks
        ctx.fillStyle = dark;
        px(0, 1, 3, 14);
        px(13, 1, 3, 14);
        ctx.fillStyle = light;
        for (let i = 1 + trackFrame; i < 15; i += 2) {
            px(0, i, 3, 1);
            px(13, i, 3, 1);
        }

        // hull
        ctx.fillStyle = base;
        px(3, 4, 10, 11);
        ctx.fillStyle = dark;
        px(3, 14, 10, 1);
        // turret
        ctx.fillStyle = light;
        px(5, 6, 6, 7);
        ctx.fillStyle = base;
        px(6, 7, 4, 5);
        // barrel
        ctx.fillStyle = base;
        px(7, 0, 2, 7);
        ctx.fillStyle = light;
        px(7, 0, 1, 7);

        ctx.restore();

        // shield effect
        if (tank.hasShield && tank.hasShield()) {
            const frame = Math.floor(t / 100) % 2;
            ctx.strokeStyle = frame ? '#ffffff' : '#00f5d4';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 4]);
            ctx.strokeRect(tank.x - 2, tank.y - 2, tank.width + 4, tank.height + 4);
            ctx.setLineDash([]);
        }
    }

    drawSpawnStar(ctx, star) {
        const scale = 0.4 + 0.6 * Math.abs(Math.sin(star.t * Math.PI * 3));
        const cx = star.x + TANK_SIZE / 2;
        const cy = star.y + TANK_SIZE / 2;
        const r = 14 * scale;
        ctx.fillStyle = '#ff4040';
        ctx.beginPath();
        ctx.moveTo(cx, cy - r);
        ctx.lineTo(cx + r * 0.3, cy - r * 0.3);
        ctx.lineTo(cx + r, cy);
        ctx.lineTo(cx + r * 0.3, cy + r * 0.3);
        ctx.lineTo(cx, cy + r);
        ctx.lineTo(cx - r * 0.3, cy + r * 0.3);
        ctx.lineTo(cx - r, cy);
        ctx.lineTo(cx - r * 0.3, cy - r * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 2, cy - 2, 4, 4);
    }

    drawPowerUp(ctx, p) {
        if (Math.floor(performance.now() / 250) % 2 === 0) return; // blink

        const { x, y } = p;
        ctx.fillStyle = '#d84848';
        ctx.fillRect(x, y, 32, 32);
        ctx.fillStyle = '#101020';
        ctx.fillRect(x + 3, y + 3, 26, 26);
        ctx.fillStyle = '#ffffff';

        switch (p.type) {
            case 'helmet':
                ctx.beginPath();
                ctx.arc(x + 16, y + 18, 9, Math.PI, 0);
                ctx.fill();
                ctx.fillRect(x + 6, y + 18, 20, 4);
                break;
            case 'clock':
                ctx.beginPath();
                ctx.arc(x + 16, y + 16, 10, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#101020';
                ctx.fillRect(x + 15, y + 9, 2, 8);
                ctx.fillRect(x + 15, y + 15, 6, 2);
                break;
            case 'shovel':
                ctx.fillRect(x + 14, y + 6, 4, 14);
                ctx.fillRect(x + 10, y + 20, 12, 6);
                break;
            case 'star':
                ctx.beginPath();
                ctx.moveTo(x + 16, y + 6);
                ctx.lineTo(x + 19, y + 13);
                ctx.lineTo(x + 26, y + 13);
                ctx.lineTo(x + 20, y + 18);
                ctx.lineTo(x + 23, y + 26);
                ctx.lineTo(x + 16, y + 21);
                ctx.lineTo(x + 9, y + 26);
                ctx.lineTo(x + 12, y + 18);
                ctx.lineTo(x + 6, y + 13);
                ctx.lineTo(x + 13, y + 13);
                ctx.closePath();
                ctx.fill();
                break;
            case 'grenade':
                ctx.beginPath();
                ctx.arc(x + 16, y + 18, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillRect(x + 14, y + 7, 4, 5);
                ctx.fillStyle = '#ffb300';
                ctx.fillRect(x + 17, y + 4, 3, 3);
                break;
            case 'tank':
                ctx.fillRect(x + 8, y + 12, 16, 12);
                ctx.fillRect(x + 14, y + 6, 4, 8);
                ctx.fillStyle = '#101020';
                ctx.fillRect(x + 12, y + 16, 8, 4);
                break;
        }
    }

    drawExplosion(ctx, e) {
        const progress = e.t / e.duration;
        const maxR = e.big ? 22 : 10;
        const r = maxR * (progress < 0.6 ? progress / 0.6 : 1);
        const cx = e.x, cy = e.y;

        ctx.fillStyle = '#ff5020';
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffb300';
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.65, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.3, 0, Math.PI * 2);
        ctx.fill();

        if (e.big && progress > 0.5) {
            ctx.fillStyle = '#ff5020';
            const spread = r * 1.2;
            [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => {
                ctx.fillRect(cx + sx * spread - 3, cy + sy * spread - 3, 6, 6);
            });
        }
    }
}

window.BattleCity = BattleCity;

})();
