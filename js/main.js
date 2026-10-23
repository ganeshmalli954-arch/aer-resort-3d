/* ═══════════════════════════════════════════════════════════════
   Main Application Controller
   Initializes all modules, handles preloader, cursor, nav
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    /* ── Preloader ── */
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('loaded');
            startHeroAnimations();
        }, 2800);
    });

    // Fallback: hide preloader after 5s
    setTimeout(() => {
        preloader.classList.add('loaded');
        startHeroAnimations();
    }, 5000);

    /* ── Initialize 3D Model ── */
    const villaModel = new VillaModel();

    /* ── Initialize Scroll Animations ── */
    const scrollController = new ScrollAnimationController(villaModel);

    /* ── Hero Entrance Animations ── */
    function startHeroAnimations() {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.to('.hero-badge', {
            opacity: 1,
            y: 0,
            duration: 0.8,
        })
        .to('.hero-title', {
            opacity: 1,
            y: 0,
            duration: 1.2,
        }, '-=0.4')
        .to('.hero-tagline', {
            opacity: 1,
            y: 0,
            duration: 0.8,
        }, '-=0.6')
        .to('.hero-subtitle', {
            opacity: 1,
            y: 0,
            duration: 0.8,
        }, '-=0.4')
        .to('.hero-cta', {
            opacity: 1,
            y: 0,
            duration: 0.8,
        }, '-=0.3');
    }

    /* ── Custom Cursor ── */
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');

    if (cursorDot && cursorRing && window.innerWidth > 768) {
        let dotX = 0, dotY = 0;
        let ringX = 0, ringY = 0;

        document.addEventListener('mousemove', (e) => {
            dotX = e.clientX;
            dotY = e.clientY;
        });

        function animateCursor() {
            ringX += (dotX - ringX) * 0.12;
            ringY += (dotY - ringY) * 0.12;

            cursorDot.style.left = dotX + 'px';
            cursorDot.style.top = dotY + 'px';
            cursorRing.style.left = ringX + 'px';
            cursorRing.style.top = ringY + 'px';

            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Expand cursor on interactive elements
        document.querySelectorAll('a, button, .glass-card, .gallery-item').forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorDot.style.width = '12px';
                cursorDot.style.height = '12px';
                cursorDot.style.background = '#E8CFA0';
                cursorRing.style.width = '55px';
                cursorRing.style.height = '55px';
                cursorRing.style.borderColor = 'rgba(212, 169, 106, 0.8)';
            });
            el.addEventListener('mouseleave', () => {
                cursorDot.style.width = '8px';
                cursorDot.style.height = '8px';
                cursorDot.style.background = '#D4A96A';
                cursorRing.style.width = '40px';
                cursorRing.style.height = '40px';
                cursorRing.style.borderColor = 'rgba(212, 169, 106, 0.5)';
            });
        });
    }

    /* ── Navigation Scroll Effects ── */
    const nav = document.getElementById('main-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 80) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    /* ── Mobile Menu Toggle ── */
    const menuBtn = document.querySelector('.nav-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('open');
            mobileMenu.classList.toggle('open');
            document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
        });

        mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
            link.addEventListener('click', () => {
                menuBtn.classList.remove('open');
                mobileMenu.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    /* ── Smooth Scroll for Nav Links ── */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    /* ── Parallax floating elements ── */
    const createFloatingOrbs = () => {
        const container = document.createElement('div');
        container.className = 'ambient-particles';
        document.body.appendChild(container);

        for (let i = 0; i < 5; i++) {
            const orb = document.createElement('div');
            orb.style.cssText = `
                position: absolute;
                width: ${30 + Math.random() * 60}px;
                height: ${30 + Math.random() * 60}px;
                border-radius: 50%;
                background: radial-gradient(circle, rgba(212, 169, 106, 0.08) 0%, transparent 70%);
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: float-orb ${8 + Math.random() * 8}s ease-in-out infinite;
                animation-delay: ${Math.random() * 5}s;
            `;
            container.appendChild(orb);
        }
    };

    createFloatingOrbs();

    // CSS for floating orbs animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float-orb {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
            25% { transform: translate(30px, -40px) scale(1.1); opacity: 0.7; }
            50% { transform: translate(-20px, -80px) scale(0.9); opacity: 0.5; }
            75% { transform: translate(40px, -30px) scale(1.05); opacity: 0.6; }
        }
    `;
    document.head.appendChild(style);

    /* ── Form Submit Handler ── */
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('.btn-primary');
            const originalText = btn.textContent;
            btn.textContent = '✓ Sent Successfully';
            btn.style.background = 'linear-gradient(135deg, #2D6B3F, #3D8B55)';
            btn.style.color = '#fff';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
                btn.style.color = '';
                form.reset();
            }, 3000);
        });
    }

    /* ── Intersection Observer for Lazy Reveals ── */
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
        observer.observe(el);
    });

    console.log('%c AER — Anandamayee Eco Resort ', 'background: linear-gradient(135deg, #2D4A3E, #1A2F26); color: #D4A96A; font-size: 14px; padding: 10px 20px; border-radius: 4px; font-family: Georgia, serif;');
    console.log('%c Nature. Serenity. Sustainability. ', 'color: #C8BBA8; font-size: 10px; font-family: Georgia, serif;');
});
