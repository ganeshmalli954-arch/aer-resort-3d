/* ═══════════════════════════════════════════════════════════════════════════════
   Main Application Controller
   Initializes 3D Model, GSAP ScrollTrigger, Custom Cursor,
   Interactive 3D Dock Controls, and Section Transitions
   ═══════════════════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    /* ── Preloader ── */
    const preloader = document.getElementById('preloader');
    const dismissPreloader = () => {
        if (!preloader.classList.contains('loaded')) {
            preloader.classList.add('loaded');
            startHeroAnimations();
        }
    };

    window.addEventListener('load', () => setTimeout(dismissPreloader, 2200));
    setTimeout(dismissPreloader, 4000); // safety fallback

    /* ── Initialize 3D Architectural Engine ── */
    const villaModel = new VillaModel();

    /* ── Initialize Scroll-Driven Animation Controller ── */
    const scrollController = new ScrollAnimationController(villaModel);

    /* ── 3D Viewport Dock Controls ── */
    const dockButtons = document.querySelectorAll('.dock-btn');
    dockButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            dockButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const mode = btn.dataset.mode;
            villaModel.setMode(mode);

            // If user clicked resort, scroll them into the view
            const cottagesSec = document.getElementById('cottages');
            if (cottagesSec && window.scrollY < cottagesSec.offsetTop - 100) {
                cottagesSec.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    const hotspotButtons = document.querySelectorAll('.hotspot-btn');
    hotspotButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            hotspotButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Set villa mode active on dock as well
            dockButtons.forEach(b => b.classList.toggle('active', b.dataset.mode === 'villa'));

            const spot = btn.dataset.hotspot;
            villaModel.focusHotspot(spot);

            const cottagesSec = document.getElementById('cottages');
            if (cottagesSec && (window.scrollY < cottagesSec.offsetTop || window.scrollY > cottagesSec.offsetTop + 1000)) {
                cottagesSec.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    /* ── Hero Entrance Sequence ── */
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

        // Cursor scale on hoverable items
        const hoverables = 'a, button, .glass-card, .gallery-item, .moodboard-card, .legend-item';
        document.querySelectorAll(hoverables).forEach(el => {
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

    /* ── Navbar Glass Header on Scroll ── */
    const nav = document.getElementById('main-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
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

    /* ── Smooth Navigation Scrolling ── */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    /* ── Floating Atmospheric Glow Orbs ── */
    const createFloatingOrbs = () => {
        const container = document.createElement('div');
        container.className = 'ambient-particles';
        document.body.appendChild(container);

        for (let i = 0; i < 6; i++) {
            const orb = document.createElement('div');
            orb.style.cssText = `
                position: absolute;
                width: ${40 + Math.random() * 80}px;
                height: ${40 + Math.random() * 80}px;
                border-radius: 50%;
                background: radial-gradient(circle, rgba(212, 169, 106, 0.08) 0%, transparent 70%);
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: float-orb ${10 + Math.random() * 8}s ease-in-out infinite;
                animation-delay: ${Math.random() * 4}s;
                pointer-events: none;
            `;
            container.appendChild(orb);
        }
    };
    createFloatingOrbs();

    /* ── Form Handler ── */
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('.btn-primary');
            const originalText = btn.textContent;
            btn.textContent = '✓ Enquiry Transmitted to AER Team';
            btn.style.background = 'linear-gradient(135deg, #2D6B3F, #3D8B55)';
            btn.style.color = '#fff';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
                btn.style.color = '';
                form.reset();
            }, 3500);
        });
    }

    console.log('%c AER — Anandamayee Eco Resort | Balasore, Odisha ', 'background: linear-gradient(135deg, #1A2F26, #2D4A3E); color: #D4A96A; font-size: 13px; font-weight: bold; padding: 8px 16px; border-radius: 4px;');
});
