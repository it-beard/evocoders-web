class BattleCity {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.tileSize = 16;
        this.gridWidth = 26;
        this.gridHeight = 26;
        this.canvas.width = this.gridWidth * this.tileSize;
        this.canvas.height = this.gridHeight * this.tileSize;
        
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.walls = [];
        this.eagle = null;
        this.powerUps = [];
        
        this.currentLevel = 1;
        this.score = 0;
        this.lives = 3;
        this.enemiesKilled = 0;
        this.enemiesLeft = 20;
        this.enemySpawnQueue = 20;
        this.maxEnemiesOnField = 4;
        this.lastEnemySpawn = 0;
        this.enemySpawnDelay = 3000;
        
        this.keys = {};
        this.isPaused = false;
        this.isGameOver = false;
        this.isVictory = false;
        this.animationId = null;
        this.lastTime = 0;
        
        this.sounds = new BattleCitySounds();
        
        this.loadProgress();
        this.initControls();
    }

    init() {
        this.container.innerHTML = '';
        this.container.appendChild(this.canvas);
        this.createUI();
        
        this.loadLevel(this.currentLevel);
        this.updateUI();
        this.lastTime = performance.now();
        this.showStageScreen(() => {
            const musicDuration = this.sounds.playStartMusic();
            setTimeout(() => {
                if (!this.isPaused && !this.isGameOver) {
                    this.gameLoop();
                }
            }, musicDuration || 4000);
        });
    }

    createUI() {
        const ui = document.createElement('div');
        ui.className = 'battle-city-ui';
        ui.innerHTML = `
            <div class="bc-stats">
                <div class="bc-stat">УР: <span id="bc-level">${this.currentLevel}</span></div>
                <div class="bc-stat">ОЧКИ: <span id="bc-score">${this.score}</span></div>
                <div class="bc-stat">ЖИЗНИ: <span id="bc-lives">${this.lives}</span></div>
                <div class="bc-stat">ОСТ: <span id="bc-enemies">${this.enemiesLeft}</span> | УБ: <span id="bc-killed">${this.enemiesKilled}</span></div>
                <div class="bc-stat">РЕКОРД: <span id="bc-best">${this.getBestScore()}</span></div>
                <div class="bc-stat bc-sound-toggle" id="bc-sound-toggle">🔊 ЗВУК ВКЛ</div>
            </div>
            <div class="bc-controls">
                <div class="bc-help">WASD/Стрелки - Движение, ПРОБЕЛ - Огонь, P - Пауза, R - Рестарт</div>
            </div>
            <div class="bc-mobile-controls" id="bc-mobile-controls">
                <div class="bc-dpad">
                    <button class="bc-btn bc-up" data-key="arrowup">▲</button>
                    <button class="bc-btn bc-left" data-key="arrowleft">◄</button>
                    <button class="bc-btn bc-down" data-key="arrowdown">▼</button>
                    <button class="bc-btn bc-right" data-key="arrowright">►</button>
                </div>
                <div class="bc-action-btns">
                    <button class="bc-btn bc-fire" data-key=" ">ОГОНЬ</button>
                    <button class="bc-btn bc-pause" data-key="p">ПАУЗА</button>
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

        this.initMobileControls();
    }

    initControls() {
        document.addEventListener('keydown', (e) => {
            // Layout-independent handling for letter keys
            const keyLower = (e.key || '').toLowerCase();
            this.keys[keyLower] = true;
            
            if (e.code === 'KeyP' || keyLower === 'p') {
                e.preventDefault();
                e.stopPropagation();
                this.togglePause();
                return;
            }
            if (e.code === 'KeyR' || keyLower === 'r') {
                // R allowed only when paused or on end screens/messages
                if (this.isPaused || this.messageCallback || this.isGameOver || this.isVictory) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.restart();
                }
                return;
            }
            if (e.code === 'Space' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                this.keys[' '] = true;
                return;
            }
        });

        document.addEventListener('keyup', (e) => {
            const keyLower = (e.key || '').toLowerCase();
            this.keys[keyLower] = false;
        });
    }

    initMobileControls() {
        const buttons = document.querySelectorAll('.bc-mobile-controls .bc-btn');
        const restartBtn = document.getElementById('bc-restart-btn');
        
        buttons.forEach(btn => {
            const key = btn.getAttribute('data-key');
            
            if (key) {
                const handlePress = (e) => {
                    e.preventDefault();
                    this.keys[key] = true;
                    btn.classList.add('active');
                    
                    if (key === ' ' && this.player && !this.isPaused && !this.isGameOver) {
                        this.player.shoot();
                    }
                    if (key === 'p') {
                        this.togglePause();
                    }
                };
                
                const handleRelease = (e) => {
                    e.preventDefault();
                    this.keys[key] = false;
                    btn.classList.remove('active');
                };
                
                btn.addEventListener('touchstart', handlePress, { passive: false });
                btn.addEventListener('touchend', handleRelease, { passive: false });
                btn.addEventListener('touchcancel', handleRelease, { passive: false });
                
                btn.addEventListener('mousedown', handlePress);
                btn.addEventListener('mouseup', handleRelease);
                btn.addEventListener('mouseleave', handleRelease);
            }
        });

        if (restartBtn) {
            restartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.restart();
            });
        }
    }

    showRestartButton() {
        const restartBtn = document.getElementById('bc-restart-btn');
        if (restartBtn) {
            restartBtn.style.display = 'block';
        }
    }

    hideRestartButton() {
        const restartBtn = document.getElementById('bc-restart-btn');
        if (restartBtn) {
            restartBtn.style.display = 'none';
        }
    }

    loadLevel(levelNum) {
        this.bullets = [];
        this.enemies = [];
        this.walls = [];
        this.powerUps = [];
        this.enemiesLeft = 20;
        this.enemySpawnQueue = 20;
        this.enemiesKilled = 0;
        this.lastEnemySpawn = 0;
        
        const levelMap = this.getLevelMap(levelNum);
        this.parseMap(levelMap);
        
        this.player = new Tank(this, 9 * this.tileSize, 24 * this.tileSize, 'up', true);
    }

    getLevelMap(level) {
        const maps = {
            1: [
                '                          ',
                '                          ',
                '  ####  ####  ####  ####  ',
                '  ####  ####  ####  ####  ',
                '  ####  ####  ####  ####  ',
                '  ####  ####  ####  ####  ',
                '  ####  ####  ####  ####  ',
                '  ####  ####  ####  ####  ',
                '  ####  ####  ####  ####  ',
                '  ####  ####  ####  ####  ',
                '  ####          ####  ##  ',
                '  ####          ####  ##  ',
                '      ####  ####          ',
                '      ####  ####          ',
                '  ####          ####      ',
                '  ####          ####      ',
                '  ####  ####  ####  ####  ',
                '  ####  ####  ####  ####  ',
                '        SSSS  SSSS        ',
                '  ####  ####  ####  ####  ',
                '  ####  ####  ####  ####  ',
                '  ####  ####  ####  ####  ',
                '        ####  ####        ',
                '  ####  ####  ####  ####  ',
                '  #  #  ####  ####  #  #  ',
                '  #@@#              #@@#  '
            ],
            2: [
                '                          ',
                '                          ',
                '  ##  ##  ##  ##  ##  ##  ',
                '  ##  ##  ##  ##  ##  ##  ',
                '                          ',
                '  ####  ####  ####  ####  ',
                '  ####  ####  ####  ####  ',
                '                          ',
                '  ##  ##  ##  ##  ##  ##  ',
                '  ##  ##  ##  ##  ##  ##  ',
                '                          ',
                '  ####  ####  ####  ####  ',
                '  ####  ####  ####  ####  ',
                '                          ',
                '  ##  SS  ##  SS  ##  SS  ',
                '  ##  ##  SS  ##  SS  ##  ',
                '                          ',
                '  ####  ####  ####  ####  ',
                '  ####  ####  ####  ####  ',
                '                          ',
                '  ##  ##  ##  ##  ##  ##  ',
                '  ##  ##  ##  ##  ##  ##  ',
                '                          ',
                '  ####  ####  ####  ####  ',
                '  #  #  ####  ####  #  #  ',
                '  #@@#              #@@#  '
            ],
            3: [
                '                          ',
                '                          ',
                '    ####          ####    ',
                '    ####          ####    ',
                '    ####          ####    ',
                '    ####          ####    ',
                '        ##########        ',
                '        ##########        ',
                '  ######          ######  ',
                '  ######          ######  ',
                '        ##########        ',
                '        ##########        ',
                '  ####                    ',
                '  ####    ##########      ',
                '  ####    ##########      ',
                '          ##########      ',
                '          ##########      ',
                '  ####                    ',
                '  ####    ####    ####    ',
                '  ####    ####    ####    ',
                '          ####    ####    ',
                '  ######  ####    ####    ',
                '  ######                  ',
                '  ####    ####  ####      ',
                '  #  #    ####  ####      ',
                '  #@@#                    '
            ],
            4: [
                '                          ',
                '                          ',
                '  ######################  ',
                '  ######################  ',
                '  ##                  ##  ',
                '  ##  ##############  ##  ',
                '  ##  ##############  ##  ',
                '  ##  ##          ##  ##  ',
                '  ##  ##  ######  ##  ##  ',
                '  ##  ##  ######  ##  ##  ',
                '  ##  ##  ##  ##  ##  ##  ',
                '  ##      ##  ##      ##  ',
                '  ########    ########    ',
                '  ########    ########    ',
                '          ####            ',
                '  ########    ########    ',
                '  ########    ########    ',
                '  ##      ##  ##      ##  ',
                '  ##  ##  ##  ##  ##  ##  ',
                '  ##  ##  ######  ##  ##  ',
                '  ##  ##  ######  ##  ##  ',
                '  ##  ##          ##  ##  ',
                '  ##                  ##  ',
                '  SSSS  ##########  SSSS  ',
                '  S  S  ##########  S  S  ',
                '  S@@S              S@@S  '
            ],
            5: [
                '                          ',
                '                          ',
                '  ##  ####  ####  ####  ##',
                '  ##  ####  ####  ####  ##',
                '      ####  ####  ####    ',
                '  ######              ####',
                '  ######              ####',
                '  ####    ##########      ',
                '      ################    ',
                '      ################    ',
                '          ########        ',
                '  ##  ######  ######  ##  ',
                '  ##  ######  ######  ##  ',
                '          ########        ',
                '      ################    ',
                '      ################    ',
                '  ####    ##########      ',
                '  ######              ####',
                '  ######              ####',
                '      ####  ####  ####    ',
                '  ##  ####  ####  ####  ##',
                '  ##  ####  ####  ####  ##',
                '      ####  ####  ####    ',
                '  SSSS  ##  ####  ##  SSSS',
                '  S  S  ##  ####  ##  S  S',
                '  S@@S              S@@S  '
            ],
            6: [
                '                          ',
                '                          ',
                '    ##  ##  ##  ##  ##    ',
                '    ##  ##  ##  ##  ##    ',
                '                          ',
                '  ####  ####  ####  ####  ',
                '  ####  ####  ####  ####  ',
                '                          ',
                '    ##  ##  ##  ##  ##    ',
                '    ##  ##  ##  ##  ##    ',
                '    ##              ##    ',
                '    ##################    ',
                '    ##################    ',
                '    ##              ##    ',
                '    ##  ##  ##  ##  ##    ',
                '    ##  ##  ##  ##  ##    ',
                '                          ',
                '  ####  ####  ####  ####  ',
                '  ####  ####  ####  ####  ',
                '                          ',
                '    ##  ##  ##  ##  ##    ',
                '    ##  ##  ##  ##  ##    ',
                '                          ',
                '  SSSS    ########    SSSS',
                '  S  S    ########    S  S',
                '  S@@S              S@@S  '
            ],
            7: [
                '                          ',
                '                          ',
                '  ######          ######  ',
                '  ######          ######  ',
                '  ######          ######  ',
                '  ######          ######  ',
                '  ##                  ##  ',
                '  ##  ##############  ##  ',
                '  ##  ##############  ##  ',
                '  ##  ##          ##  ##  ',
                '      ##  ######  ##      ',
                '  ####    ######    ####  ',
                '  ####    ######    ####  ',
                '      ##  ######  ##      ',
                '  ##  ##          ##  ##  ',
                '  ##  ##############  ##  ',
                '  ##  ##############  ##  ',
                '  ##                  ##  ',
                '  ######          ######  ',
                '  ######          ######  ',
                '  ######          ######  ',
                '  ######          ######  ',
                '                          ',
                '  SSSS  ##########  SSSS  ',
                '  S  S  ##########  S  S  ',
                '  S@@S              S@@S  '
            ],
            8: [
                '                          ',
                '                          ',
                '  ######################  ',
                '  ######################  ',
                '  ######################  ',
                '  ######################  ',
                '  ##                  ##  ',
                '  ##  ##  ##  ##  ##  ##  ',
                '  ##  ##  ##  ##  ##  ##  ',
                '      ##  ##  ##  ##      ',
                '  ####    ##  ##    ####  ',
                '  ####    ##  ##    ####  ',
                '  ####              ####  ',
                '  ####    ##  ##    ####  ',
                '  ####    ##  ##    ####  ',
                '      ##  ##  ##  ##      ',
                '  ##  ##  ##  ##  ##  ##  ',
                '  ##  ##  ##  ##  ##  ##  ',
                '  ##                  ##  ',
                '  ######################  ',
                '  ######################  ',
                '  ######################  ',
                '  ######################  ',
                '  ####                ####',
                '  #  #  ##########    #  #',
                '  #@@#  ##########    #@@#'
            ],
            9: [
                '                          ',
                '                          ',
                '  ##  ##  ##  ##  ##  ##  ',
                '  ##  ##  ##  ##  ##  ##  ',
                '  ##  ##  ##  ##  ##  ##  ',
                '  ##  ##  ##  ##  ##  ##  ',
                '  ##  ##  ##  ##  ##  ##  ',
                '  ##  ##  ##  ##  ##  ##  ',
                '  ##  ##  ##  ##  ##  ##  ',
                '  ##  ##  ##  ##  ##  ##  ',
                '                          ',
                '  ######################  ',
                '  ######################  ',
                '                          ',
                '  ##  ##  ##  ##  ##  ##  ',
                '  ##  ##  ##  ##  ##  ##  ',
                '  ##  ##  ##  ##  ##  ##  ',
                '  ##  ##  ##  ##  ##  ##  ',
                '  ##  ##  ##  ##  ##  ##  ',
                '  ##  ##  ##  ##  ##  ##  ',
                '  ##  ##  ##  ##  ##  ##  ',
                '  ##  ##  ##  ##  ##  ##  ',
                '                          ',
                '  SSSS  ##  ####  ##  SSSS',
                '  S  S  ##  ####  ##  S  S',
                '  S@@S              S@@S  '
            ],
            10: [
                '                          ',
                '                          ',
                '  ####################    ',
                '  ####################    ',
                '  ####################    ',
                '  ####################    ',
                '                          ',
                '    ####################  ',
                '    ####################  ',
                '    ####################  ',
                '    ####################  ',
                '                          ',
                '  ####################    ',
                '  ####################    ',
                '  ###########S########    ',
                '  ####################    ',
                '                          ',
                '    ####################  ',
                '    ####################  ',
                '    ####################  ',
                '    ####################  ',
                '                          ',
                '  ####################    ',
                '  ####################    ',
                '  #  #################    ',
                '  #@@###############      '
            ]
        };
        
        return maps[level] || maps[1];
    }

    parseMap(map) {
        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {
                const char = map[y][x];
                const px = x * this.tileSize;
                const py = y * this.tileSize;
                
                if (char === '#') {
                    this.walls.push(new Wall(px, py, 'brick'));
                } else if (char === 'S') {
                    this.walls.push(new Wall(px, py, 'steel'));
                } else if (char === '@') {
                    this.eagle = new Eagle(px, py);
                }
            }
        }
    }

    spawnEnemy() {
        if (this.enemySpawnQueue > 0 && this.enemies.length < this.maxEnemiesOnField) {
            const spawnPoints = [
                { x: 0, y: 0 },
                { x: 12 * this.tileSize, y: 0 },
                { x: 24 * this.tileSize, y: 0 }
            ];
            const spawn = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
            this.enemies.push(new Tank(this, spawn.x, spawn.y, 'down', false));
            this.enemySpawnQueue--;
            this.lastEnemySpawn = performance.now();
        }
    }

    gameLoop(currentTime = 0) {
        if (this.isGameOver || this.isVictory) {
            return;
        }

        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));

        if (this.isPaused) {
            this.drawPauseScreen();
            return;
        }

        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        this.update(deltaTime, currentTime);
        this.render();
    }

    update(deltaTime, currentTime) {
        if (currentTime - this.lastEnemySpawn > this.enemySpawnDelay) {
            this.spawnEnemy();
        }

        if (this.player) {
            this.player.update(deltaTime);
        }

        this.enemies.forEach(enemy => enemy.update(deltaTime));
        this.bullets.forEach(bullet => bullet.update(deltaTime));

        this.checkCollisions();
        this.cleanupDeadObjects();

        if (this.enemiesKilled >= 20 && this.enemies.length === 0 && this.enemySpawnQueue === 0) {
            this.levelComplete();
        }

        if (this.eagle && this.eagle.destroyed) {
            this.gameOver();
        }

        if (this.player && this.player.destroyed) {
            this.lives--;
            this.updateUI();
            if (this.lives <= 0) {
                this.gameOver();
            } else {
                this.player = new Tank(this, 9 * this.tileSize, 24 * this.tileSize, 'up', true);
            }
        }
    }

    checkCollisions() {
        this.bullets.forEach((bullet, index) => {
            if (bullet.destroyed) return;

            if (bullet.x < 0 || bullet.x > this.canvas.width || 
                bullet.y < 0 || bullet.y > this.canvas.height) {
                bullet.destroyed = true;
                return;
            }

            this.bullets.slice(index + 1).forEach(otherBullet => {
                if (otherBullet.destroyed) return;
                if (bullet.owner.isPlayer !== otherBullet.owner.isPlayer && this.checkRectCollision(bullet, otherBullet)) {
                    bullet.destroyed = true;
                    otherBullet.destroyed = true;
                }
            });

            if (bullet.destroyed) return;

            this.walls.forEach(wall => {
                if (wall.destroyed) return;
                if (this.checkRectCollision(bullet, wall)) {
                    bullet.destroyed = true;
                    this.sounds.playHitWallSound();
                    if (wall.type === 'brick') {
                        wall.hit();
                    }
                }
            });

            if (this.eagle && !this.eagle.destroyed && this.checkRectCollision(bullet, this.eagle)) {
                if (!bullet.owner.isPlayer) {
                    bullet.destroyed = true;
                    this.eagle.destroyed = true;
                }
            }

            if (bullet.owner.isPlayer) {
                this.enemies.forEach(enemy => {
                    if (enemy.destroyed) return;
                    if (this.checkRectCollision(bullet, enemy)) {
                        bullet.destroyed = true;
                        enemy.hit();
                        if (enemy.destroyed) {
                            this.enemiesKilled++;
                            this.enemiesLeft = Math.max(0, 20 - this.enemiesKilled);
                            this.score += 100;
                            this.updateUI();
                        }
                    }
                });
            } else {
                if (this.player && !this.player.destroyed && this.checkRectCollision(bullet, this.player)) {
                    bullet.destroyed = true;
                    this.player.hit();
                }
            }
        });

        const tanks = [this.player, ...this.enemies].filter(t => t && !t.destroyed);
        tanks.forEach((tank, i) => {
            this.walls.forEach(wall => {
                if (wall.destroyed) return;
                if (this.checkRectCollision(tank, wall)) {
                    this.resolveCollision(tank, wall);
                }
            });

            tanks.slice(i + 1).forEach(other => {
                if (this.checkRectCollision(tank, other)) {
                    if (tank.isPlayer && !other.isPlayer) {
                        this.resolveCollision(other, tank);
                    } else if (!tank.isPlayer && other.isPlayer) {
                        this.resolveCollision(tank, other);
                    } else {
                        this.resolveCollision(tank, other);
                    }
                }
            });
        });
    }

    checkRectCollision(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    resolveCollision(a, b) {
        const dx = (a.x + a.width / 2) - (b.x + b.width / 2);
        const dy = (a.y + a.height / 2) - (b.y + b.height / 2);
        const width = (a.width + b.width) / 2;
        const height = (a.height + b.height) / 2;
        const crossWidth = width * dy;
        const crossHeight = height * dx;

        if (Math.abs(dx) <= width && Math.abs(dy) <= height) {
            if (crossWidth > crossHeight) {
                if (crossWidth > -crossHeight) {
                    a.y = b.y + b.height;
                } else {
                    a.x = b.x - a.width;
                }
            } else {
                if (crossWidth > -crossHeight) {
                    a.x = b.x + b.width;
                } else {
                    a.y = b.y - a.height;
                }
            }
        }
    }

    cleanupDeadObjects() {
        this.bullets = this.bullets.filter(b => !b.destroyed);
        this.enemies = this.enemies.filter(e => !e.destroyed);
        this.walls = this.walls.filter(w => !w.destroyed);
    }

    render() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.walls.forEach(wall => wall.render(this.ctx));
        if (this.eagle) this.eagle.render(this.ctx);
        this.bullets.forEach(bullet => bullet.render(this.ctx));
        if (this.player) this.player.render(this.ctx);
        this.enemies.forEach(enemy => enemy.render(this.ctx));
    }

    drawPauseScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#00f5d4';
        this.ctx.font = '24px "Press Start 2P", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('ПАУЗА', this.canvas.width / 2, this.canvas.height / 2 - 30);
        this.ctx.font = '10px "Press Start 2P", monospace';
        this.ctx.fillStyle = '#00ff41';
        this.ctx.fillText('Нажмите P чтобы продолжить', this.canvas.width / 2, this.canvas.height / 2 + 10);
        this.ctx.fillStyle = '#9d4edd';
        this.ctx.fillText('Нажмите R для рестарта', this.canvas.width / 2, this.canvas.height / 2 + 30);
    }

    // showRestartPrompt removed: R only works on pause or end screens

    togglePause() {
        if (this.isGameOver || this.isVictory) return;
        this.isPaused = !this.isPaused;
        if (!this.isPaused) {
            this.lastTime = performance.now();
            if (!this.animationId) {
                this.gameLoop();
            }
        } else {
            this.render();
            this.drawPauseScreen();
        }
    }

    levelComplete() {
        this.isVictory = true;
        cancelAnimationFrame(this.animationId);
        this.sounds.playLevelCompleteSound();
        
        if (this.currentLevel < 10) {
            this.showLevelTransition(() => {
                this.currentLevel++;
                this.saveLevelOnly(this.currentLevel);
                this.isVictory = false;
                this.loadLevel(this.currentLevel);
                this.updateUI();
                
                this.showStageScreen(() => {
                    this.lastTime = performance.now();
                    const musicDuration = this.sounds.playStartMusic();
                    setTimeout(() => {
                        if (!this.isPaused && !this.isGameOver) {
                            this.gameLoop();
                        }
                    }, musicDuration || 4000);
                });
            });
        } else {
            this.saveBestScore();
            this.showRestartButton();
            this.showMessage('ПОБЕДА! ИГРА ПРОЙДЕНА!', () => {
                // Score already saved above
            });
        }
    }

    gameOver() {
        this.isGameOver = true;
        cancelAnimationFrame(this.animationId);
        this.sounds.playGameOverSound();
        this.saveBestScore();
        this.showRestartButton();
        this.showMessage('КОНЕЦ ИГРЫ', () => {
            // Allow R to restart even if focus is outside canvas
        });
    }

    showStageScreen(callback) {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#00f5d4';
        this.ctx.font = '24px "Press Start 2P", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('УРОВЕНЬ', this.canvas.width / 2, this.canvas.height / 2 - 30);
        this.ctx.font = '32px "Press Start 2P", monospace';
        this.ctx.fillStyle = '#00ff41';
        this.ctx.fillText(this.currentLevel.toString(), this.canvas.width / 2, this.canvas.height / 2 + 20);
        
        setTimeout(() => {
            if (callback) callback();
        }, 1500);
    }

    showLevelTransition(callback) {
        this.render();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#00f5d4';
        this.ctx.font = '20px "Press Start 2P", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('УРОВЕНЬ ' + this.currentLevel, this.canvas.width / 2, this.canvas.height / 2 - 20);
        this.ctx.font = '14px "Press Start 2P", monospace';
        this.ctx.fillStyle = '#00ff41';
        this.ctx.fillText('ПРОЙДЕН!', this.canvas.width / 2, this.canvas.height / 2 + 20);
        
        setTimeout(() => {
            if (callback) callback();
        }, 2000);
    }

    showMessage(text, callback) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#00f5d4';
        this.ctx.font = '20px "Press Start 2P", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, this.canvas.width / 2, this.canvas.height / 2 - 20);
        this.ctx.font = '12px "Press Start 2P", monospace';
        this.ctx.fillText('Нажмите R для продолжения', this.canvas.width / 2, this.canvas.height / 2 + 20);
        
        if (callback) {
            this.messageCallback = callback;
        }
    }

    restart() {
        this.hideRestartButton();
        if (this.messageCallback) {
            this.messageCallback();
            this.messageCallback = null;
        } else {
            this.currentLevel = 1;
            this.score = 0;
            this.lives = 3;
            this.isGameOver = false;
            this.isVictory = false;
            this.loadLevel(this.currentLevel);
            this.updateUI();
            
            this.showStageScreen(() => {
                this.lastTime = performance.now();
                const musicDuration = this.sounds.playStartMusic();
                setTimeout(() => {
                    if (!this.isPaused && !this.isGameOver) {
                        this.gameLoop();
                    }
                }, musicDuration || 4000);
            });
        }
    }

    updateUI() {
        document.getElementById('bc-level').textContent = this.currentLevel;
        document.getElementById('bc-score').textContent = this.score;
        document.getElementById('bc-lives').textContent = this.lives;
        document.getElementById('bc-enemies').textContent = this.enemiesLeft;
        document.getElementById('bc-killed').textContent = this.enemiesKilled;
    }

    saveProgress() {
        // Deprecated: mid-level progress saving removed by design
        return;
    }

    loadProgress() {
        const savedLevel = parseInt(localStorage.getItem('battleCityLevel') || '0');
        if (!Number.isNaN(savedLevel) && savedLevel > 0) {
            this.currentLevel = Math.min(10, Math.max(1, savedLevel));
        }
    }

    saveLevelOnly(level) {
        try {
            localStorage.setItem('battleCityLevel', String(level));
        } catch (_) {}
    }

    saveBestScore() {
        const best = this.getBestScore();
        if (this.score > best) {
            try {
                localStorage.setItem('battleCityBestScore', String(this.score));
                document.getElementById('bc-best').textContent = this.score;
            } catch (_) {}
        }
    }

    getBestScore() {
        return parseInt(localStorage.getItem('battleCityBestScore') || '0');
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        document.removeEventListener('keydown', this.initControls);
        document.removeEventListener('keyup', this.initControls);
    }
}

class Tank {
    constructor(game, x, y, direction, isPlayer) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = game.tileSize;
        this.height = game.tileSize;
        this.direction = direction;
        this.isPlayer = isPlayer;
        this.speed = isPlayer ? 80 : 60;
        this.destroyed = false;
        this.hp = 1;
        this.lastShot = 0;
        this.shootCooldown = isPlayer ? 300 : 1000;
        this.lastDirectionChange = 0;
        this.directionChangeDelay = 2000;
        this.aiState = 'move';
        this.stuckCounter = 0;
        this.lastPosition = { x: x, y: y };
    }

    update(deltaTime) {
        if (this.destroyed) return;

        const oldX = this.x;
        const oldY = this.y;

        if (this.isPlayer) {
            this.handlePlayerInput(deltaTime);
        } else {
            this.handleAI(deltaTime);
        }

        if (Math.abs(this.x - this.lastPosition.x) < 1 && 
            Math.abs(this.y - this.lastPosition.y) < 1) {
            this.stuckCounter++;
            if (this.stuckCounter > 60 && !this.isPlayer) {
                this.changeDirection();
                this.stuckCounter = 0;
            }
        } else {
            this.stuckCounter = 0;
        }

        this.lastPosition = { x: this.x, y: this.y };

        this.x = Math.max(0, Math.min(this.x, this.game.canvas.width - this.width));
        this.y = Math.max(0, Math.min(this.y, this.game.canvas.height - this.height));
    }

    handlePlayerInput(deltaTime) {
        let moving = false;
        
        if (this.game.keys['w'] || this.game.keys['arrowup']) {
            this.direction = 'up';
            this.y -= this.speed * deltaTime;
            moving = true;
        }
        if (this.game.keys['s'] || this.game.keys['arrowdown']) {
            this.direction = 'down';
            this.y += this.speed * deltaTime;
            moving = true;
        }
        if (this.game.keys['a'] || this.game.keys['arrowleft']) {
            this.direction = 'left';
            this.x -= this.speed * deltaTime;
            moving = true;
        }
        if (this.game.keys['d'] || this.game.keys['arrowright']) {
            this.direction = 'right';
            this.x += this.speed * deltaTime;
            moving = true;
        }

        if (this.game.keys[' ']) {
            this.shoot();
        }

        if (moving && Math.random() < 0.1) {
            this.game.sounds.playMoveSound();
        }
    }

    handleAI(deltaTime) {
        const now = performance.now();
        
        if (now - this.lastDirectionChange > this.directionChangeDelay) {
            if (Math.random() < 0.3) {
                this.changeDirection();
            }
            this.lastDirectionChange = now;
        }

        if (Math.random() < 0.02) {
            this.shoot();
        }

        switch (this.direction) {
            case 'up': this.y -= this.speed * deltaTime; break;
            case 'down': this.y += this.speed * deltaTime; break;
            case 'left': this.x -= this.speed * deltaTime; break;
            case 'right': this.x += this.speed * deltaTime; break;
        }
    }

    changeDirection() {
        const directions = ['up', 'down', 'left', 'right'];
        this.direction = directions[Math.floor(Math.random() * directions.length)];
    }

    shoot() {
        const now = performance.now();
        if (now - this.lastShot < this.shootCooldown) return;

        const bulletSize = 4;
        let bx = this.x + this.width / 2 - bulletSize / 2;
        let by = this.y + this.height / 2 - bulletSize / 2;

        switch (this.direction) {
            case 'up': by = this.y - bulletSize; break;
            case 'down': by = this.y + this.height; break;
            case 'left': bx = this.x - bulletSize; break;
            case 'right': bx = this.x + this.width; break;
        }

        this.game.bullets.push(new Bullet(bx, by, this.direction, this));
        this.game.sounds.playShootSound();
        this.lastShot = now;
    }

    hit() {
        this.hp--;
        if (this.hp <= 0) {
            this.destroyed = true;
            this.game.sounds.playExplosionSound();
        }
    }

    render(ctx) {
        if (this.destroyed) return;

        const colors = {
            player: {
                primary: '#e6c200',
                secondary: '#ffed4e',
                dark: '#a88800',
                tracks: '#8b7000'
            },
            enemy: {
                primary: '#b0b0b0',
                secondary: '#d8d8d8',
                dark: '#707070',
                tracks: '#505050'
            }
        };

        const c = this.isPlayer ? colors.player : colors.enemy;
        const u = this.width / 16;

        ctx.save();
        ctx.translate(this.x, this.y);

        if (this.direction === 'up') {
            ctx.fillStyle = c.tracks;
            ctx.fillRect(0, 0, 5*u, 16*u);
            ctx.fillRect(11*u, 0, 5*u, 16*u);
            
            ctx.fillStyle = c.dark;
            ctx.fillRect(1*u, 1*u, 3*u, 14*u);
            ctx.fillRect(12*u, 1*u, 3*u, 14*u);
            
            ctx.fillStyle = c.primary;
            ctx.fillRect(5*u, 2*u, 6*u, 14*u);
            
            ctx.fillStyle = c.secondary;
            ctx.fillRect(6*u, 4*u, 4*u, 4*u);
            ctx.fillRect(6*u, 10*u, 4*u, 4*u);
            
            ctx.fillStyle = c.primary;
            ctx.fillRect(7*u, 0, 2*u, 7*u);
            ctx.fillStyle = c.dark;
            ctx.fillRect(7*u, 0, 2*u, 1*u);
        } else if (this.direction === 'down') {
            ctx.fillStyle = c.tracks;
            ctx.fillRect(0, 0, 5*u, 16*u);
            ctx.fillRect(11*u, 0, 5*u, 16*u);
            
            ctx.fillStyle = c.dark;
            ctx.fillRect(1*u, 1*u, 3*u, 14*u);
            ctx.fillRect(12*u, 1*u, 3*u, 14*u);
            
            ctx.fillStyle = c.primary;
            ctx.fillRect(5*u, 0, 6*u, 14*u);
            
            ctx.fillStyle = c.secondary;
            ctx.fillRect(6*u, 2*u, 4*u, 4*u);
            ctx.fillRect(6*u, 8*u, 4*u, 4*u);
            
            ctx.fillStyle = c.primary;
            ctx.fillRect(7*u, 9*u, 2*u, 7*u);
            ctx.fillStyle = c.dark;
            ctx.fillRect(7*u, 15*u, 2*u, 1*u);
        } else if (this.direction === 'left') {
            ctx.fillStyle = c.tracks;
            ctx.fillRect(0, 0, 16*u, 5*u);
            ctx.fillRect(0, 11*u, 16*u, 5*u);
            
            ctx.fillStyle = c.dark;
            ctx.fillRect(1*u, 1*u, 14*u, 3*u);
            ctx.fillRect(1*u, 12*u, 14*u, 3*u);
            
            ctx.fillStyle = c.primary;
            ctx.fillRect(2*u, 5*u, 14*u, 6*u);
            
            ctx.fillStyle = c.secondary;
            ctx.fillRect(4*u, 6*u, 4*u, 4*u);
            ctx.fillRect(10*u, 6*u, 4*u, 4*u);
            
            ctx.fillStyle = c.primary;
            ctx.fillRect(0, 7*u, 7*u, 2*u);
            ctx.fillStyle = c.dark;
            ctx.fillRect(0, 7*u, 1*u, 2*u);
        } else if (this.direction === 'right') {
            ctx.fillStyle = c.tracks;
            ctx.fillRect(0, 0, 16*u, 5*u);
            ctx.fillRect(0, 11*u, 16*u, 5*u);
            
            ctx.fillStyle = c.dark;
            ctx.fillRect(1*u, 1*u, 14*u, 3*u);
            ctx.fillRect(1*u, 12*u, 14*u, 3*u);
            
            ctx.fillStyle = c.primary;
            ctx.fillRect(0, 5*u, 14*u, 6*u);
            
            ctx.fillStyle = c.secondary;
            ctx.fillRect(2*u, 6*u, 4*u, 4*u);
            ctx.fillRect(8*u, 6*u, 4*u, 4*u);
            
            ctx.fillStyle = c.primary;
            ctx.fillRect(9*u, 7*u, 7*u, 2*u);
            ctx.fillStyle = c.dark;
            ctx.fillRect(15*u, 7*u, 1*u, 2*u);
        }

        ctx.restore();
    }
}

class Bullet {
    constructor(x, y, direction, owner) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 4;
        this.direction = direction;
        this.speed = 200;
        this.owner = owner;
        this.destroyed = false;
    }

    update(deltaTime) {
        switch (this.direction) {
            case 'up': this.y -= this.speed * deltaTime; break;
            case 'down': this.y += this.speed * deltaTime; break;
            case 'left': this.x -= this.speed * deltaTime; break;
            case 'right': this.x += this.speed * deltaTime; break;
        }
    }

    render(ctx) {
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Wall {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 16;
        this.height = 16;
        this.type = type;
        this.destroyed = false;
    }

    hit() {
        if (this.type === 'brick') {
            this.destroyed = true;
        }
    }

    render(ctx) {
        if (this.destroyed) return;
        
        if (this.type === 'brick') {
            ctx.fillStyle = '#d2691e';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.strokeStyle = '#8b4513';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x, this.y, this.width / 2, this.height / 2);
            ctx.strokeRect(this.x + this.width / 2, this.y, this.width / 2, this.height / 2);
            ctx.strokeRect(this.x, this.y + this.height / 2, this.width / 2, this.height / 2);
            ctx.strokeRect(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, this.height / 2);
        } else if (this.type === 'steel') {
            ctx.fillStyle = '#c0c0c0';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.strokeStyle = '#808080';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
}

class Eagle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 16;
        this.height = 16;
        this.destroyed = false;
    }

    render(ctx) {
        if (this.destroyed) {
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = '#000';
            ctx.fillRect(this.x + 4, this.y + 4, this.width - 8, this.height - 8);
        } else {
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = '#ff8c00';
            ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
            ctx.fillRect(this.x + 6, this.y + 6, this.width - 12, this.height - 12);
        }
    }
}

window.BattleCity = BattleCity;


