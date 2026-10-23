/* ═══════════════════════════════════════════════════════════════════════════════
   AER — Anandamayee Eco Resort (Balasore, Odisha)
   Dedicated 3D Architectural Explorer Controller
   Connects Three.js VillaModel, ScrollAnimationController, HUD Tools,
   Reference Drawer, Lightbox Modal, Keyboard Shortcuts, and GLB Exporter
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

    /* ── 2. Initialize 3D Engine & Scroll Controller ── */
    const villaModel = new VillaModel();
    const scrollController = new ScrollAnimationController(villaModel);

    /* ── 3. Preloader Dismissal ── */
    const preloader = document.getElementById('preloader');
    const dismissPreloader = () => {
        if (preloader && !preloader.classList.contains('loaded')) {
            preloader.classList.add('loaded');
            showToast('3D Architectural Model Loaded • Scroll to Explore 360°', 3500);
        }
    };
    window.addEventListener('load', () => setTimeout(dismissPreloader, 1000));
    setTimeout(dismissPreloader, 2500); // Fail-safe timer

    /* ── 4. 3D Model Mode Switch (Villa Cottage vs Master Site Plan) ── */
    const btnModeVilla = document.getElementById('btn-mode-villa');
    const btnModeResort = document.getElementById('btn-mode-resort');
    const roomDock = document.getElementById('room-dock');
    const inspectionCard = document.getElementById('inspection-card');

    function setMode(mode) {
        if (mode === 'villa') {
            btnModeVilla.classList.add('active');
            btnModeResort.classList.remove('active');
            villaModel.setMode('villa');
            if (roomDock) roomDock.style.display = '';
            if (inspectionCard) inspectionCard.style.display = '';
            showToast('Mode: Luxury Villa 3D (225 sqft Cottage)');
        } else {
            btnModeResort.classList.add('active');
            btnModeVilla.classList.remove('active');
            villaModel.setMode('resort');
            showToast('Mode: 2.5 Acre Master Plan (Ashushri Creations)');
        }
    }

    if (btnModeVilla) btnModeVilla.addEventListener('click', () => setMode('villa'));
    if (btnModeResort) btnModeResort.addEventListener('click', () => setMode('resort'));

    /* ── 5. Free 3D OrbitControls vs Scroll Tour Mode Toggle ── */
    const btnToggleOrbit = document.getElementById('btn-toggle-orbit');
    const orbitIcon = document.getElementById('orbit-icon');
    const orbitLabel = document.getElementById('orbit-label');

    function toggleOrbitMode() {
        const nextState = !villaModel.isFreeOrbit;
        villaModel.setFreeOrbit(nextState);

        if (nextState) {
            btnToggleOrbit.classList.add('active');
            orbitIcon.textContent = '📜';
            orbitLabel.textContent = 'Scroll Tour';
            showToast('Free 3D Orbit: Drag to Rotate • Right-click to Pan • Wheel to Zoom', 3500);
        } else {
            btnToggleOrbit.classList.remove('active');
            orbitIcon.textContent = '🕹️';
            orbitLabel.textContent = 'Free Orbit';
            showToast('Scroll Tour Active: Mouse wheel controls 360° Villa Inspection', 2800);
        }
    }

    if (btnToggleOrbit) btnToggleOrbit.addEventListener('click', toggleOrbitMode);

    /* ── 6. Exploded Cutaway Toggle ── */
    const btnToggleExploded = document.getElementById('btn-toggle-exploded');
    const cutawaySlider = document.getElementById('cutaway-slider');
    const cutawayVal = document.getElementById('cutaway-val');

    function toggleExploded() {
        const isExploded = villaModel.targetExplosion > 0.4;
        const targetVal = isExploded ? 0.0 : 1.0;

        villaModel.setExplosionProgress(targetVal);
        btnToggleExploded.classList.toggle('active', !isExploded);

        if (cutawaySlider) cutawaySlider.value = Math.round(targetVal * 100);
        if (cutawayVal) cutawayVal.textContent = `${Math.round(targetVal * 100)}%`;

        showToast(isExploded ? 'Villa Re-assembled' : 'Exploded Cutaway: Roof & Mezzanine Lifted');
    }

    if (btnToggleExploded) btnToggleExploded.addEventListener('click', toggleExploded);

    /* ── 7. Wireframe CAD Mesh Toggle ── */
    const btnToggleWireframe = document.getElementById('btn-toggle-wireframe');

    function toggleWireframe() {
        const active = villaModel.toggleWireframe();
        btnToggleWireframe.classList.toggle('active', active);
        showToast(active ? 'CAD Wireframe Mode Enabled' : 'PBR Realistic Shading Mode');
    }

    if (btnToggleWireframe) btnToggleWireframe.addEventListener('click', toggleWireframe);

    /* ── 8. Cycle Lighting Modes (Golden Sunset / Luxury Night / Studio Day) ── */
    const btnCycleLighting = document.getElementById('btn-cycle-lighting');
    const lightingIcon = document.getElementById('lighting-icon');
    const lightingLabel = document.getElementById('lighting-label');

    const lightingModes = [
        { id: 'golden', label: 'Golden', icon: '🌅', name: 'Golden Hour Sunset' },
        { id: 'night',  label: 'Night',  icon: '🌙', name: 'Luxury Night & Warm LED Cove' },
        { id: 'studio', label: 'Studio', icon: '💡', name: 'Architectural Daylight' }
    ];
    let currentLightingIdx = 0;

    function cycleLighting() {
        currentLightingIdx = (currentLightingIdx + 1) % lightingModes.length;
        const mode = lightingModes[currentLightingIdx];

        villaModel.setLightingMode(mode.id);
        if (lightingIcon) lightingIcon.textContent = mode.icon;
        if (lightingLabel) lightingLabel.textContent = mode.label;

        showToast(`Lighting: ${mode.name}`);
    }

    if (btnCycleLighting) btnCycleLighting.addEventListener('click', cycleLighting);

    /* ── 9. Auto-Rotate 360° Toggle ── */
    const btnAutoRotate = document.getElementById('btn-auto-rotate');

    function toggleAutoRotate() {
        villaModel.autoRotate = !villaModel.autoRotate;
        btnAutoRotate.classList.toggle('active', villaModel.autoRotate);
        showToast(`Auto 360° Rotation: ${villaModel.autoRotate ? 'ON' : 'OFF'}`);
    }

    if (btnAutoRotate) btnAutoRotate.addEventListener('click', toggleAutoRotate);

    /* ── 10. Native GLB 3D Model Export for Blender / 3ds Max ── */
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

    /* ── 11. Telegram Reference Materials Drawer ── */
    const btnOpenRefs = document.getElementById('btn-open-refs');
    const btnCloseRefs = document.getElementById('btn-close-refs');
    const referenceDrawer = document.getElementById('reference-drawer');

    if (btnOpenRefs && referenceDrawer) {
        btnOpenRefs.addEventListener('click', () => {
            referenceDrawer.classList.add('open');
        });
    }

    if (btnCloseRefs && referenceDrawer) {
        btnCloseRefs.addEventListener('click', () => {
            referenceDrawer.classList.remove('open');
        });
    }

    /* ── 12. Minimize Inspection Card Toggle ── */
    const btnMinimizeCard = document.getElementById('btn-minimize-card');
    if (btnMinimizeCard && inspectionCard) {
        btnMinimizeCard.addEventListener('click', () => {
            inspectionCard.classList.toggle('minimized');
            const isMin = inspectionCard.classList.contains('minimized');
            btnMinimizeCard.innerHTML = isMin ? '<span class="minimize-icon">◀</span>' : '<span class="minimize-icon">✕</span>';
        });
    }

    /* ── 13. Lightbox Modal for Reference Inspection ── */
    const lightboxModal = document.getElementById('lightbox-modal');
    const modalImg = document.getElementById('modal-img');
    const modalCaption = document.getElementById('modal-caption');
    const btnCloseModal = document.getElementById('btn-close-modal');

    function openLightbox(src, caption) {
        if (!lightboxModal || !modalImg) return;
        modalImg.src = src;
        if (modalCaption) modalCaption.textContent = caption || 'Reference Photo';
        lightboxModal.classList.add('open');
    }

    function closeLightbox() {
        if (lightboxModal) lightboxModal.classList.remove('open');
    }

    if (btnCloseModal) btnCloseModal.addEventListener('click', closeLightbox);
    if (lightboxModal) {
        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal) closeLightbox();
        });
    }

    // Connect Inspection Card Thumbnail to Lightbox
    const cardRefBox = document.getElementById('card-ref-box');
    if (cardRefBox) {
        cardRefBox.addEventListener('click', () => {
            const img = document.getElementById('card-ref-img');
            const title = document.getElementById('card-title')?.textContent || 'Reference Photo';
            if (img) openLightbox(img.src, title);
        });
    }

    // Connect Drawer Gallery Items to Lightbox
    document.querySelectorAll('.ref-grid-item').forEach(item => {
        item.addEventListener('click', () => {
            const src = item.dataset.src || item.querySelector('img')?.src;
            const title = item.dataset.title || item.querySelector('strong')?.textContent;
            if (src) openLightbox(src, title);
        });
    });

    /* ── 14. Custom Cursor ── */
    const cursorDot = document.querySelector('.cursor-dot');
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
            cursorDot.style.top = `${mouseY}px`;
        });

        function renderCursor() {
            ringX += (mouseX - ringX) * 0.15;
            ringY += (mouseY - ringY) * 0.15;
            cursorRing.style.left = `${ringX}px`;
            cursorRing.style.top = `${ringY}px`;
            requestAnimationFrame(renderCursor);
        }
        renderCursor();

        // Enlarge on hoverable elements
        const hoverables = 'button, input, a, .card-reference-thumb, .ref-grid-item';
        document.querySelectorAll(hoverables).forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorRing.style.width = '48px';
                cursorRing.style.height = '48px';
                cursorRing.style.borderColor = 'rgba(212, 169, 106, 0.85)';
            });
            el.addEventListener('mouseleave', () => {
                cursorRing.style.width = '32px';
                cursorRing.style.height = '32px';
                cursorRing.style.borderColor = 'rgba(212, 169, 106, 0.45)';
            });
        });
    }

    /* ── 15. Keyboard Shortcuts for Power Users ── */
    window.addEventListener('keydown', (e) => {
        // Ignore if user is typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch (e.key.toLowerCase()) {
            case ' ':
            case 'o':
                e.preventDefault();
                toggleOrbitMode();
                break;
            case 'e':
                toggleExploded();
                break;
            case 'w':
                toggleWireframe();
                break;
            case 'l':
                cycleLighting();
                break;
            case 'r':
                toggleAutoRotate();
                break;
            case 'm':
                setMode(villaModel.activeMode === 'villa' ? 'resort' : 'villa');
                break;
            case 'escape':
                closeLightbox();
                if (referenceDrawer) referenceDrawer.classList.remove('open');
                break;
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
                const phaseNum = parseInt(e.key, 10) - 1;
                scrollController.jumpToPhase(phaseNum);
                break;
        }
    });

    console.log('%c AER — Dedicated 3D Model Explorer Loaded ', 'background: #182822; color: #D4A96A; font-weight: bold; padding: 6px 12px; border-radius: 4px;');
});
