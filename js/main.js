/* ═══════════════════════════════════════════════════════════════════════════════
   AER — Main Application Controller
   Handles:
   - 3D Model Initialization & ScrollAnimationController
   - Top HUD Toolbar Actions (Free Orbit, Wireframe, Lighting, Exploded, Export GLB)
   - Telegram References Drawer & High-Res Lightbox Modal
   - Keyboard Shortcuts (Space, O, W, L, E, G, R, Esc)
   - Toast Notifications & Custom Cursor
   ═══════════════════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    /* ── 1. Preloader Dismiss ── */
    const preloader = document.getElementById('preloader');
    const dismissPreloader = () => {
        if (preloader && !preloader.classList.contains('loaded')) {
            preloader.classList.add('loaded');
            showToast('🏡 3D Villa Model Ready — Scroll or drag to explore');
        }
    };
    window.addEventListener('load', () => setTimeout(dismissPreloader, 1500));
    setTimeout(dismissPreloader, 3500); // Safety fallback

    /* ── 2. Initialize 3D Engine & Animation Controller ── */
    const villaModel = new VillaModel();
    const scrollController = new ScrollAnimationController(villaModel);

    /* ── 3. Toast Notifications ── */
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-msg');
    let toastTimeout = null;

    function showToast(message, duration = 3000) {
        if (!toast || !toastMsg) return;
        toastMsg.textContent = message;
        toast.classList.add('visible');
        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('visible');
        }, duration);
    }

    /* ── 4. Viewport Mode Switch (Luxury Villa 3D vs Master Site Plan 3D) ── */
    const btnModeVilla = document.getElementById('btn-mode-villa');
    const btnModeResort = document.getElementById('btn-mode-resort');
    const roomDock = document.getElementById('room-dock');
    const inspectionCard = document.getElementById('inspection-card');

    if (btnModeVilla && btnModeResort) {
        btnModeVilla.addEventListener('click', () => {
            btnModeVilla.classList.add('active');
            btnModeResort.classList.remove('active');
            villaModel.setMode('villa');
            if (roomDock) roomDock.style.display = 'flex';
            if (inspectionCard) inspectionCard.style.display = 'block';
            showToast('🏡 Switched to Luxury Villa 3D Model');
        });

        btnModeResort.addEventListener('click', () => {
            btnModeResort.classList.add('active');
            btnModeVilla.classList.remove('active');
            villaModel.setMode('resort');
            if (roomDock) roomDock.style.display = 'none';
            if (inspectionCard) inspectionCard.style.display = 'none';
            showToast('🗺️ Switched to 2.5 Acre Master Plan (Ashushri Creations)');
        });
    }

    /* ── 5. Navigation Mode Toggle (Free Orbit vs Scroll Tour) ── */
    const btnToggleOrbit = document.getElementById('btn-toggle-orbit');
    const orbitIcon = document.getElementById('orbit-icon');
    const orbitLabel = document.getElementById('orbit-label');
    const hudHint = document.getElementById('hud-hint');

    let freeOrbitActive = false;

    function toggleFreeOrbit(state) {
        freeOrbitActive = (state !== undefined) ? state : !freeOrbitActive;
        villaModel.setFreeOrbit(freeOrbitActive);

        if (btnToggleOrbit) {
            btnToggleOrbit.classList.toggle('active', freeOrbitActive);
        }
        if (orbitIcon && orbitLabel) {
            if (freeOrbitActive) {
                orbitIcon.textContent = '📜';
                orbitLabel.textContent = 'Scroll Tour';
                if (hudHint) hudHint.textContent = '🕹️ Free Orbit: Click & drag to rotate, wheel to zoom, right-click to pan';
                showToast('🕹️ Free 3D Orbit Enabled — Drag mouse to rotate freely');
            } else {
                orbitIcon.textContent = '🕹️';
                orbitLabel.textContent = 'Free Orbit';
                if (hudHint) hudHint.textContent = '🖱️ Scroll mouse wheel or drag scrubber to rotate villa 360°';
                showToast('📜 Scroll Tour Enabled — Scroll to inspect rooms');
            }
        }
    }

    if (btnToggleOrbit) {
        btnToggleOrbit.addEventListener('click', () => toggleFreeOrbit());
    }

    /* ── 6. Exploded Cutaway View Toggle ── */
    const btnToggleExploded = document.getElementById('btn-toggle-exploded');
    let explodedActive = false;

    if (btnToggleExploded) {
        btnToggleExploded.addEventListener('click', () => {
            explodedActive = !explodedActive;
            btnToggleExploded.classList.toggle('active', explodedActive);
            const targetVal = explodedActive ? 1.0 : 0.0;
            villaModel.setExplosionProgress(targetVal);

            const cutawaySlider = document.getElementById('cutaway-slider');
            const cutawayVal = document.getElementById('cutaway-val');
            if (cutawaySlider) cutawaySlider.value = targetVal * 100;
            if (cutawayVal) cutawayVal.textContent = `${Math.round(targetVal * 100)}%`;

            showToast(explodedActive ? '💥 Exploded Cutaway Lifted (Roof +4.2m)' : '🏡 Villa Assembled');
        });
    }

    /* ── 7. Wireframe CAD Mesh Toggle ── */
    const btnToggleWireframe = document.getElementById('btn-toggle-wireframe');
    if (btnToggleWireframe) {
        btnToggleWireframe.addEventListener('click', () => {
            const isWireframe = villaModel.toggleWireframe();
            btnToggleWireframe.classList.toggle('active', isWireframe);
            showToast(isWireframe ? '📐 Wireframe CAD Mesh Enabled' : '🎨 PBR Materials Restored');
        });
    }

    /* ── 8. Lighting Mode Cycle ── */
    const btnCycleLighting = document.getElementById('btn-cycle-lighting');
    const lightingIcon = document.getElementById('lighting-icon');
    const lightingLabel = document.getElementById('lighting-label');
    const lightingModes = ['golden', 'night', 'studio'];
    let currentLightIndex = 0;

    if (btnCycleLighting) {
        btnCycleLighting.addEventListener('click', () => {
            currentLightIndex = (currentLightIndex + 1) % lightingModes.length;
            const newMode = lightingModes[currentLightIndex];
            villaModel.setLightingMode(newMode);

            if (newMode === 'golden') {
                lightingIcon.textContent = '🌅';
                lightingLabel.textContent = 'Golden';
                showToast('🌅 Golden Hour Sunset (Warm 2700K)');
            } else if (newMode === 'night') {
                lightingIcon.textContent = '🌙';
                lightingLabel.textContent = 'Night LEDs';
                showToast('🌙 Luxury Night with Warm Cove LEDs & Cyan Pool');
            } else if (newMode === 'studio') {
                lightingIcon.textContent = '☀️';
                lightingLabel.textContent = 'Studio Day';
                showToast('☀️ Architectural Studio Daylight');
            }
        });
    }

    /* ── 9. Auto-Rotate 360° Toggle ── */
    const btnAutoRotate = document.getElementById('btn-auto-rotate');
    if (btnAutoRotate) {
        btnAutoRotate.addEventListener('click', () => {
            villaModel.autoRotate = !villaModel.autoRotate;
            btnAutoRotate.classList.toggle('active', villaModel.autoRotate);
            showToast(villaModel.autoRotate ? '🔄 Auto-Rotation Started' : '⏸️ Auto-Rotation Paused');
        });
    }

    /* ── 10. Native 3D Model Exporter (.GLB / .GLTF) ── */
    const btnExportGLB = document.getElementById('btn-export-glb');
    if (btnExportGLB) {
        btnExportGLB.addEventListener('click', () => {
            showToast('⏳ Exporting 3D Model (.GLB)... Please wait', 4000);
            btnExportGLB.disabled = true;

            setTimeout(() => {
                villaModel.exportGLTF(true, (fileName, err) => {
                    btnExportGLB.disabled = false;
                    if (err) {
                        showToast(`❌ Export Error: ${err}`, 5000);
                    } else {
                        showToast(`✓ Downloaded ${fileName} — Ready for Blender & CAD!`, 5000);
                    }
                });
            }, 100);
        });
    }

    /* ── 11. Telegram Reference Materials Drawer ── */
    const btnOpenRefs = document.getElementById('btn-open-refs');
    const btnCloseRefs = document.getElementById('btn-close-refs');
    const refDrawer = document.getElementById('reference-drawer');

    if (btnOpenRefs && refDrawer) {
        btnOpenRefs.addEventListener('click', () => {
            refDrawer.classList.add('open');
            btnOpenRefs.classList.add('active');
        });
    }
    if (btnCloseRefs && refDrawer) {
        btnCloseRefs.addEventListener('click', () => {
            refDrawer.classList.remove('open');
            if (btnOpenRefs) btnOpenRefs.classList.remove('active');
            // Pause any playing drawer video
            const v = refDrawer.querySelector('video');
            if (v && !v.paused) v.pause();
        });
    }

    /* ── 12. High-Res Lightbox Modal ── */
    const lightboxModal = document.getElementById('lightbox-modal');
    const modalImg = document.getElementById('modal-img');
    const modalCaption = document.getElementById('modal-caption');
    const btnCloseModal = document.getElementById('btn-close-modal');

    function openLightbox(src, caption) {
        if (!lightboxModal || !modalImg) return;
        modalImg.src = src;
        modalCaption.textContent = caption || '';
        lightboxModal.classList.add('open');
    }

    function closeLightbox() {
        if (lightboxModal) lightboxModal.classList.remove('open');
    }

    if (btnCloseModal) {
        btnCloseModal.addEventListener('click', closeLightbox);
    }
    if (lightboxModal) {
        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal) closeLightbox();
        });
    }

    // Inspection Card Thumbnail Click -> Open Lightbox
    const cardRefBox = document.getElementById('card-ref-box');
    if (cardRefBox) {
        cardRefBox.addEventListener('click', () => {
            const src = cardRefBox.dataset.fullSrc || cardRefBox.querySelector('img')?.src;
            const caption = cardRefBox.dataset.title || 'Telegram Reference Detail';
            if (src) openLightbox(src, caption);
        });
    }

    // Grid items click in Reference Drawer -> Open Lightbox
    const drawerGridItems = document.querySelectorAll('.ref-grid-item');
    drawerGridItems.forEach(item => {
        item.addEventListener('click', () => {
            const src = item.dataset.src || item.querySelector('img')?.src;
            const title = item.dataset.title || item.querySelector('strong')?.textContent;
            if (src) openLightbox(src, title);
        });
    });

    /* ── 13. Minimize / Toggle Inspection Card ── */
    const btnMinimizeCard = document.getElementById('btn-minimize-card');
    if (btnMinimizeCard && inspectionCard) {
        btnMinimizeCard.addEventListener('click', () => {
            inspectionCard.classList.toggle('minimized');
            btnMinimizeCard.querySelector('.minimize-icon').textContent = 
                inspectionCard.classList.contains('minimized') ? '👁️' : '✕';
        });
    }

    /* ── 14. Keyboard Shortcuts ── */
    window.addEventListener('keydown', (e) => {
        // Prevent hotkeys when typing in any input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch (e.code) {
            case 'Space':
            case 'KeyO':
                e.preventDefault();
                toggleFreeOrbit();
                break;
            case 'KeyW':
                e.preventDefault();
                btnToggleWireframe?.click();
                break;
            case 'KeyL':
                e.preventDefault();
                btnCycleLighting?.click();
                break;
            case 'KeyE':
                e.preventDefault();
                btnToggleExploded?.click();
                break;
            case 'KeyG':
                e.preventDefault();
                btnExportGLB?.click();
                break;
            case 'KeyR':
                e.preventDefault();
                scrollController.jumpToPhase(0);
                showToast('🔄 Camera Reset to Front Elevation');
                break;
            case 'Escape':
                closeLightbox();
                if (refDrawer && refDrawer.classList.contains('open')) {
                    btnCloseRefs?.click();
                }
                break;
        }
    });

    /* ── 15. Custom Pearl & Champagne Cursor ── */
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');

    if (cursorDot && cursorRing && window.innerWidth > 768) {
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
            ringX += (mouseX - ringX) * 0.18;
            ringY += (mouseY - ringY) * 0.18;
            cursorRing.style.left = `${ringX}px`;
            cursorRing.style.top = `${ringY}px`;
            requestAnimationFrame(renderCursor);
        }
        renderCursor();

        // Enlarge ring on interactive elements
        const interactiveElements = document.querySelectorAll('button, input, a, .card-reference-thumb, .ref-grid-item');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorRing.style.transform = 'translate(-50%, -50%) scale(1.6)';
                cursorRing.style.borderColor = 'var(--champagne)';
            });
            el.addEventListener('mouseleave', () => {
                cursorRing.style.transform = 'translate(-50%, -50%) scale(1.0)';
                cursorRing.style.borderColor = 'rgba(212, 169, 106, 0.45)';
            });
        });
    }
});
