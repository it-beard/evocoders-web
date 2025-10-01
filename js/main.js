document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.createElement('canvas');
    canvas.id = 'game-of-life-canvas';
    document.body.insertBefore(canvas, document.body.firstChild);

    const game = new GameOfLife('game-of-life-canvas', 12, 0.14, 20, 7000);
    game.start();

    // Terminal-like typing animation for hero title
    const titleEl = document.querySelector('.terminal-title');
    if (titleEl) {
        const promptEl = titleEl.querySelector('.prompt');
        const typedEl = titleEl.querySelector('.typed');
        const cursorEl = titleEl.querySelector('.cursor');
        const text = 'Эволюция Кода';

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
        }, 600);
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

    // Footer system uptime
    const uptimeEl = document.getElementById('uptime');
    if (uptimeEl) {
        const start = Date.now();
        const format = (seconds) => {
            // Display as xxd (seconds), but keep nice formatting when grows
            return `${seconds.toString().padStart(2,'0')}s`;
        };
        setInterval(() => {
            const secs = Math.floor((Date.now() - start) / 1000);
            uptimeEl.textContent = `SYSTEM UPTIME ${format(secs)}`;
        }, 1000);
    }
});
