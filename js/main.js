/* ═══════════════════════════════════════════════════════════════════════════════
   AER — Anandamayee Eco Resort (Balasore, Odisha)
   Dedicated 3D Architectural Explorer Controller
   Connects VillaModel, VillaViewpointController, HUD tools, and GLB Exporter.
   ═══════════════════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    /* ── 1. Toast Notification System ── */
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-msg');
    let toastTimeout = null;

    function showToast(message, duration = 2800) {
        if (!toast || !toastMsg) return;
        toastMsg.textContent = message;
        toast.classList.add('show');
        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }

    /* ── 2. Initialize 3D Engine & Viewpoint Controller ── */
    const villaModel = new VillaModel();
    const scrollController = new VillaViewpointController(villaModel);
    window.villaModel = villaModel;
    window.scrollController = scrollController;  // test expects this reference

    /* ── 3. Preloader Dismissal ── */
    const preloader = document.getElementById('preloader');
    const dismissPreloader = () => {
        if (preloader && !preloader.classList.contains('loaded')) {
            preloader.classList.add('loaded');
            showToast('3D Architectural Model Loaded • Use left panel to explore', 3500);
        }
    };
    window.addEventListener('load', () => setTimeout(dismissPreloader, 1000));
    setTimeout(dismissPreloader, 2500);

    /* ── 4. Mode Switch (Villa Cottage vs Master Site Plan) ── */
    const btnModeVilla  = document.getElementById('btn-mode-villa');
    const btnModeResort = document.getElementById('btn-mode-resort');
    const villaPanel    = document.getElementById('villa-dock-panel');
    const resortPanel   = document.getElementById('resort-dock-panel');
    const inspectionCard = document.getElementById('inspection-card');
    const statusMode     = document.getElementById('status-mode');

    function setMode(mode) {
        if (mode === 'villa') {
            btnModeVilla.classList.add('active');
            btnModeResort.classList.remove('active');
            villaModel.setMode('villa');
            if (villaPanel)  villaPanel.style.display  = '';
            if (resortPanel) resortPanel.style.display = 'none';
            if (inspectionCard) inspectionCard.style.display = '';
            if (statusMode) statusMode.textContent = '🏡 LUXURY VILLA 3D';

            // Restore villa card content
            const idx = scrollController.currentPhaseIndex >= 0
                ? scrollController.currentPhaseIndex : 0;
            scrollController.updatePhaseUI(idx);
            showToast('Mode: Luxury Villa 3D (225 sqft Cottage)');

        } else {
            btnModeResort.classList.add('active');
            btnModeVilla.classList.remove('active');
            villaModel.setMode('resort');
            if (villaPanel)  villaPanel.style.display  = 'none';
            if (resortPanel) resortPanel.style.display = '';
            if (statusMode) statusMode.textContent = '🗺️ MASTER SITE PLAN 3D';

            // Update inspection card for resort overview
            if (inspectionCard) {
                inspectionCard.style.display = '';
                const fields = {
                    'card-badge':    'MASTER SITE PLAN',
                    'card-title':    '2.5 Acre Eco Resort Layout',
                    'card-subtitle': 'Ashushri Creations • Balasore, Odisha',
                    'card-desc':     'Master architectural layout designed for Promoter Biswajeet Ghosh. Features 10 luxury private cottages (225 sqft each) along the central garden promenade, an 1,800 sqft resort pool with sunken lounge, 2,000 sqft grand banquet hall, eco treehouse, authentic mud huts, bonfire pit, and landscaped water fountain.',
                    'hl-dimensions': '2.5 Acres Site • 10 Luxury Cottages (225 sqft each)',
                    'hl-volume':     '2,000 sqft Banquet Hall • 525 sqft Commercial Kitchen',
                    'hl-finishes':   'Paved Stone Promenade • Native Teak & Terracotta',
                    'hl-water':      '1,800 sqft Resort Lagoon Pool & Central Water Fountain'
                };
                Object.entries(fields).forEach(([id, text]) => {
                    const el = document.getElementById(id);
                    if (el) el.textContent = text;
                });
                const cardSpecs = document.getElementById('card-specs');
                if (cardSpecs) {
                    cardSpecs.innerHTML = [
                        '<span class="spec-tag">🏡 10 Luxury Cottages</span>',
                        '<span class="spec-tag">🏊 1,800 sqft Main Pool</span>',
                        '<span class="spec-tag">🏛️ 2,000 sqft Banquet Hall</span>',
                        '<span class="spec-tag">🌲 Eco Treehouse & Mud Huts</span>',
                        '<span class="spec-tag">🔥 Bonfire Gathering Pit</span>',
                        '<span class="spec-tag">⛲ Central Water Fountain</span>'
                    ].join('');
                }
            }

            // Update status strip
            const hudAngle = document.getElementById('hud-angle-val');
            if (hudAngle) hudAngle.textContent = 'Aerial Oblique View';

            showToast('Mode: 2.5 Acre Master Plan (Ashushri Creations)');
        }
    }

    if (btnModeVilla)  btnModeVilla.addEventListener('click',  () => setMode('villa'));
    if (btnModeResort) btnModeResort.addEventListener('click', () => setMode('resort'));

    /* ── 4b. Resort Facilities Navigation & Card Sync ── */
    const resortFacilities = {
        cottages: {
            title: "10 Luxury Private Cottages",
            subtitle: "Legend 1 • 225 sqft Individual Pavilions",
            desc: "Ten luxury eco-cottages arranged in an organic L-shaped configuration along the landscaped garden promenade. Each cottage features an elevated timber deck, private plunge pool with underwater illumination, floor-to-ceiling glass frontage, and standing-seam zinc roof.",
            specs: ["🏡 10 Private Cottages", "🏊 Private Plunge Pools", "🪵 Weathered Teak Decks", "✨ Warm LED Glow"],
            highlights: {
                dimensions: "10 Cottages • 225 sqft Each",
                volume: "Private 1.4m Depth Plunge Pools",
                finishes: "Natural Timber Siding & Standing Seam Zinc",
                water: "Submerged Ceramic Mosaic & Cyan Lighting"
            },
            camera: new THREE.Vector3(-10, 22, 16),
            target: new THREE.Vector3(-10, 1.5, -3)
        },
        pool: {
            title: "Main Resort Swimming Pool",
            subtitle: "Legend 8 • 1,800 sqft Aquatic Centerpiece",
            desc: "Expansive 1,800 sqft organic lagoon swimming pool with multi-tiered teak sun deck, dark honed basalt wet-edge coping, submerged relaxation benches, twin poolside cabana loungers with umbrellas, and a thatched poolside bar gazebo.",
            specs: ["🏊 1,800 sqft Lagoon", "🪵 Multi-Tier Sun Deck", "🏖️ Cabana Loungers", "🍹 Poolside Gazebo"],
            highlights: {
                dimensions: "1,800 sqft Organic Curvilinear Basin",
                volume: "Multi-Tiered Sun Deck with Cabanas",
                finishes: "Honed Dark Basalt Coping & Ceramic Mosaic",
                water: "Dynamic Harmonic Ripples & Cyan LED Glow"
            },
            camera: new THREE.Vector3(-11, 16, 12),
            target: new THREE.Vector3(-11, 1, -2.5)
        },
        banquet: {
            title: "Grand Banquet Hall",
            subtitle: "Legend 3 • 2,000 sqft Architectural Pavilion",
            desc: "Double-height grand banquet hall engineered for weddings, conferences, and cultural events. Features monumental split-face basalt columns, full curtain-wall glazing, exposed structural timber roof trusses, and a generous outdoor event terrace.",
            specs: ["🏛️ 2,000 sqft Grand Hall", "🌿 Outdoor Event Lawn", "🪟 Double-Height Glazing", "🏗️ Exposed Timber Trusses"],
            highlights: {
                dimensions: "2,000 sqft Double-Height Pavilion",
                volume: "4.3m Roof Pitch with Exposed Trusses",
                finishes: "Stacked Basalt Columns & Anthracite Zinc",
                water: "Terrace Drainage & Perimeter Uplighting"
            },
            camera: new THREE.Vector3(6, 18, 8),
            target: new THREE.Vector3(5.5, 2, -8.0)
        },
        landscape: {
            title: "Lush Tropical Parkland & Eco-Zones",
            subtitle: "Legends 7, 12, 14 • Biodiversity & Recreation",
            desc: "A rich tapestry of indigenous landscaping: multi-tiered coconut palm groves, manicured Bermuda grass lawns, contoured privacy berms, an elevated eco treehouse on timber stilts, four authentic thatched mud huts, and a sunken radial campfire lounge.",
            specs: ["🌴 Multi-Tiered Coconut Palms", "🌲 Elevated Eco Treehouse", "🛖 4 Authentic Mud Huts", "🔥 Sunken Campfire Lounge"],
            highlights: {
                dimensions: "2.5 Acres Landscaped Grounds",
                volume: "Elevated 4.5m Treehouse & Mud Huts",
                finishes: "Authentic Thatched Roofs & Teak Stilts",
                water: "Campfire Embers & Natural Swale Drainage"
            },
            camera: new THREE.Vector3(0, 24, 22),
            target: new THREE.Vector3(0, 1.5, 2.0)
        },
        paths: {
            title: "Grand Entrance, Roads & Parking",
            subtitle: "Legends 10, 15 • Vehicular & Pedestrian Circulation",
            desc: "Imposing grand entrance gate framed by split-face stone pylons and timber trellis, leading via an asphalt boulevard to guest parking bays and a central vehicular turning plaza centered on a 3-tiered illuminated water fountain.",
            specs: ["⛩️ Grand Entrance Gate", "🚗 Guest Parking Bays", "⛲ 3-Tiered Water Fountain", "🛤️ Paved Promenade Loop"],
            highlights: {
                dimensions: "Entry Boulevard & 6 Parking Stalls",
                volume: "Circular Vehicular Plaza & Gate",
                finishes: "Asphalt Roadway, Stone Curbs & Pavers",
                water: "3-Tiered Central Fountain Water Jet"
            },
            camera: new THREE.Vector3(20, 18, 16),
            target: new THREE.Vector3(18, 1, 2)
        }
    };

    const resortFacilityButtons = document.querySelectorAll('#resort-dock-panel .room-btn');
    resortFacilityButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const facKey = btn.dataset.facility;
            const fac = resortFacilities[facKey];
            if (!fac) return;

            resortFacilityButtons.forEach(b => b.classList.toggle('active', b === btn));

            if (villaModel.camera && villaModel.controls) {
                villaModel.camera.position.copy(fac.camera);
                villaModel.controls.target.copy(fac.target);
                villaModel.controls.update();
            }

            if (inspectionCard) {
                const elTitle = document.getElementById('card-title');
                const elSub   = document.getElementById('card-subtitle');
                const elDesc  = document.getElementById('card-desc');
                const elBadge = document.getElementById('card-badge');
                const elSpecs = document.getElementById('card-specs');
                const elDim   = document.getElementById('hl-dimensions');
                const elVol   = document.getElementById('hl-volume');
                const elFin   = document.getElementById('hl-finishes');
                const elWat   = document.getElementById('hl-water');

                if (elBadge) elBadge.textContent = 'RESORT FACILITY';
                if (elTitle) elTitle.textContent = fac.title;
                if (elSub)   elSub.textContent   = fac.subtitle;
                if (elDesc)  elDesc.textContent  = fac.desc;
                if (elSpecs) {
                    elSpecs.innerHTML = fac.specs
                        .map(s => `<span class="spec-tag">${s}</span>`)
                        .join('');
                }
                if (elDim) elDim.textContent = fac.highlights.dimensions;
                if (elVol) elVol.textContent = fac.highlights.volume;
                if (elFin) elFin.textContent = fac.highlights.finishes;
                if (elWat) elWat.textContent = fac.highlights.water;
            }

            const hudAngle = document.getElementById('hud-angle-val');
            if (hudAngle) hudAngle.textContent = fac.title;

            showToast(`Inspecting: ${fac.title}`);
        });
    });

    /* ── 5. Exploded Cutaway Toggle ── */
    const btnToggleExploded = document.getElementById('btn-toggle-exploded');
    const cutawaySlider     = document.getElementById('cutaway-slider');
    const cutawayVal        = document.getElementById('cutaway-val');

    function toggleExploded() {
        const isExploded = villaModel.targetExplosion > 0.4;
        const targetVal  = isExploded ? 0.0 : 1.0;

        villaModel.setExplosionProgress(targetVal);
        btnToggleExploded.classList.toggle('active', !isExploded);

        if (cutawaySlider) cutawaySlider.value = Math.round(targetVal * 100);
        if (cutawayVal)    cutawayVal.textContent = `${Math.round(targetVal * 100)}%`;

        showToast(isExploded ? 'Villa Re-assembled' : 'Exploded Cutaway: Roof & Mezzanine Lifted');
    }

    if (btnToggleExploded) btnToggleExploded.addEventListener('click', toggleExploded);

    /* ── 6. Wireframe CAD Mesh Toggle ── */
    const btnToggleWireframe = document.getElementById('btn-toggle-wireframe');

    function toggleWireframe() {
        const active = villaModel.toggleWireframe();
        btnToggleWireframe.classList.toggle('active', active);
        showToast(active ? 'CAD Wireframe Mode Enabled' : 'PBR Realistic Shading Mode');
    }

    if (btnToggleWireframe) btnToggleWireframe.addEventListener('click', toggleWireframe);

    /* ── 7. Cycle Lighting Modes ── */
    const btnCycleLighting = document.getElementById('btn-cycle-lighting');
    const lightingIcon     = document.getElementById('lighting-icon');
    const lightingLabel    = document.getElementById('lighting-label');

    const lightingModes = [
        { id: 'golden',   label: 'Golden',  icon: '🌅', name: 'Golden Hour Sunset' },
        { id: 'night',    label: 'Night',   icon: '🌙', name: 'Luxury Night & Warm LED Cove' },
        { id: 'studio',   label: 'Studio',  icon: '💡', name: 'Architectural Daylight' }
    ];
    let currentLightingIdx = 0;

    function cycleLighting() {
        currentLightingIdx = (currentLightingIdx + 1) % lightingModes.length;
        const mode = lightingModes[currentLightingIdx];
        villaModel.setLightingMode(mode.id);
        if (lightingIcon)  lightingIcon.textContent  = mode.icon;
        if (lightingLabel) lightingLabel.textContent = mode.label;
        showToast(`Lighting: ${mode.name}`);
    }

    if (btnCycleLighting) btnCycleLighting.addEventListener('click', cycleLighting);

    /* ── 8. Auto-Rotate Toggle ── */
    const btnAutoRotate = document.getElementById('btn-auto-rotate');

    function toggleAutoRotate() {
        villaModel.autoRotate = !villaModel.autoRotate;
        btnAutoRotate.classList.toggle('active', villaModel.autoRotate);
        showToast(`Auto Rotation: ${villaModel.autoRotate ? 'ON' : 'OFF'}`);
    }

    if (btnAutoRotate) btnAutoRotate.addEventListener('click', toggleAutoRotate);

    /* ── 9. Camera Reset ── */
    const btnResetCamera = document.getElementById('btn-reset-camera');

    function resetCamera() {
        if (villaModel.activeMode === 'villa') {
            scrollController.jumpToPhase(0);
            showToast('Camera Reset to Front Exterior');
        } else {
            villaModel.setMode('resort');
            showToast('Camera Reset to Aerial Oblique');
        }
    }

    if (btnResetCamera) btnResetCamera.addEventListener('click', resetCamera);

    /* ── 10. GLB Export ── */
    const btnExportGlb = document.getElementById('btn-export-glb');

    if (btnExportGlb) {
        btnExportGlb.addEventListener('click', () => {
            showToast('Generating binary .GLB 3D model with embedded PBR materials...', 3500);
            btnExportGlb.style.pointerEvents = 'none';
            btnExportGlb.style.opacity = '0.6';

            setTimeout(() => {
                villaModel.exportGLTF(true, (filename, err) => {
                    btnExportGlb.style.pointerEvents = '';
                    btnExportGlb.style.opacity = '';
                    if (err) {
                        showToast(`Export Error: ${err}`, 4000);
                    } else {
                        showToast(`✓ Downloaded 3D Model: ${filename}`, 4500);
                    }
                });
            }, 100);
        });
    }

    /* ── 11. Minimize Inspection Card ── */
    const btnMinimizeCard = document.getElementById('btn-minimize-card');
    if (btnMinimizeCard && inspectionCard) {
        btnMinimizeCard.addEventListener('click', () => {
            inspectionCard.classList.toggle('minimized');
            const isMin = inspectionCard.classList.contains('minimized');
            btnMinimizeCard.innerHTML = isMin
                ? '<span class="minimize-icon">◀</span>'
                : '<span class="minimize-icon">✕</span>';
        });
    }

    /* ── 12. Custom Cursor ── */
    const cursorDot  = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');

    if (cursorDot && cursorRing && window.innerWidth > 860) {
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let ringX = mouseX;
        let ringY = mouseY;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top  = `${mouseY}px`;
        });

        function renderCursor() {
            ringX += (mouseX - ringX) * 0.15;
            ringY += (mouseY - ringY) * 0.15;
            cursorRing.style.left = `${ringX}px`;
            cursorRing.style.top  = `${ringY}px`;
            requestAnimationFrame(renderCursor);
        }
        renderCursor();

        const hoverables = 'button, input, a, .mode-btn, .hud-tool-btn, .room-btn';
        document.querySelectorAll(hoverables).forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorRing.style.width       = '48px';
                cursorRing.style.height      = '48px';
                cursorRing.style.borderColor = 'rgba(212, 169, 106, 0.85)';
            });
            el.addEventListener('mouseleave', () => {
                cursorRing.style.width       = '32px';
                cursorRing.style.height      = '32px';
                cursorRing.style.borderColor = 'rgba(212, 169, 106, 0.45)';
            });
        });
    }

    /* ── 13. Keyboard Shortcuts ── */
    window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch (e.key.toLowerCase()) {
            case 'e':
                toggleExploded();
                break;
            case 'w':
                toggleWireframe();
                break;
            case 'l':
                cycleLighting();
                break;
            case 'a':
                toggleAutoRotate();
                break;
            case 'r':
                resetCamera();
                break;
            case 'g':
                if (btnExportGlb) btnExportGlb.click();
                break;
            case 'm':
                setMode(villaModel.activeMode === 'villa' ? 'resort' : 'villa');
                break;
            case '1': case '2': case '3': case '4':
            case '5': case '6': case '7': case '8': {
                const phaseNum = parseInt(e.key, 10) - 1;
                if (villaModel.activeMode === 'villa') {
                    scrollController.jumpToPhase(phaseNum);
                }
                break;
            }
        }
    });

    console.log('%c AER — 3D Architectural Explorer Loaded ', 'background: #182822; color: #D4A96A; font-weight: bold; padding: 6px 12px; border-radius: 4px;');
});
