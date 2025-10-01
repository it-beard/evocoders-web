// Performance-focused Conway's Game of Life engine
// Exposes window.GameOfLife
(function(window) {
    class GameOfLife {
        constructor(canvasId, cellSize = 12, density = 0.16, fps = 20, paletteCycleMs = 6000) {
            this.canvas = document.getElementById(canvasId);
            this.ctx = this.canvas.getContext('2d', { alpha: true });
            this.cellSize = cellSize;
            this.density = density;
            this.fps = fps;
            this.frameInterval = 1000 / this.fps;
            this.lastStep = 0;
            this.paletteCycleMs = paletteCycleMs;
            this.lastPaletteChange = 0;
            this.paletteIndex = 0;

            this.dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
            this.resize();

            window.addEventListener('resize', () => {
                this.resize();
                this.randomize();
            });
        }

        resize() {
            const cssWidth = window.innerWidth;
            const cssHeight = window.innerHeight;
            this.canvas.style.width = cssWidth + 'px';
            this.canvas.style.height = cssHeight + 'px';
            this.canvas.width = Math.floor(cssWidth * this.dpr);
            this.canvas.height = Math.floor(cssHeight * this.dpr);

            this.cols = Math.floor(cssWidth / this.cellSize);
            this.rows = Math.floor(cssHeight / this.cellSize);

            const size = this.cols * this.rows;
            this.current = new Uint8Array(size);
            this.next = new Uint8Array(size);
            this.prev = new Uint8Array(size);
            this.prev2 = new Uint8Array(size);
            this.stagnationFrames = 0;
            this.lowChangeFrames = 0;

            this.buffer = document.createElement('canvas');
            this.buffer.width = this.cols;
            this.buffer.height = this.rows;
            this.bctx = this.buffer.getContext('2d');
            this.imageData = this.bctx.createImageData(this.cols, this.rows);

            this.leftIndex = new Uint16Array(this.cols);
            this.rightIndex = new Uint16Array(this.cols);
            for (let x = 0; x < this.cols; x++) {
                this.leftIndex[x] = (x === 0 ? this.cols - 1 : x - 1);
                this.rightIndex[x] = (x === this.cols - 1 ? 0 : x + 1);
            }
            this.upIndex = new Uint16Array(this.rows);
            this.downIndex = new Uint16Array(this.rows);
            for (let y = 0; y < this.rows; y++) {
                this.upIndex[y] = (y === 0 ? this.rows - 1 : y - 1);
                this.downIndex[y] = (y === this.rows - 1 ? 0 : y + 1);
            }
        }

        idx(x, y) { return y * this.cols + x; }

        randomize() {
            const size = this.current.length;
            for (let i = 0; i < size; i++) {
                this.current[i] = Math.random() < this.density ? 1 : 0;
            }
            this.prev.fill(0);
            this.prev2.fill(0);
            this.stagnationFrames = 0;
            this.lowChangeFrames = 0;
        }

        update() {
            const cols = this.cols, rows = this.rows;
            const left = this.leftIndex, right = this.rightIndex;
            const up = this.upIndex, down = this.downIndex;
            const cur = this.current, nxt = this.next;

            let changed = 0; let alive = 0;
            for (let y = 0; y < rows; y++) {
                const yUp = up[y], yDown = down[y];
                for (let x = 0; x < cols; x++) {
                    const xLeft = left[x], xRight = right[x];
                    let n = 0;
                    n += cur[this.idx(xLeft, yUp)];
                    n += cur[this.idx(x,     yUp)];
                    n += cur[this.idx(xRight,yUp)];
                    n += cur[this.idx(xLeft, y)];
                    n += cur[this.idx(xRight, y)];
                    n += cur[this.idx(xLeft, yDown)];
                    n += cur[this.idx(x,     yDown)];
                    n += cur[this.idx(xRight,yDown)];
                    const i = this.idx(x, y);
                    const s = cur[i];
                    const nv = (s === 1 ? (n === 2 || n === 3) : (n === 3)) ? 1 : 0;
                    nxt[i] = nv; alive += nv; if (nv !== s) changed++;
                }
            }

            const tmp = this.current; this.current = this.next; this.next = tmp;

            const size = this.current.length;
            const lowChange = changed < Math.max(8, Math.floor(size * 0.0015));
            this.lowChangeFrames = lowChange ? this.lowChangeFrames + 1 : 0;
            const equalPrev = this.arraysEqual(this.current, this.prev);
            const equalPrev2 = this.arraysEqual(this.current, this.prev2);
            this.stagnationFrames = (equalPrev || equalPrev2) ? this.stagnationFrames + 1 : 0;
            this.prev2.set(this.prev); this.prev.set(this.current);
            if (alive < Math.floor(size * 0.003) || this.stagnationFrames > 240 || this.lowChangeFrames > 240) {
                this.randomize();
            }
        }

        draw(tick = 0, time = 0) {
            const data = this.imageData.data; const cur = this.current;
            const palettes = [ [0x00,0xf5,0xd4], [0x9d,0x4e,0xdd], [0x00,0xff,0x41] ];
            if (time - this.lastPaletteChange > this.paletteCycleMs) {
                this.paletteIndex = (this.paletteIndex + 1) % palettes.length;
                this.lastPaletteChange = time;
            }
            const p = palettes[this.paletteIndex];
            for (let i = 0, j = 0; i < cur.length; i++, j += 4) {
                if (cur[i]) { data[j]=p[0]; data[j+1]=p[1]; data[j+2]=p[2]; data[j+3]=190; }
                else { data[j]=data[j+1]=data[j+2]=0; data[j+3]=0; }
            }
            this.bctx.putImageData(this.imageData, 0, 0);
            this.ctx.save(); this.ctx.imageSmoothingEnabled = false; this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
            this.ctx.drawImage(this.buffer, 0,0,this.buffer.width,this.buffer.height, 0,0,this.canvas.width,this.canvas.height);
            this.ctx.restore();
        }

        start() {
            let tick = 0;
            const loop = (time) => {
                if (time - this.lastStep >= this.frameInterval) {
                    this.update(); this.draw(tick++, time); this.lastStep = time;
                }
                this.rafId = requestAnimationFrame(loop);
            };
            this.randomize(); this.rafId = requestAnimationFrame(loop);
        }

        arraysEqual(a, b) {
            if (a.length !== b.length) return false; for (let i = 0; i < a.length; i++) { if (a[i] !== b[i]) return false; } return true;
        }

        // Interaction helpers
        setCell(x, y, alive = 1) {
            if (this.cols === 0 || this.rows === 0) return;
            // Wrap around
            const cx = (x % this.cols + this.cols) % this.cols;
            const cy = (y % this.rows + this.rows) % this.rows;
            this.current[this.idx(cx, cy)] = alive ? 1 : 0;
        }

        // Stamp a small randomized 5x5 burst centered at (cellX, cellY)
        stampBurst(cellX, cellY, radius = 3, prob = 0.55) {
            for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {
                    if (Math.random() < prob) this.setCell(cellX + dx, cellY + dy, 1);
                }
            }
        }

        // Convert viewport client coords to cell coords and inject a burst
        injectAtClient(clientX, clientY) {
            const cellX = Math.floor(clientX / this.cellSize);
            const cellY = Math.floor(clientY / this.cellSize);
            this.stampBurst(cellX, cellY);
        }
    }

    window.GameOfLife = GameOfLife;
})(window);


