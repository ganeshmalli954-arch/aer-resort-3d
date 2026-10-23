/* ═══════════════════════════════════════════════════════════════════════════════
   AER — Scroll-Driven 3D Animation Controller
   Directly drives:
   - 3D Model 360° Rotation & Camera Perspectives
   - Exploded View Cutaway (Roof & Floor lifting to reveal interior)
   - Synchronized Info Panels (Master Suite, Spa Bath, Sunken Lounge, Deck)
   - Dynamic Camera Zoom into Reference Architectures
   ═══════════════════════════════════════════════════════════════════════════════ */

class ScrollAnimationController {
    constructor(villaModel) {
        this.villa = villaModel;
        this.infoPanels = {
            front:        document.getElementById('info-front'),
            right:        document.getElementById('info-right'),
            back:         document.getElementById('info-back'),
            left:         document.getElementById('info-left'),
            top:          document.getElementById('info-top'),
            exploded:     document.getElementById('info-exploded'),
            masterSuite:  document.getElementById('info-suite'),
            washroom:     document.getElementById('info-washroom'),
            lounge:       document.getElementById('info-lounge')
        };

        gsap.registerPlugin(ScrollTrigger);
        this.setupScrollAnimations();
        this.setupSectionReveals();
        this.setupNavHighlighting();
    }

