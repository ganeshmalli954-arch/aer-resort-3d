/* ═══════════════════════════════════════════════════════════════
   Scroll-Driven 3D Animation Controller
   Uses GSAP ScrollTrigger to control villa rotation,
   camera movement, and info panel reveals
   ═══════════════════════════════════════════════════════════════ */

class ScrollAnimationController {
    constructor(villaModel) {
        this.villa = villaModel;
        this.infoPanels = {
            front: document.getElementById('info-front'),
            right: document.getElementById('info-right'),
            back:  document.getElementById('info-back'),
            left:  document.getElementById('info-left'),
            top:   document.getElementById('info-top'),
        };

        gsap.registerPlugin(ScrollTrigger);
        this.setupScrollAnimations();
        this.setupSectionReveals();
        this.setupNavHighlighting();
    }

    /* ── Main 3D Scroll Animation ── */
    setupScrollAnimations() {
        const cottagesSection = document.getElementById('cottages');
        if (!cottagesSection) return;

        // Master timeline pinned to the cottages section
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: cottagesSection,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1.5,
                pin: false,
                onUpdate: (self) => {
                    this.updateInfoPanels(self.progress);
                }
            }
        });

        // Phase 1: Front view (0% - 15%) — Initial approach
        tl.to(this.villa.resortGroup.rotation, {
            y: 0,
            duration: 15,
        }, 0);

        tl.to(this.villa.camera.position, {
            z: 10,
            y: 3,
            duration: 15,
        }, 0);

        // Phase 2: Rotate to right/east side (15% - 35%)
        tl.to(this.villa.resortGroup.rotation, {
            y: -Math.PI / 2,
            duration: 20,
        }, 15);

        tl.to(this.villa.camera.position, {
            z: 11,
            y: 4,
            duration: 20,
        }, 15);

        // Phase 3: Rotate to back/rear (35% - 55%)
        tl.to(this.villa.resortGroup.rotation, {
            y: -Math.PI,
            duration: 20,
        }, 35);

        tl.to(this.villa.camera.position, {
            z: 12,
            y: 3.5,
            duration: 20,
        }, 35);

        // Phase 4: Rotate to left/west side (55% - 75%)
        tl.to(this.villa.resortGroup.rotation, {
            y: -Math.PI * 1.5,
            duration: 20,
        }, 55);

        tl.to(this.villa.camera.position, {
            z: 11,
            y: 4.5,
            duration: 20,
        }, 55);

        // Phase 5: Top-down view (75% - 90%)
        tl.to(this.villa.resortGroup.rotation, {
            y: -Math.PI * 2,
            duration: 15,
        }, 75);

        tl.to(this.villa.camera.position, {
            z: 8,
            y: 12,
            duration: 15,
        }, 75);

        // Phase 6: Final sweep back to front (90% - 100%)
        tl.to(this.villa.resortGroup.rotation, {
            y: -Math.PI * 2.25,
            duration: 10,
        }, 90);

        tl.to(this.villa.camera.position, {
            z: 14,
            y: 5,
            duration: 10,
        }, 90);

        // ── Canvas visibility based on scroll ──
        ScrollTrigger.create({
            trigger: cottagesSection,
            start: 'top 80%',
            end: 'bottom 20%',
            onEnter: () => {
                gsap.to('#villa-canvas', { opacity: 1, duration: 1 });
            },
            onLeave: () => {
                gsap.to('#villa-canvas', { opacity: 0.15, duration: 1 });
            },
            onEnterBack: () => {
                gsap.to('#villa-canvas', { opacity: 1, duration: 1 });
            },
            onLeaveBack: () => {
                gsap.to('#villa-canvas', { opacity: 0.15, duration: 1 });
            }
        });

        // Set initial low opacity for canvas
        gsap.set('#villa-canvas', { opacity: 0.15 });
    }

    /* ── Info Panel Visibility Based on Scroll Progress ── */
    updateInfoPanels(progress) {
        // Define when each panel should appear
        const panels = [
            { id: 'front', start: 0.02, end: 0.14 },
            { id: 'right', start: 0.18, end: 0.33 },
            { id: 'back',  start: 0.38, end: 0.53 },
            { id: 'left',  start: 0.58, end: 0.73 },
            { id: 'top',   start: 0.77, end: 0.88 },
        ];

        panels.forEach(({ id, start, end }) => {
            const panel = this.infoPanels[id];
            if (!panel) return;

            if (progress >= start && progress <= end) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });
    }

    /* ── Section Reveal Animations ── */
    setupSectionReveals() {
        // About section
        gsap.from('#about .section-header', {
            scrollTrigger: {
                trigger: '#about',
                start: 'top 70%',
                toggleActions: 'play none none reverse',
            },
            y: 60,
            opacity: 0,
            duration: 1,
            ease: 'power3.out',
        });

        gsap.from('#about .about-text', {
            scrollTrigger: {
                trigger: '#about .about-grid',
                start: 'top 65%',
                toggleActions: 'play none none reverse',
            },
            x: -60,
            opacity: 0,
            duration: 1,
            ease: 'power3.out',
        });

        gsap.from('#about .about-image', {
            scrollTrigger: {
                trigger: '#about .about-grid',
                start: 'top 65%',
                toggleActions: 'play none none reverse',
            },
            x: 60,
            opacity: 0,
            duration: 1,
            delay: 0.2,
            ease: 'power3.out',
        });

        gsap.from('#about .stat', {
            scrollTrigger: {
                trigger: '#about .about-stats',
                start: 'top 80%',
                toggleActions: 'play none none reverse',
            },
            y: 30,
            opacity: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
        });

        // Cottages section header
        gsap.from('#cottages .section-header', {
            scrollTrigger: {
                trigger: '#cottages',
                start: 'top 60%',
                toggleActions: 'play none none reverse',
            },
            y: 60,
            opacity: 0,
            duration: 1,
            ease: 'power3.out',
        });

        // Gallery
        gsap.from('#gallery .section-header', {
            scrollTrigger: {
                trigger: '#gallery',
                start: 'top 70%',
                toggleActions: 'play none none reverse',
            },
            y: 60,
            opacity: 0,
            duration: 1,
            ease: 'power3.out',
        });

        gsap.from('#gallery .gallery-item', {
            scrollTrigger: {
                trigger: '#gallery .gallery-grid',
                start: 'top 70%',
                toggleActions: 'play none none reverse',
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power3.out',
        });

        // Video
        gsap.from('#video-section .video-container', {
            scrollTrigger: {
                trigger: '#video-section',
                start: 'top 70%',
                toggleActions: 'play none none reverse',
            },
            y: 60,
            opacity: 0,
            scale: 0.95,
            duration: 1,
            ease: 'power3.out',
        });

        // Amenities
        gsap.from('#amenities .section-header', {
            scrollTrigger: {
                trigger: '#amenities',
                start: 'top 70%',
                toggleActions: 'play none none reverse',
            },
            y: 60,
            opacity: 0,
            duration: 1,
            ease: 'power3.out',
        });

        gsap.from('#amenities .amenity-card', {
            scrollTrigger: {
                trigger: '#amenities .amenities-grid',
                start: 'top 70%',
                toggleActions: 'play none none reverse',
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out',
        });

        // Contact
        gsap.from('#contact .section-header', {
            scrollTrigger: {
                trigger: '#contact',
                start: 'top 70%',
                toggleActions: 'play none none reverse',
            },
            y: 60,
            opacity: 0,
            duration: 1,
            ease: 'power3.out',
        });

        gsap.from('#contact .contact-info', {
            scrollTrigger: {
                trigger: '#contact .contact-grid',
                start: 'top 70%',
                toggleActions: 'play none none reverse',
            },
            x: -60,
            opacity: 0,
            duration: 1,
            ease: 'power3.out',
        });

        gsap.from('#contact .contact-form', {
            scrollTrigger: {
                trigger: '#contact .contact-grid',
                start: 'top 70%',
                toggleActions: 'play none none reverse',
            },
            x: 60,
            opacity: 0,
            duration: 1,
            delay: 0.2,
            ease: 'power3.out',
        });
    }

    /* ── Nav Active State ── */
    setupNavHighlighting() {
        const sections = ['hero', 'about', 'cottages', 'gallery', 'amenities', 'contact'];

        sections.forEach(id => {
            ScrollTrigger.create({
                trigger: `#${id}`,
                start: 'top 40%',
                end: 'bottom 40%',
                onEnter: () => this.setActiveNav(id),
                onEnterBack: () => this.setActiveNav(id),
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
