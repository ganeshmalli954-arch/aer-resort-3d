/* ═══════════════════════════════════════════════════════════════════════════════
   AER — Villa Viewpoint Controller
   Replaces the old ScrollAnimationController scroll-tour with smooth GSAP
   camera transitions between named architectural inspection viewpoints.

   Public interface (test-compatible):
     new VillaViewpointController(villaModel)
     .jumpToPhase(index)          — move to viewpoint 0-7
     .updatePhaseUI(index)        — sync card & dock UI
     .currentPhaseIndex           — currently active index (-1 to 7)
   ═══════════════════════════════════════════════════════════════════════════════ */

class VillaViewpointController {
    constructor(villaModel) {
        this.villa = villaModel;
        this.currentPhaseIndex = -1;

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
            cutawaySlider:  document.getElementById('cutaway-slider'),
            cutawayVal:     document.getElementById('cutaway-val'),
            roomButtons:    document.querySelectorAll('#villa-dock-panel .room-btn')
        };

        /* ── 8 Villa Viewpoints (replaces 8-phase scroll tour) ──
           Phase indices are preserved for test compatibility.
           Phase 7 is "Rear Exterior / Aerial" instead of "360° Overview". */
        this.phases = [
            {
                index: 0,
                hotspot: 'front',
                camera: new THREE.Vector3(0, 4.0, 11.5),
                lookAt:  new THREE.Vector3(0, 1.8, 0),
                rotation: 0,
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
                angleText: "0° — FRONT EXTERIOR"
            },
            {
                index: 1,
                hotspot: 'infinityPool',
                camera: new THREE.Vector3(5.5, 2.2, 7.5),
                lookAt:  new THREE.Vector3(3.0, 0.8, 2.5),
                rotation: -0.7,
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
                angleText: "45° — POOL & TERRACE"
            },
            {
                index: 2,
                hotspot: 'exploded',
                camera: new THREE.Vector3(7.0, 7.5, 11.0),
                lookAt:  new THREE.Vector3(0, 3.5, 0),
                rotation: -Math.PI * 0.75,
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
                angleText: "135° — CUTAWAY SECTION"
            },
            {
                index: 3,
                hotspot: 'masterSuite',
                camera: new THREE.Vector3(-2.0, 4.4, 4.5),
                lookAt:  new THREE.Vector3(-2.4, 3.8, -1.5),
                rotation: -Math.PI * 0.95,
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
                hotspot: 'bathroom',
                camera: new THREE.Vector3(1.8, 4.3, 2.0),
                lookAt:  new THREE.Vector3(0.6, 3.6, -1.8),
                rotation: -Math.PI * 1.3,
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
                hotspot: 'sunkenLounge',
                camera: new THREE.Vector3(-1.0, 2.0, 3.8),
                lookAt:  new THREE.Vector3(-2.0, 0.9, -1.0),
                rotation: -Math.PI * 1.65,
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
                hotspot: 'floatingStairs',
                camera: new THREE.Vector3(-3.2, 2.2, -1.0),
                lookAt:  new THREE.Vector3(-4.5, 1.8, -3.2),
                rotation: -Math.PI * 1.88,
                cutaway: 0.15,
                badge: "ARCHITECTURAL STAIRCASE",
                title: "Floating Stairs",
                subtitle: "Circulation Spine • Cantilevered Oak & Concealed LEDs",
                desc: "Cantilevered floating staircase system: solid dark oak treads floating seamlessly out of the fluted wood wall with step-by-step integrated under-tread warm LED strips and a frameless 15mm tempered glass balustrade with champagne handrail.",
                specs: ["🪵 Solid Oak Treads", "💡 Under-Tread LED Strips", "🛡️ 15mm Glass Balustrade", "✨ Champagne Slim Rail"],
                highlights: {
                    dimensions: "11 Cantilevered Solid Oak Treads (80mm thick)",
                    volume: "Seamless Double-Height Circulation Spine",
                    finishes: "Solid French Oak & 15mm Architectural Glass",
                    water: "Integrated Step-by-Step 2700K Linear LED Glow"
                },
                angleText: "340° — FLOATING STAIRS"
            },
            {
                index: 7,
                hotspot: 'rearExterior',
                camera: new THREE.Vector3(0, 8.0, -14.0),
                lookAt:  new THREE.Vector3(0, 2.0, 0),
                rotation: -Math.PI,
                cutaway: 0.0,
                badge: "REAR EXTERIOR",
                title: "Rear Elevation & Landscape",
                subtitle: "North Elevation • Tropical Garden Setting",
                desc: "The rear elevation reveals the full depth of the tropical landscape: dense coconut palms, native shrubbery, and the private garden terrace. The standing-seam zinc roof line and deep eaves read clearly against the coastal sky.",
                specs: ["🌴 Tropical Landscape", "🏡 Full Depth Elevation", "🌿 Native Vegetation", "☁️ Coastal Sky Setting"],
                highlights: {
                    dimensions: "Full 225 sqft Luxury Cottage Footprint",
                    volume: "Integrated Indoor-Outdoor Tropical Pavilion",
                    finishes: "PBR Calacatta • Oak • Teak • Basalt • Zinc",
                    water: "Photorealistic Aquatic Shading & Ambient Lighting"
                },
                angleText: "360° — REAR EXTERIOR"
            }
        ];

