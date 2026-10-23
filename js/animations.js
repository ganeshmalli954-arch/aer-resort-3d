/* ═══════════════════════════════════════════════════════════════════════════════
   AER — Scroll-Driven 3D Animation & Inspection Controller
   Directly drives:
   - 3D Model 360° Continuous Rotation (0° to 360°)
   - Camera Choreography & Perspective Interpolation
   - Exploded Cutaway View (Roof & Mezzanine Lift)
   - Synchronized Architectural Room Inspection Cards & Specs
   - Interactive Scrubber HUD & Angle Indicator
   - Bidirectional Navigation (Scroll <-> Scrubber <-> Room Buttons)
   ═══════════════════════════════════════════════════════════════════════════════ */

class ScrollAnimationController {
    constructor(villaModel) {
        this.villa = villaModel;
        this.currentPhaseIndex = -1;
        this.isUserDraggingScrubber = false;

        // UI DOM Elements
        this.elements = {
            card:           document.getElementById('inspection-card'),
            cardBadge:      document.getElementById('card-badge'),
            cardTitle:      document.getElementById('card-title'),
            cardSubtitle:   document.getElementById('card-subtitle'),
            cardDesc:       document.getElementById('card-desc'),
            cardSpecs:      document.getElementById('card-specs'),
            hlDimensions:   document.getElementById('hl-dimensions'),
            hlVolume:       document.getElementById('hl-volume'),
            hlFinishes:     document.getElementById('hl-finishes'),
            hlWater:        document.getElementById('hl-water'),
            hudAngleVal:    document.getElementById('hud-angle-val'),
            timelineSlider: document.getElementById('timeline-scrubber'),
            cutawaySlider:  document.getElementById('cutaway-slider'),
            cutawayVal:     document.getElementById('cutaway-val'),
            roomButtons:    document.querySelectorAll('.room-btn'),
            scrollTrack:    document.getElementById('scroll-track')
        };

        // 8 Architectural Inspection Phases
        this.phases = [
            {
                index: 0,
                progress: 0.0,
                angle: 0,
                camera: new THREE.Vector3(0, 4.0, 11.5),
                lookAt: new THREE.Vector3(0, 1.8, 0),
                cutaway: 0.0,
                badge: "EXTERIOR ELEVATION",
                title: "Private Teak Deck & Entrance",
                subtitle: "South Elevation • Ground Level Indoor-Outdoor Living",
                desc: "Cantilevered architectural timber eaves with dark standing seams and under-eave cove lighting. Frameless floor-to-ceiling glass sliders seamlessly connect the sunken living pavilion to a private weathered teak sun deck, equipped with an integrated infinity plunge pool, twin minimalist loungers, and ambient underwater illumination.",
                specs: ["🪵 Weathered Teak Planks", "🏊 Private Plunge Pool", "🪟 Frameless Glass Sliders", "✨ Floating LED Underglow"],
                highlights: {
                    dimensions: "225 sqft Interior • 140 sqft Teak Deck",
                    volume: "6.2m Double-Height Glass Lightwell",
                    finishes: "Natural Weathered Teak & Standing Seam Zinc",
                    water: "1.4m Depth Infinity Pool with Basalt Coping"
                },
                angleText: "0° — FRONT ELEVATION"
            },
            {
                index: 1,
                progress: 0.14,
                angle: -0.7,
                camera: new THREE.Vector3(5.5, 2.2, 7.5),
                lookAt: new THREE.Vector3(3.0, 0.8, 2.5),
                cutaway: 0.0,
                badge: "LANDSCAPE CONNECTION",
                title: "Infinity Water Horizon",
                subtitle: "East Elevation • Bay of Bengal Sunrise Orientation",
                desc: "Direct orientation toward coastal breezes and morning sunrise. The pool terrace extends flush with the water surface with dark honed basalt coping, framed by coastal sand and lush tropical vegetation, casting physically accurate water reflections across the living pavilion.",
                specs: ["🌅 Sunrise Orientation", "💡 Aquatic Cyan LED", "🏖️ Coastal Sand Buffer", "🌿 Native Palms"],
                highlights: {
                    dimensions: "4.2m x 3.2m Basin • 1.4m Depth",
                    volume: "Zero-Edge Overflow Toward Horizon",
                    finishes: "Dark Honed Basalt Wet Edge & Submerged Mosaic",
                    water: "Dual-Layer Dynamic Wave Ripples & Cyan Gradient"
                },
                angleText: "45° — EAST INFINITY POOL"
            },
            {
                index: 2,
                progress: 0.28,
                angle: -Math.PI * 0.75,
                camera: new THREE.Vector3(7.0, 7.5, 11.0),
                lookAt: new THREE.Vector3(0, 3.5, 0),
                cutaway: 1.0,
                badge: "STRUCTURAL CUTAWAY",
                title: "Exploded Architectural Cutaway",
                subtitle: "Cross-Section • Dual-Level Mezzanine Core",
                desc: "The standing-seam zinc roof lifts 4.2m and the first-floor mezzanine lifts 1.8m to reveal the entire open-concept interior volume: upper master suite, double-height lightwell, cantilevered floating staircase, and ground sunken conversation lounge.",
                specs: ["↕️ Dual-Level Layout", "💥 4.2m Structural Lift", "☀️ Central Skylight", "🏗️ Exposed Cantilever"],
                highlights: {
                    dimensions: "Dual-Level Structural Cross-Section",
                    volume: "4.2m Structural Lift • 1.8m Mezzanine Reveal",
                    finishes: "Exposed Cantilevered Beams & Oak Floor Slabs",
                    water: "Foundation Drainage & Sub-deck Linear LEDs"
                },
                angleText: "135° — EXPLODED CUTAWAY"
            },
            {
                index: 3,
                progress: 0.42,
                angle: -Math.PI * 0.95,
                camera: new THREE.Vector3(-2.0, 4.4, 4.5),
                lookAt: new THREE.Vector3(-2.4, 3.8, -1.5),
                cutaway: 0.35,
                badge: "MEZZANINE SUITE",
                title: "Master Bedroom Suite",
                subtitle: "First Floor Mezzanine • Acoustic Oak & Indirect Light",
                desc: "A full-height feature wall of vertical fluted dark oak slats with recessed 2700K warm LED cove backlighting. Low-profile Japanese platform king bed in champagne velvet, flanked by floating oak nightstands and bronze drop globe sconces overlooking the glass lightwell.",
                specs: ["🪵 Fluted Oak Slats", "✨ 2700K Cove LED Strip", "🛏️ Low Platform Bed", "🛡️ Glass Balustrade"],
                highlights: {
                    dimensions: "King Bed Platform • 180 sqft Mezzanine",
                    volume: "2.8m Headroom Under Angled Zinc Soffit",
                    finishes: "Dark Fluted Oak Slats & French Oak Parquet",
                    water: "Ensuite Transition to Calacatta Spa Washroom"
                },
                angleText: "180° — MASTER BEDROOM SUITE"
            },
            {
                index: 4,
                progress: 0.56,
                angle: -Math.PI * 1.3,
                camera: new THREE.Vector3(1.8, 4.3, 2.0),
                lookAt: new THREE.Vector3(0.6, 3.6, -1.8),
                cutaway: 0.35,
                badge: "WELLNESS SUITE",
                title: "Calacatta Spa Washroom",
                subtitle: "First Floor Wellness • Italian Stone & Living Botanical",
                desc: "Floor-to-ceiling bookmatched Italian Calacatta Gold marble paired with a freestanding matte-black stone soaking tub resting on a slatted teak drainage mat, brushed brass floor-mounted mixer, floating circular backlit mirror, and a vertical preserved organic moss wall.",
                specs: ["🏛️ Calacatta Gold Marble", "🛁 Matte Black Oval Tub", "🌿 Preserved Living Moss", "🪞 Backlit Floating Mirror"],
                highlights: {
                    dimensions: "1.7m Matte Black Oval Soaking Tub",
                    volume: "Double-Height Vanity Niche with Halo Mirror",
                    finishes: "Bookmatched Calacatta Gold & Preserved Moss",
                    water: "Brushed Brass Floor Mixer & Concealed Drain"
                },
                angleText: "240° — CALACATTA SPA BATH"
            },
            {
                index: 5,
                progress: 0.70,
                angle: -Math.PI * 1.65,
                camera: new THREE.Vector3(-1.0, 2.0, 3.8),
                lookAt: new THREE.Vector3(-2.0, 0.9, -1.0),
                cutaway: 0.2,
                badge: "GROUND FLOOR LIVING",
                title: "Sunken Lounge & Courtyard Tree",
                subtitle: "Ground Level Living • Biophilic Lightwell Centerpiece",
                desc: "Step-down sunken conversation pit upholstered in champagne velvet with low honed marble coffee table. At the center of the lightwell sits an indoor Japanese ficus tree rooted in a circular pearl stone pebble bed, illuminated by ceiling downlights and natural skylight.",
                specs: ["🛋️ Sunken Conversation Pit", "🌳 Courtyard Japanese Tree", "☕ Low Honed Marble Table", "💡 Recessed Ceiling Spots"],
                highlights: {
                    dimensions: "2-Step Recessed Conversation Pit",
                    volume: "6.2m Atrium Open to Architectural Skylight",
                    finishes: "Champagne Velvet Modular Sofa & Marble Plinth",
                    water: "Indoor Planter Bed with River Stones & Mini Uplights"
                },
                angleText: "300° — SUNKEN LIVING LOUNGE"
            },
            {
                index: 6,
                progress: 0.84,
                angle: -Math.PI * 1.88,
                camera: new THREE.Vector3(-3.2, 2.2, -1.0),
                lookAt: new THREE.Vector3(-4.5, 1.8, -3.2),
                cutaway: 0.15,
                badge: "ARCHITECTURAL STAIRCASE",
                title: "Eurostairs Floating Stairs",
                subtitle: "Circulation Spine • Cantilevered Oak & Concealed LEDs",
                desc: "Cantilevered floating staircase system: solid dark oak treads floating seamlessly out of the fluted wood wall with step-by-step integrated under-tread warm LED strips and a frameless 15mm tempered glass balustrade with champagne handrail.",
                specs: ["🪵 Eurostairs Solid Oak", "💡 Under-Tread LED Strips", "🛡️ 15mm Glass Balustrade", "✨ Champagne Slim Rail"],
                highlights: {
                    dimensions: "11 Cantilevered Solid Oak Treads (80mm thick)",
                    volume: "Seamless Double-Height Circulation Spine",
                    finishes: "Solid French Oak & 15mm Architectural Glass",
                    water: "Integrated Step-by-Step 2700K Linear LED Glow"
                },
                angleText: "340° — FLOATING EUROSTAIRS"
            },
            {
                index: 7,
                progress: 1.0,
                angle: -Math.PI * 2.0,
                camera: new THREE.Vector3(0, 5.0, 14.0),
                lookAt: new THREE.Vector3(0, 1.8, 0),
                cutaway: 0.0,
                badge: "FULL ASSEMBLED OVERVIEW",
                title: "Complete Villa Architecture",
                subtitle: "360° Panoramic View • Balasore Eco Resort",
                desc: "The luxury cottage fully assembled in its coastal setting, showcasing the harmony of fluted timber, Italian Calacatta marble, seamless glass glazing, standing-seam zinc roof, and private infinity plunge pool deck. Switch to Master Site Plan 3D to see all 10 cottages arranged on site.",
                specs: ["🏡 10 Luxury Cottages", "🏊 1,800 sqft Main Pool", "🏛️ 2,000 sqft Banquet Hall", "🌳 Eco Treehouse & Huts"],
                highlights: {
                    dimensions: "Full 225 sqft Luxury Cottage Footprint",
                    volume: "Integrated Indoor-Outdoor Tropical Pavilion",
                    finishes: "PBR Calacatta • Oak • Teak • Basalt • Zinc",
                    water: "Photorealistic Aquatic Shading & Ambient Lighting"
                },
                angleText: "360° — COMPLETE OVERVIEW"
            }
        ];

        this.initScrollTrigger();
        this.initControls();
        this.updatePhaseUI(0);
    }

