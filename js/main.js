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
    
    const fadeEls = document.querySelectorAll('.fade-in');
    fadeEls.forEach(el => observer.observe(el));

    // Ensure above-the-fold content is visible on first paint (fix for some mobile browsers)
    function revealAboveFold() {
        document.querySelectorAll('.fade-in').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < (window.innerHeight - 80)) {
                el.classList.add('visible');
            }
        });
    }
    // On rules page, reveal immediately (first-paint issue on some mobile browsers)
    const isRules = document.body.classList.contains('rules-page');
    if (isRules) {
        fadeEls.forEach(el => el.classList.add('visible'));
    } else {
        revealAboveFold();
    }
    window.addEventListener('resize', revealAboveFold);
    
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

    function initCarousel(cfg) {
        const track = document.querySelector(cfg.trackSelector);
        if (!track) return null;
        const slides = document.querySelectorAll(cfg.slidesSelector);
        const indicators = cfg.indicatorSelector ? document.querySelectorAll(cfg.indicatorSelector) : [];
        const prevBtn = cfg.prevSelector ? document.querySelector(cfg.prevSelector) : null;
        const nextBtn = cfg.nextSelector ? document.querySelector(cfg.nextSelector) : null;
        const currentEl = cfg.currentSelector ? document.querySelector(cfg.currentSelector) : null;
        const totalEl = cfg.totalSelector ? document.querySelector(cfg.totalSelector) : null;
        const modal = cfg.modalSelector ? document.querySelector(cfg.modalSelector) : null;
        const openEl = cfg.openSelector ? document.querySelector(cfg.openSelector) : null;
        const closeEl = cfg.closeSelector ? document.querySelector(cfg.closeSelector) : null;

        let index = 0;
        if (totalEl) totalEl.textContent = slides.length;

        function update() {
            track.style.transform = `translateX(-${index * 100}%)`;
            slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
            if (indicators && indicators.forEach) {
                indicators.forEach((ind, i) => ind.classList.toggle('active', i === index));
            }
            if (currentEl) currentEl.textContent = index + 1;
            if (prevBtn) prevBtn.disabled = index === 0;
            if (nextBtn) nextBtn.disabled = index === slides.length - 1;
        }

        function next() { if (index < slides.length - 1) { index++; update(); } }
        function prev() { if (index > 0) { index--; update(); } }
        function goTo(i) { index = i; update(); }

        if (prevBtn) prevBtn.addEventListener('click', prev);
        if (nextBtn) nextBtn.addEventListener('click', next);
        if (indicators && indicators.forEach) {
            indicators.forEach((ind, i) => ind.addEventListener('click', () => goTo(i)));
        }

        function open() {
            if (!modal) return;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            index = 0;
            update();
        }

        function close() {
            if (!modal) return;
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }

        if (openEl && modal) openEl.addEventListener('click', open);
        if (closeEl && modal) closeEl.addEventListener('click', close);
        if (modal) {
            modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
            document.addEventListener('keydown', (e) => {
                if (!modal.classList.contains('active')) return;
                if (e.key === 'Escape') close();
                else if (e.key === 'ArrowLeft') prev();
                else if (e.key === 'ArrowRight') next();
            });
            let touchStartX = 0;
            modal.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
            modal.addEventListener('touchend', (e) => {
                const diff = touchStartX - e.changedTouches[0].screenX;
                if (Math.abs(diff) > 50) { if (diff > 0) next(); else prev(); }
            }, { passive: true });
        }

        update();
        return { next, prev, goTo, open, close };
    }

    initCarousel({
        trackSelector: '#carousel-track',
        slidesSelector: '#carousel-track .carousel-slide',
        indicatorSelector: '#carousel-indicators .indicator',
        prevSelector: '#carousel-prev',
        nextSelector: '#carousel-next',
        currentSelector: '#carousel-counter .current-slide',
        totalSelector: '#carousel-counter .total-slides',
        modalSelector: '#courses-modal',
        openSelector: '#courses-card',
        closeSelector: '#modal-close'
    });

    initCarousel({
        trackSelector: '#content-carousel-track',
        slidesSelector: '#content-carousel-track .carousel-slide',
        indicatorSelector: '#content-carousel-indicators .indicator',
        prevSelector: '#content-carousel-prev',
        nextSelector: '#content-carousel-next',
        currentSelector: '#content-carousel-counter .current-slide',
        totalSelector: '#content-carousel-counter .total-slides',
        modalSelector: '#content-modal',
        openSelector: '#content-card',
        closeSelector: '#content-modal-close'
    });

    initCarousel({
        trackSelector: '#digests-carousel-track',
        slidesSelector: '#digests-carousel-track .carousel-slide',
        indicatorSelector: '#digests-carousel-indicators .indicator',
        prevSelector: '#digests-carousel-prev',
        nextSelector: '#digests-carousel-next',
        currentSelector: '#digests-carousel-counter .current-slide',
        totalSelector: '#digests-carousel-counter .total-slides',
        modalSelector: '#digests-modal',
        openSelector: '#digests-card',
        closeSelector: '#digests-modal-close'
    });
});