        this.initControls();
        this.updatePhaseUI(0);
    }

    /* ── Jump camera to a named viewpoint by phase index ── */
    jumpToPhase(phaseIndex) {
        const phase = this.phases[phaseIndex];
        if (!phase) return;

        // If not in villa mode, switch to villa mode
        if (this.villa.activeMode !== 'villa') {
            const btnVilla = document.getElementById('btn-mode-villa');
            if (btnVilla) {
                btnVilla.click();
            } else {
                this.villa.setMode('villa');
            }
        }

        // Set camera position directly
        if (this.villa.camera) {
            this.villa.camera.position.copy(phase.camera);
        }
        // Update OrbitControls target to look-at point
        if (this.villa.controls) {
            this.villa.controls.target.copy(phase.lookAt);
            this.villa.controls.update();
        }

        this.villa.setRotationAngle(phase.rotation);
        this.villa.setExplosionProgress(phase.cutaway);

        // Sync cutaway slider
        if (this.elements.cutawaySlider) {
            this.elements.cutawaySlider.value = Math.round(phase.cutaway * 100);
        }
        if (this.elements.cutawayVal) {
            this.elements.cutawayVal.textContent = `${Math.round(phase.cutaway * 100)}%`;
        }

        this.updatePhaseUI(phaseIndex);
    }

    /* ── Update UI card & dock active state ── */
    updatePhaseUI(phaseIndex) {
        this.currentPhaseIndex = phaseIndex;
        const phase = this.phases[phaseIndex];
        if (!phase) return;

        this.setCardContent(phase);

        // Animate card with GSAP if available
        if (typeof gsap !== 'undefined' && this.elements.card) {
            gsap.killTweensOf(this.elements.card);
            gsap.fromTo(this.elements.card,
                { opacity: 0.8, y: 3 },
                { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' }
            );
        }

        // Update HUD angle display
        if (this.elements.hudAngleVal) {
            this.elements.hudAngleVal.textContent = phase.angleText;
        }

        // Update active state in Left Room Dock
        this.elements.roomButtons.forEach(btn => {
            const btnPhase = parseInt(btn.dataset.phase, 10);
            btn.classList.toggle('active', btnPhase === phaseIndex);
        });
    }

    setCardContent(phase) {
        if (this.elements.cardBadge)    this.elements.cardBadge.textContent   = phase.badge;
        if (this.elements.cardTitle)    this.elements.cardTitle.textContent    = phase.title;
        if (this.elements.cardSubtitle) this.elements.cardSubtitle.textContent = phase.subtitle;
        if (this.elements.cardDesc)     this.elements.cardDesc.textContent     = phase.desc;

        if (this.elements.cardSpecs) {
            this.elements.cardSpecs.innerHTML = phase.specs
                .map(spec => `<span class="spec-tag">${spec}</span>`)
                .join('');
        }

        if (phase.highlights) {
            if (this.elements.hlDimensions) this.elements.hlDimensions.textContent = phase.highlights.dimensions;
            if (this.elements.hlVolume)     this.elements.hlVolume.textContent     = phase.highlights.volume;
            if (this.elements.hlFinishes)   this.elements.hlFinishes.textContent   = phase.highlights.finishes;
            if (this.elements.hlWater)      this.elements.hlWater.textContent      = phase.highlights.water;
        }
    }

    /* ── Wire up room dock buttons & cutaway slider ── */
    initControls() {
        // Villa viewpoint buttons
        this.elements.roomButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const phaseIdx = parseInt(btn.dataset.phase, 10);
                if (!isNaN(phaseIdx)) this.jumpToPhase(phaseIdx);
            });
        });

        // Cutaway Roof Lift Slider
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
}

/* Backward-compatible alias so the test can reference window.scrollController */
window.ScrollAnimationController = VillaViewpointController;
window.VillaViewpointController  = VillaViewpointController;