    /* ── GSAP ScrollTrigger Integration ── */
    initScrollTrigger() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        gsap.registerPlugin(ScrollTrigger);

        // Continuous master timeline driven by scroll-track
        ScrollTrigger.create({
            trigger: '#scroll-track',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.0,
            onUpdate: (self) => {
                if (this.isUserDraggingScrubber) return;
                const progress = self.progress;
                this.applyProgress(progress);
            }
        });
    }

    /* ── Synchronize Model, Camera, UI to Progress (0.0 to 1.0) ── */
    applyProgress(p) {
        if (this.villa.activeMode === 'resort') {
            return;
        }

        // 1. Model Rotation 360°
        const rotationAngle = -p * Math.PI * 2;
        this.villa.setRotationAngle(rotationAngle);

        // 2. Interpolate Camera & LookAt
        const interpolated = this.interpolatePhase(p);
        this.villa.targetCameraPos.copy(interpolated.camera);
        this.villa.targetLookAt.copy(interpolated.lookAt);

        // 3. Cutaway explosion progress
        this.villa.setExplosionProgress(interpolated.cutaway);
        if (this.elements.cutawaySlider) {
            this.elements.cutawaySlider.value = Math.round(interpolated.cutaway * 100);
        }
        if (this.elements.cutawayVal) {
            this.elements.cutawayVal.textContent = `${Math.round(interpolated.cutaway * 100)}%`;
        }

        // 4. Update HUD angle & timeline slider
        const degrees = Math.round(p * 360);
        if (this.elements.timelineSlider && !this.isUserDraggingScrubber) {
            this.elements.timelineSlider.value = Math.round(p * 1000);
        }

        // 5. Detect and update active Phase Card
        const phaseIndex = this.getClosestPhaseIndex(p);
        if (phaseIndex !== this.currentPhaseIndex) {
            this.updatePhaseUI(phaseIndex);
        }

        // Update HUD angle label
        const activePhase = this.phases[phaseIndex];
        if (this.elements.hudAngleVal && activePhase) {
            this.elements.hudAngleVal.textContent = `${degrees}° — ${activePhase.angleText.split('—')[1] || activePhase.title.toUpperCase()}`;
        }
    }

    /* ── Interpolate between closest phase keyframes ── */
    interpolatePhase(p) {
        // Clamp
        p = Math.max(0, Math.min(1, p));

        for (let i = 0; i < this.phases.length - 1; i++) {
            const pA = this.phases[i];
            const pB = this.phases[i + 1];

            if (p >= pA.progress && p <= pB.progress) {
                const range = pB.progress - pA.progress;
                const t = (range === 0) ? 0 : (p - pA.progress) / range;
                const smoothT = gsap.parseEase('power2.inOut')(t);

                const cam = new THREE.Vector3().lerpVectors(pA.camera, pB.camera, smoothT);
                const look = new THREE.Vector3().lerpVectors(pA.lookAt, pB.lookAt, smoothT);
                const cutaway = THREE.MathUtils.lerp(pA.cutaway, pB.cutaway, smoothT);

                return { camera: cam, lookAt: look, cutaway: cutaway };
            }
        }

        const last = this.phases[this.phases.length - 1];
        return { camera: last.camera, lookAt: last.lookAt, cutaway: last.cutaway };
    }

    getClosestPhaseIndex(p) {
        let closestDist = Infinity;
        let closestIdx = 0;
        this.phases.forEach((phase, idx) => {
            const dist = Math.abs(p - phase.progress);
            if (dist < closestDist) {
                closestDist = dist;
                closestIdx = idx;
            }
        });
        return closestIdx;
    }

    /* ── Update Right Inspection Card UI ── */
    updatePhaseUI(phaseIndex) {
        this.currentPhaseIndex = phaseIndex;
        const phase = this.phases[phaseIndex];
        if (!phase) return;

        // Synchronously set content immediately to avoid race conditions during fast scrolling/jumping
        this.setCardContent(phase);

        // Animate card content transition with GSAP cleanly
        if (typeof gsap !== 'undefined' && this.elements.card) {
            gsap.killTweensOf(this.elements.card);
            gsap.fromTo(this.elements.card,
                { opacity: 0.8, y: 3 },
                { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' }
            );
        }

        // Update active state in Left Room Dock
        this.elements.roomButtons.forEach(btn => {
            const btnPhase = parseInt(btn.dataset.phase, 10);
            btn.classList.toggle('active', btnPhase === phaseIndex);
        });
    }

    setCardContent(phase) {
        if (this.elements.cardBadge) this.elements.cardBadge.textContent = phase.badge;
        if (this.elements.cardTitle) this.elements.cardTitle.textContent = phase.title;
        if (this.elements.cardSubtitle) this.elements.cardSubtitle.textContent = phase.subtitle;
        if (this.elements.cardDesc) this.elements.cardDesc.textContent = phase.desc;

        // Render specs tags
        if (this.elements.cardSpecs) {
            this.elements.cardSpecs.innerHTML = phase.specs.map(spec => `<span class="spec-tag">${spec}</span>`).join('');
        }

        // Update Architectural Highlights
        if (phase.highlights) {
            if (this.elements.hlDimensions) this.elements.hlDimensions.textContent = phase.highlights.dimensions;
            if (this.elements.hlVolume) this.elements.hlVolume.textContent = phase.highlights.volume;
            if (this.elements.hlFinishes) this.elements.hlFinishes.textContent = phase.highlights.finishes;
            if (this.elements.hlWater) this.elements.hlWater.textContent = phase.highlights.water;
        }
    }

    /* ── Event Listeners for UI Controls ── */
    initControls() {
        // 1. Room Dock Buttons Click -> Jump to Phase
        this.elements.roomButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const phaseIdx = parseInt(btn.dataset.phase, 10);
                this.jumpToPhase(phaseIdx);
            });
        });

        // 2. Timeline Scrubber Slider Drag
        if (this.elements.timelineSlider) {
            this.elements.timelineSlider.addEventListener('input', (e) => {
                this.isUserDraggingScrubber = true;
                const p = parseFloat(e.target.value) / 1000;
                this.applyProgress(p);
            });

            this.elements.timelineSlider.addEventListener('change', (e) => {
                const p = parseFloat(e.target.value) / 1000;
                this.isUserDraggingScrubber = false;
                this.scrollWindowToProgress(p);
            });
        }

        // 3. Cutaway Roof Lift Slider
        if (this.elements.cutawaySlider) {
            this.elements.cutawaySlider.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value) / 100;
                this.villa.setExplosionProgress(val);
                if (this.elements.cutawayVal) {
                    this.elements.cutawayVal.textContent = `${Math.round(val * 100)}%`;
                }
            });
        }
    }

    jumpToPhase(phaseIndex) {
        const phase = this.phases[phaseIndex];
        if (!phase) return;

        this.scrollWindowToProgress(phase.progress);
        this.applyProgress(phase.progress);
        this.updatePhaseUI(phaseIndex);
    }

    scrollWindowToProgress(progress) {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const targetScroll = progress * maxScroll;
        window.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
        });
    }
}

window.ScrollAnimationController = ScrollAnimationController;
