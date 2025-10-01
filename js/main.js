class GameOfLife {
    constructor(canvasId, cellSize = 10) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.cellSize = cellSize;
        this.resize();
        this.grid = this.createGrid();
        this.randomize();
        
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.cols = Math.floor(this.canvas.width / this.cellSize);
        this.rows = Math.floor(this.canvas.height / this.cellSize);
    }
    
    createGrid() {
        return Array(this.rows).fill(null).map(() => Array(this.cols).fill(0));
    }
    
    randomize() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                this.grid[i][j] = Math.random() > 0.85 ? 1 : 0;
            }
        }
    }
    
    countNeighbors(grid, x, y) {
        let sum = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                const row = (x + i + this.rows) % this.rows;
                const col = (y + j + this.cols) % this.cols;
                sum += grid[row][col];
            }
        }
        return sum;
    }
    
    update() {
        const next = this.createGrid();
        
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const neighbors = this.countNeighbors(this.grid, i, j);
                const state = this.grid[i][j];
                
                if (state === 0 && neighbors === 3) {
                    next[i][j] = 1;
                } else if (state === 1 && (neighbors < 2 || neighbors > 3)) {
                    next[i][j] = 0;
                } else {
                    next[i][j] = state;
                }
            }
        }
        
        this.grid = next;
    }
    
    draw() {
        this.ctx.fillStyle = '#050816';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.grid[i][j] === 1) {
                    const x = j * this.cellSize;
                    const y = i * this.cellSize;
                    
                    const colors = ['#9d4edd', '#00f5d4', '#7b2cbf', '#00ff41'];
                    const color = colors[Math.floor(Math.random() * colors.length)];
                    
                    this.ctx.fillStyle = color;
                    this.ctx.fillRect(x, y, this.cellSize - 1, this.cellSize - 1);
                    
                    this.ctx.shadowBlur = 10;
                    this.ctx.shadowColor = color;
                    this.ctx.fillRect(x, y, this.cellSize - 1, this.cellSize - 1);
                    this.ctx.shadowBlur = 0;
                }
            }
        }
    }
    
    start() {
        setInterval(() => {
            this.update();
            this.draw();
        }, 150);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.createElement('canvas');
    canvas.id = 'game-of-life-canvas';
    document.body.insertBefore(canvas, document.body.firstChild);
    
    const game = new GameOfLife('game-of-life-canvas', 12);
    game.start();
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });
    
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    const cards = document.querySelectorAll('.benefit-card, .resource-card, .thesis');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
    
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.animation = 'pulse 0.5s ease-in-out';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.animation = '';
        });
    });
    
    setInterval(() => {
        if (Math.random() > 0.95) {
            document.body.style.animation = 'glitch 0.1s';
            setTimeout(() => {
                document.body.style.animation = '';
            }, 100);
        }
    }, 2000);
});
