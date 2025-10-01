document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.createElement('canvas');
    canvas.id = 'game-of-life-canvas';
    document.body.insertBefore(canvas, document.body.firstChild);

    const game = new GameOfLife('game-of-life-canvas', 12, 0.14, 20, 7000);
    game.start();

    // Click/touch to add bursts to Game of Life
    function injectFromEvent(e) {
        if (!e) return;
        let x, y;
        if (e.touches && e.touches.length) {
            x = e.touches[0].clientX; y = e.touches[0].clientY;
        } else {
            x = e.clientX; y = e.clientY;
        }
        game.injectAtClient(x, y);
    }
    window.addEventListener('click', injectFromEvent);
    window.addEventListener('touchstart', injectFromEvent, { passive: true });

    // Terminal-like typing animation for header logo and hero title (if present)
    function initTyping(scopeSelector, text) {
        const container = document.querySelector(scopeSelector);
        if (!container) return;
        const promptEl = container.querySelector('.prompt');
        const typedEl = container.querySelector('.typed');
        const cursorEl = container.querySelector('.cursor');
        if (!promptEl || !typedEl || !cursorEl) return;
        setTimeout(() => {
            promptEl.classList.remove('blink');
            let i = 0;
            const typeNext = () => {
                if (i <= text.length) {
                    typedEl.textContent = text.slice(0, i);
                    i++;
                    setTimeout(typeNext, 80);
                } else {
                    cursorEl.style.opacity = 1;
                    cursorEl.classList.add('blink');
                }
            };
            typeNext();
        }, 400);
    }

    // Header logo typing
    initTyping('header .terminal-title', 'Эволюция Кода');

    // If hero title left empty (because we moved it to header), skip. If there is another terminal-title in hero, init it as well.
    const heroTerminal = document.querySelector('.hero .terminal-title');
    if (heroTerminal) {
        initTyping('.hero .terminal-title', 'Эволюция Кода');
    }

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

    // Footer system line: READY + UPTIME HH:MM:SS
    const systemLine = document.getElementById('system-line');
    if (systemLine) {
        const start = Date.now();
        const pad = (n) => n.toString().padStart(2, '0');
        setInterval(() => {
            const secsTotal = Math.floor((Date.now() - start) / 1000);
            const h = Math.floor(secsTotal / 3600);
            const m = Math.floor((secsTotal % 3600) / 60);
            const s = secsTotal % 60;
            const timeStr = `${pad(h)}:${pad(m)}:${pad(s)}`;
            systemLine.textContent = `SYSTEM READY | SYSTEM UPTIME ${timeStr}`;
        }, 1000);
    }
});
