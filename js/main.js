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

    const coursesCard = document.getElementById('courses-card');
    const coursesModal = document.getElementById('courses-modal');
    const modalClose = document.getElementById('modal-close');
    
    const contentCard = document.getElementById('content-card');
    const contentModal = document.getElementById('content-modal');
    const contentModalClose = document.getElementById('content-modal-close');
    
    const digestsCard = document.getElementById('digests-card');
    const digestsModal = document.getElementById('digests-modal');
    const digestsModalClose = document.getElementById('digests-modal-close');
    
    let currentSlide = 0;
    let currentContentSlide = 0;
    let currentDigestsSlide = 0;
    
    const slides = document.querySelectorAll('#carousel-track .carousel-slide');
    const indicators = document.querySelectorAll('#carousel-indicators .indicator');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const carouselTrack = document.getElementById('carousel-track');
    const currentSlideEl = document.querySelector('#carousel-counter .current-slide');
    const totalSlidesEl = document.querySelector('#carousel-counter .total-slides');
    
    const contentSlides = document.querySelectorAll('#content-carousel-track .carousel-slide');
    const contentIndicators = document.querySelectorAll('#content-carousel-indicators .indicator');
    const contentPrevBtn = document.getElementById('content-carousel-prev');
    const contentNextBtn = document.getElementById('content-carousel-next');
    const contentCarouselTrack = document.getElementById('content-carousel-track');
    const currentContentSlideEl = document.querySelector('#content-carousel-counter .current-slide');
    const totalContentSlidesEl = document.querySelector('#content-carousel-counter .total-slides');
    
    const digestsSlides = document.querySelectorAll('#digests-carousel-track .carousel-slide');
    const digestsIndicators = document.querySelectorAll('#digests-carousel-indicators .indicator');
    const digestsPrevBtn = document.getElementById('digests-carousel-prev');
    const digestsNextBtn = document.getElementById('digests-carousel-next');
    const digestsCarouselTrack = document.getElementById('digests-carousel-track');
    const currentDigestsSlideEl = document.querySelector('#digests-carousel-counter .current-slide');
    const totalDigestsSlidesEl = document.querySelector('#digests-carousel-counter .total-slides');
    
    function updateCarousel() {
        if (!carouselTrack) return;
        
        carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
        
        slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === currentSlide);
        });
        
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentSlide);
        });
        
        if (currentSlideEl) {
            currentSlideEl.textContent = currentSlide + 1;
        }
        
        if (prevBtn) {
            prevBtn.disabled = currentSlide === 0;
        }
        if (nextBtn) {
            nextBtn.disabled = currentSlide === slides.length - 1;
        }
    }
    
    function nextSlide() {
        if (currentSlide < slides.length - 1) {
            currentSlide++;
            updateCarousel();
        }
    }
    
    function prevSlide() {
        if (currentSlide > 0) {
            currentSlide--;
            updateCarousel();
        }
    }
    
    function goToSlide(index) {
        currentSlide = index;
        updateCarousel();
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', prevSlide);
    }
    
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => goToSlide(index));
    });
    
    if (coursesCard && coursesModal) {
        coursesCard.addEventListener('click', () => {
            coursesModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            currentSlide = 0;
            updateCarousel();
        });
    }
    
    function closeModal() {
        if (coursesModal) {
            coursesModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    if (coursesModal) {
        coursesModal.addEventListener('click', (e) => {
            if (e.target === coursesModal) {
                closeModal();
            }
        });
    }
    
    document.addEventListener('keydown', (e) => {
        if (coursesModal && coursesModal.classList.contains('active')) {
            if (e.key === 'Escape') {
                closeModal();
            } else if (e.key === 'ArrowLeft') {
                prevSlide();
            } else if (e.key === 'ArrowRight') {
                nextSlide();
            }
        }
    });
    
    let touchStartX = 0;
    let touchEndX = 0;
    
    if (coursesModal) {
        coursesModal.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        coursesModal.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }
    
    if (contentModal) {
        contentModal.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        contentModal.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }
    
    if (digestsModal) {
        digestsModal.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        digestsModal.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                if (coursesModal && coursesModal.classList.contains('active')) {
                    nextSlide();
                } else if (contentModal && contentModal.classList.contains('active')) {
                    nextContentSlide();
                } else if (digestsModal && digestsModal.classList.contains('active')) {
                    nextDigestsSlide();
                }
            } else {
                if (coursesModal && coursesModal.classList.contains('active')) {
                    prevSlide();
                } else if (contentModal && contentModal.classList.contains('active')) {
                    prevContentSlide();
                } else if (digestsModal && digestsModal.classList.contains('active')) {
                    prevDigestsSlide();
                }
            }
        }
    }
    
    function updateContentCarousel() {
        if (!contentCarouselTrack) return;
        
        contentCarouselTrack.style.transform = `translateX(-${currentContentSlide * 100}%)`;
        
        contentSlides.forEach((slide, index) => {
            slide.classList.toggle('active', index === currentContentSlide);
        });
        
        contentIndicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentContentSlide);
        });
        
        if (currentContentSlideEl) {
            currentContentSlideEl.textContent = currentContentSlide + 1;
        }
        
        if (contentPrevBtn) {
            contentPrevBtn.disabled = currentContentSlide === 0;
        }
        if (contentNextBtn) {
            contentNextBtn.disabled = currentContentSlide === contentSlides.length - 1;
        }
    }
    
    function nextContentSlide() {
        if (currentContentSlide < contentSlides.length - 1) {
            currentContentSlide++;
            updateContentCarousel();
        }
    }
    
    function prevContentSlide() {
        if (currentContentSlide > 0) {
            currentContentSlide--;
            updateContentCarousel();
        }
    }
    
    function goToContentSlide(index) {
        currentContentSlide = index;
        updateContentCarousel();
    }
    
    function updateDigestsCarousel() {
        if (!digestsCarouselTrack) return;
        
        digestsCarouselTrack.style.transform = `translateX(-${currentDigestsSlide * 100}%)`;
        
        digestsSlides.forEach((slide, index) => {
            slide.classList.toggle('active', index === currentDigestsSlide);
        });
        
        digestsIndicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentDigestsSlide);
        });
        
        if (currentDigestsSlideEl) {
            currentDigestsSlideEl.textContent = currentDigestsSlide + 1;
        }
        
        if (digestsPrevBtn) {
            digestsPrevBtn.disabled = currentDigestsSlide === 0;
        }
        if (digestsNextBtn) {
            digestsNextBtn.disabled = currentDigestsSlide === digestsSlides.length - 1;
        }
    }
    
    function nextDigestsSlide() {
        if (currentDigestsSlide < digestsSlides.length - 1) {
            currentDigestsSlide++;
            updateDigestsCarousel();
        }
    }
    
    function prevDigestsSlide() {
        if (currentDigestsSlide > 0) {
            currentDigestsSlide--;
            updateDigestsCarousel();
        }
    }
    
    function goToDigestsSlide(index) {
        currentDigestsSlide = index;
        updateDigestsCarousel();
    }
    
    if (contentNextBtn) {
        contentNextBtn.addEventListener('click', nextContentSlide);
    }
    
    if (contentPrevBtn) {
        contentPrevBtn.addEventListener('click', prevContentSlide);
    }
    
    contentIndicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => goToContentSlide(index));
    });
    
    if (digestsNextBtn) {
        digestsNextBtn.addEventListener('click', nextDigestsSlide);
    }
    
    if (digestsPrevBtn) {
        digestsPrevBtn.addEventListener('click', prevDigestsSlide);
    }
    
    digestsIndicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => goToDigestsSlide(index));
    });
    
    if (contentCard && contentModal) {
        contentCard.addEventListener('click', () => {
            contentModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            currentContentSlide = 0;
            updateContentCarousel();
        });
    }
    
    if (digestsCard && digestsModal) {
        digestsCard.addEventListener('click', () => {
            digestsModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            currentDigestsSlide = 0;
            updateDigestsCarousel();
        });
    }
    
    function closeContentModal() {
        if (contentModal) {
            contentModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    function closeDigestsModal() {
        if (digestsModal) {
            digestsModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    if (contentModalClose) {
        contentModalClose.addEventListener('click', closeContentModal);
    }
    
    if (digestsModalClose) {
        digestsModalClose.addEventListener('click', closeDigestsModal);
    }
    
    if (contentModal) {
        contentModal.addEventListener('click', (e) => {
            if (e.target === contentModal) {
                closeContentModal();
            }
        });
    }
    
    if (digestsModal) {
        digestsModal.addEventListener('click', (e) => {
            if (e.target === digestsModal) {
                closeDigestsModal();
            }
        });
    }
    
    document.addEventListener('keydown', (e) => {
        if (contentModal && contentModal.classList.contains('active')) {
            if (e.key === 'Escape') {
                closeContentModal();
            } else if (e.key === 'ArrowLeft') {
                prevContentSlide();
            } else if (e.key === 'ArrowRight') {
                nextContentSlide();
            }
        } else if (digestsModal && digestsModal.classList.contains('active')) {
            if (e.key === 'Escape') {
                closeDigestsModal();
            } else if (e.key === 'ArrowLeft') {
                prevDigestsSlide();
            } else if (e.key === 'ArrowRight') {
                nextDigestsSlide();
            }
        }
    });
});