    /* ── Main 3D Scroll-Driven Choreography ── */
    setupScrollAnimations() {
        const cottagesSection = document.getElementById('cottages');
        if (!cottagesSection) return;

        // Master Timeline scrubbed to scroll position
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: cottagesSection,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1.2,
                pin: false,
                onUpdate: (self) => {
                    const p = self.progress;
                    this.updateInfoPanels(p);

                    // Exploded View Cutaway Control (Progress 0.45 -> 0.75)
                    if (p >= 0.42 && p <= 0.78) {
                        const explosionP = (p - 0.42) / 0.36;
                        // Peak explosion around midpoint
                        const expCurve = Math.sin(explosionP * Math.PI);
                        this.villa.setExplosionProgress(expCurve * 1.0);
                    } else {
                        this.villa.setExplosionProgress(0.0);
                    }
                }
            }
        });

        // ── Phase 1 (0% - 18%): Front Exterior & Infinity Deck Approach ──
        tl.to(this.villa.villaOverviewGroup.rotation, {
            y: 0.15,
            duration: 18,
            ease: 'none'
        }, 0);
        tl.to(this.villa.targetCameraPos, {
            x: 0,
            y: 4.0,
            z: 11.5,
            duration: 18,
            ease: 'none'
        }, 0);
        tl.to(this.villa.targetLookAt, {
            x: 0,
            y: 1.8,
            z: 0,
            duration: 18,
            ease: 'none'
        }, 0);

        // ── Phase 2 (18% - 35%): Orbit to East Garden & Private Pool ──
        tl.to(this.villa.villaOverviewGroup.rotation, {
            y: -Math.PI * 0.45,
            duration: 17,
            ease: 'none'
        }, 18);
        tl.to(this.villa.targetCameraPos, {
            x: 6.5,
            y: 3.5,
            z: 8.5,
            duration: 17,
            ease: 'none'
        }, 18);
        tl.to(this.villa.targetLookAt, {
            x: 1.5,
            y: 1.2,
            z: 1.0,
            duration: 17,
            ease: 'none'
        }, 18);

        // ── Phase 3 (35% - 52%): Exploded View Initiation & Master Suite Reveal ──
        tl.to(this.villa.villaOverviewGroup.rotation, {
            y: -Math.PI * 0.85,
            duration: 17,
            ease: 'none'
        }, 35);
        tl.to(this.villa.targetCameraPos, {
            x: 5.0,
            y: 7.2,
            z: 10.0,
            duration: 17,
            ease: 'none'
        }, 35);
        tl.to(this.villa.targetLookAt, {
            x: -1.0,
            y: 2.8,
            z: 0.5,
            duration: 17,
            ease: 'none'
        }, 35);

        // ── Phase 4 (52% - 70%): Dive into Luxury Spa Bath & Floating Glass Stairs ──
        tl.to(this.villa.villaOverviewGroup.rotation, {
            y: -Math.PI * 1.35,
            duration: 18,
            ease: 'none'
        }, 52);
        tl.to(this.villa.targetCameraPos, {
            x: -2.5,
            y: 4.8,
            z: 6.5,
            duration: 18,
            ease: 'none'
        }, 52);
        tl.to(this.villa.targetLookAt, {
            x: -2.0,
            y: 2.2,
            z: -1.0,
            duration: 18,
            ease: 'none'
        }, 52);

        // ── Phase 5 (70% - 88%): Sunken Living Lounge, Courtyard Tree & Fluted Wall ──
        tl.to(this.villa.villaOverviewGroup.rotation, {
            y: -Math.PI * 1.85,
            duration: 18,
            ease: 'none'
        }, 70);
        tl.to(this.villa.targetCameraPos, {
            x: -0.5,
            y: 2.8,
            z: 6.8,
            duration: 18,
            ease: 'none'
        }, 70);
        tl.to(this.villa.targetLookAt, {
            x: -1.2,
            y: 1.0,
            z: -0.8,
            duration: 18,
            ease: 'none'
        }, 70);

        // ── Phase 6 (88% - 100%): Full Architectural Orbit & Sea Horizon Panorama ──
        tl.to(this.villa.villaOverviewGroup.rotation, {
            y: -Math.PI * 2.1,
            duration: 12,
            ease: 'none'
        }, 88);
        tl.to(this.villa.targetCameraPos, {
            x: 0,
            y: 5.5,
            z: 13.0,
            duration: 12,
            ease: 'none'
        }, 88);
        tl.to(this.villa.targetLookAt, {
            x: 0,
            y: 1.8,
            z: 0,
            duration: 12,
            ease: 'none'
        }, 88);

        // Canvas Opacity fade based on scroll viewport
        ScrollTrigger.create({
            trigger: cottagesSection,
            start: 'top 85%',
            end: 'bottom 15%',
            onEnter: () => gsap.to('#villa-canvas', { opacity: 1, duration: 0.8 }),
            onLeave: () => gsap.to('#villa-canvas', { opacity: 0.12, duration: 0.8 }),
            onEnterBack: () => gsap.to('#villa-canvas', { opacity: 1, duration: 0.8 }),
            onLeaveBack: () => gsap.to('#villa-canvas', { opacity: 0.12, duration: 0.8 })
        });
    }

    /* ── Info Panel Visibility Breakdown ── */
    updateInfoPanels(progress) {
        const ranges = [
            { id: 'front',        start: 0.02, end: 0.16 },
            { id: 'right',        start: 0.18, end: 0.32 },
            { id: 'exploded',     start: 0.35, end: 0.48 },
            { id: 'masterSuite',  start: 0.50, end: 0.63 },
            { id: 'washroom',     start: 0.65, end: 0.78 },
            { id: 'lounge',       start: 0.80, end: 0.94 }
        ];

        ranges.forEach(({ id, start, end }) => {
            const panel = this.infoPanels[id];
            if (!panel) return;

            if (progress >= start && progress <= end) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });
    }

    /* ── Content Section Reveals ── */
    setupSectionReveals() {
        const fadeConfigs = [
            { trigger: '#about',        header: '#about .section-header',   elements: '#about .about-text, #about .about-image' },
            { trigger: '#blueprint',    header: '#blueprint .section-header', elements: '#blueprint .blueprint-wrapper, #blueprint .blueprint-sidebar' },
            { trigger: '#cottages',     header: '#cottages .section-header',  elements: '#cottages .villa-controls' },
            { trigger: '#moodboard',    header: '#moodboard .section-header', elements: '#moodboard .moodboard-grid' },
            { trigger: '#gallery',      header: '#gallery .section-header',  elements: '#gallery .gallery-grid' },
            { trigger: '#amenities',    header: '#amenities .section-header', elements: '#amenities .amenity-card' },
            { trigger: '#contact',      header: '#contact .section-header',   elements: '#contact .contact-grid' }
        ];

        fadeConfigs.forEach(cfg => {
            if (document.querySelector(cfg.trigger)) {
                gsap.from(cfg.header, {
                    scrollTrigger: {
                        trigger: cfg.trigger,
                        start: 'top 75%',
                        toggleActions: 'play none none reverse'
                    },
                    y: 40,
                    opacity: 0,
                    duration: 0.9,
                    ease: 'power3.out'
                });

                if (cfg.elements) {
                    gsap.from(cfg.elements, {
                        scrollTrigger: {
                            trigger: cfg.trigger,
                            start: 'top 65%',
                            toggleActions: 'play none none reverse'
                        },
                        y: 35,
                        opacity: 0,
                        duration: 0.9,
                        stagger: 0.12,
                        ease: 'power3.out'
                    });
                }
            }
        });
    }

    /* ── Nav Highlighting ── */
    setupNavHighlighting() {
        const sections = ['hero', 'about', 'blueprint', 'cottages', 'moodboard', 'gallery', 'amenities', 'contact'];
        sections.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            ScrollTrigger.create({
                trigger: el,
                start: 'top 40%',
                end: 'bottom 40%',
                onEnter: () => this.setActiveNav(id),
                onEnterBack: () => this.setActiveNav(id)
            });
        });
    }

    setActiveNav(id) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.section === id);
        });
    }
}

window.ScrollAnimationController = ScrollAnimationController;
