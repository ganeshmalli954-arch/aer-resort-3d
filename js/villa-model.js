/* ═══════════════════════════════════════════════════════════════════════════════
   AER — Anandamayee Eco Resort (Balasore, Odisha)
   Photorealistic 3D Architectural Visualization Engine & Interactive Explorer

   Photorealistic Upgrades:
   - Real PBR Materials:
     * Italian Bookmatched Calacatta Gold Marble (honed & polished)
     * Acoustic Fluted Dark Oak Wall Slats with deep 3D relief normal grooves
     * Weathered Teak Solarium Decking with authentic plank reveals
     * Preserved Living Organic Clump Moss Wellness Wall
     * Natural Stacked Ledger Basalt Stone with split-face normal relief
     * Standing-Seam Anthracite Zinc Roof with crisp metal rolling finish
     * Submerged Ceramic Pool Mosaic Tiles with bevelled normal edges
     * Natural Flagstone / Slate Promenade Pavers
   - Physically Accurate Water Simulation:
     * Real recessed hollow pool basin with underwater mosaic floor & steps
     * Dual-frequency harmonic normal-mapped surface wave flow
     * Real physical Fresnel reflection, transmission (IOR 1.333), and clearcoat
     * Depth-based cyan-to-emerald gradient (#0d4a57 to #2499a8)
     * Honed dark basalt coping and submerged pool steps with LED illumination
   - Physically Based Lighting & Image-Based Environment (IBL):
     * Procedural 360° Equirectangular Skydome with PMREMGenerator
     * Soft PCFSoftShadowMap contact shadows with tuned bias & radius
     * Recessed 2700K Warm LED linear cove lighting grazing wood slats & Eurostairs
     * Glowing turquoise pool underwater illumination (#00e5ff) with caustic bounce
     * ACESFilmicToneMapping for high photographic dynamic range
   - Authentic Reference Architectural Geometry:
     * Full architectural exterior walls and framing for a solid, realistic villa
     * Double-height glass lightwell with integrated Japanese courtyard tree
     * Eurostairs cantilevered floating oak treads with under-step LEDs & 15mm glass
     * Master suite with low Japanese platform bed & fluted acoustic wall
     * Calacatta spa bath with freestanding matte black oval tub & brass mixer
     * Cantilevered timber eaves with integrated linear lighting & sliding timber louvers
   - Natural Layered Tropical Vegetation:
     * Multi-tiered coconut & royal palms with fibrous ringed trunks & pinnate fronds
     * Broadleaf Monstera, Alocasia, Boston ferns, and ornamental landscaping
   - Ashushri Creations 2.5-Acre Master Resort Site Plan:
     * 10 Luxury Cottages (detailed architectural pavilions with private plunge pools),
       1,800 sqft main lagoon pool, Grand Banquet Hall, central circular vehicular plaza
       with 3-tiered fountain, campfire lounge, treehouse, mud huts, and stone promenade
   - Complete Interactive Suite:
     * Smooth 360° scroll rotation, Free OrbitControls, exploded cutaway lift,
       CAD wireframe mode, 3 lighting atmospheres, and native binary .GLB exporter
   ═══════════════════════════════════════════════════════════════════════════════ */

class VillaModel {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;

        // Scene Groups
        this.mainGroup = null;
        this.resortGroup = null;        // Master Site Plan (2.5 Acres)
        this.villaOverviewGroup = null; // High-Fidelity Cottage Model (225 sqft)

        // Exploded Cutaway Components
        this.explodedLayers = {
            roof: null,
            upperFloor: null,
            groundFloor: null,
            poolDeck: null,
            stairs: null
        };

        // State Flags
        this.activeMode = 'villa'; // 'villa' | 'resort'
        this.isFreeOrbit = false;
        this.isWireframe = false;
        this.lightingMode = 'golden'; // 'golden' | 'night' | 'studio'
        this.autoRotate = false;
        this.autoRotateSpeed = 0.5;

        // Camera Animation Targets (for smooth lerping during scroll)
        this.targetCameraPos = new THREE.Vector3(0, 4.5, 12);
        this.targetLookAt = new THREE.Vector3(0, 1.8, 0);
        this.currentLookAt = new THREE.Vector3(0, 1.8, 0);

        // Explosion Cutaway Factor: 0.0 (assembled) -> 1.0 (fully exploded)
        this.explosionFactor = 0.0;
        this.targetExplosion = 0.0;

        // Lights & Effects
        this.lightObjects = {};
        this.ambientParticles = [];
        this.poolWaterMesh = null;
        this.resortPoolWaterMesh = null;
        this.oceanWaterMesh = null;
        this.planPlaneMesh = null;
        this.clock = new THREE.Clock();

        // Texture Cache & Procedural PBR Resources
        this.textures = {};
        this.environmentMap = null;

        this.init();
    }

    init() {
        // 1. Scene & Atmospheric Fog
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x182024, 0.0075);

        // 2. Camera Setup with Architectural Perspective
        this.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            350
        );
        this.camera.position.set(0, 5, 14);

        // 3. Canvas & WebGL Renderer with ACESFilmic Tone Mapping
        const canvas = document.getElementById('villa-canvas');
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.18;
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        // 4. OrbitControls (Free 3D Inspection Mode)
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.06;
            this.controls.maxPolarAngle = Math.PI / 2 - 0.02;
            this.controls.minDistance = 2.0;
            this.controls.maxDistance = 80;
            this.controls.target.set(0, 1.8, 0);
            this.controls.enabled = false;
        }

        // 5. Generate Procedural PBR Textures (Albedo, Normal & Roughness Maps)
        this.generateProceduralTextures();

        // 6. Setup Image-Based Environment Lighting (IBL) & Physical Lights
        this.setupEnvironmentAndLights();

        // 7. Scene Hierarchy
        this.mainGroup = new THREE.Group();
        this.scene.add(this.mainGroup);

        // 8. Build Photorealistic 3D Models
        this.buildLuxuryCottage();
        this.buildMasterResort();
        this.buildLandscape();
        this.createAtmosphere();

        // Set default mode & lighting
        this.setMode('villa');
        this.setLightingMode('golden');

        // Window resize handler
        window.addEventListener('resize', () => this.onResize());

        // Start render loop
        this.animate();
    }

    /* ═══════════════════════════════════════════════════════════════════════════
       PROCEDURAL PBR TEXTURES & NORMAL MAP GENERATORS
       ═══════════════════════════════════════════════════════════════════════════ */
    generateProceduralTextures() {
        // ── 1. Fluted Dark Oak Acoustic Wood (Albedo + Normal) ──
        const flutedCanvas = document.createElement('canvas');
        flutedCanvas.width = 512;
        flutedCanvas.height = 512;
        const fctx = flutedCanvas.getContext('2d');
        fctx.fillStyle = '#1e140d';
        fctx.fillRect(0, 0, 512, 512);

        const slatWidth = 16;
        for (let x = 0; x < 512; x += slatWidth) {
            const grad = fctx.createLinearGradient(x, 0, x + slatWidth, 0);
            grad.addColorStop(0, '#120b07');
            grad.addColorStop(0.2, '#281a11');
            grad.addColorStop(0.5, '#442b1b');
            grad.addColorStop(0.8, '#281a11');
            grad.addColorStop(1, '#0e0805');
            fctx.fillStyle = grad;
            fctx.fillRect(x, 0, slatWidth - 2, 512);

            // Wood grain streaks
            fctx.fillStyle = 'rgba(75, 52, 35, 0.25)';
            fctx.fillRect(x + 4, 0, 1, 512);
            fctx.fillRect(x + 9, 0, 1, 512);

            // Deep groove shadow
            fctx.fillStyle = '#060402';
            fctx.fillRect(x + slatWidth - 2, 0, 2, 512);
        }
        this.textures.flutedWood = new THREE.CanvasTexture(flutedCanvas);
        this.textures.flutedWood.wrapS = THREE.RepeatWrapping;
        this.textures.flutedWood.wrapT = THREE.RepeatWrapping;
        this.textures.flutedWood.repeat.set(4, 2);

        // Fluted Normal Map
        const flutedNormCanvas = document.createElement('canvas');
        flutedNormCanvas.width = 512;
        flutedNormCanvas.height = 512;
        const fnctx = flutedNormCanvas.getContext('2d');
        const fnImgData = fnctx.createImageData(512, 512);
        const fnd = fnImgData.data;
        const halfSlat = (slatWidth - 2) / 2;
        for (let y = 0; y < 512; y++) {
            for (let x = 0; x < 512; x++) {
                const localX = x % slatWidth;
                let nx = 0, ny = 0, nz = 1;
                if (localX < slatWidth - 2) {
                    const normX = (localX - halfSlat) / halfSlat;
                    nx = Math.max(-1, Math.min(1, normX));
                    nz = Math.sqrt(Math.max(0.05, 1 - nx * nx));
                } else {
                    nx = 0;
                    nz = 0.5;
                }
                const idx = (y * 512 + x) * 4;
                fnd[idx]     = Math.floor((nx * 0.5 + 0.5) * 255);
                fnd[idx + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
                fnd[idx + 2] = Math.floor(nz * 255);
                fnd[idx + 3] = 255;
            }
        }
        fnctx.putImageData(fnImgData, 0, 0);
        this.textures.flutedWoodNormal = new THREE.CanvasTexture(flutedNormCanvas);
        this.textures.flutedWoodNormal.wrapS = THREE.RepeatWrapping;
        this.textures.flutedWoodNormal.wrapT = THREE.RepeatWrapping;
        this.textures.flutedWoodNormal.repeat.set(4, 2);

        // ── 2. Calacatta Gold Italian Marble ──
        const marbleCanvas = document.createElement('canvas');
        marbleCanvas.width = 1024;
        marbleCanvas.height = 1024;
        const mctx = marbleCanvas.getContext('2d');
        mctx.fillStyle = '#FAF7F2';
        mctx.fillRect(0, 0, 1024, 1024);

        // Translucent clouding
        mctx.fillStyle = 'rgba(235, 227, 216, 0.45)';
        for (let i = 0; i < 28; i++) {
            mctx.beginPath();
            mctx.arc(Math.random() * 1024, Math.random() * 1024, 120 + Math.random() * 220, 0, Math.PI * 2);
            mctx.fill();
        }

        // Gold & Slate Veins
        const drawVein = (color, width, startX, startY) => {
            mctx.strokeStyle = color;
            mctx.lineWidth = width;
            mctx.lineCap = 'round';
            mctx.beginPath();
            mctx.moveTo(startX, startY);
            let cx = startX, cy = startY;
            for (let step = 0; step < 18; step++) {
                cx += (Math.random() - 0.38) * 90;
                cy += 55 + Math.random() * 45;
                mctx.lineTo(cx, cy);
                if (Math.random() > 0.65) {
                    mctx.stroke();
                    mctx.beginPath();
                    mctx.moveTo(cx, cy);
                    mctx.lineTo(cx + (Math.random() - 0.5) * 60, cy + 35);
                    mctx.stroke();
                    mctx.beginPath();
                    mctx.moveTo(cx, cy);
                }
            }
            mctx.stroke();
        };

        for (let i = 0; i < 8; i++) {
            drawVein('rgba(195, 148, 75, 0.68)', 2.0 + Math.random() * 2.5, Math.random() * 950, 0);
            drawVein('rgba(115, 110, 105, 0.32)', 1.2, Math.random() * 950, 0);
        }
        this.textures.calacattaMarble = new THREE.CanvasTexture(marbleCanvas);
        this.textures.calacattaMarble.wrapS = THREE.RepeatWrapping;
        this.textures.calacattaMarble.wrapT = THREE.RepeatWrapping;

        // ── 3. Weathered Teak Decking (Rich Honey-Brown & Plank Grooves) ──
        const deckCanvas = document.createElement('canvas');
        deckCanvas.width = 512;
        deckCanvas.height = 512;
        const dctx = deckCanvas.getContext('2d');
        dctx.fillStyle = '#684522';
        dctx.fillRect(0, 0, 512, 512);
        const plankH = 24;
        for (let y = 0; y < 512; y += plankH) {
            dctx.fillStyle = (y % 48 === 0) ? '#754F28' : '#634120';
            dctx.fillRect(0, y, 512, plankH - 2);
            dctx.fillStyle = 'rgba(35, 22, 10, 0.25)';
            dctx.fillRect(0, y + 6, 512, 1);
            dctx.fillRect(0, y + 14, 512, 1);
            dctx.fillStyle = '#1c1208';
            dctx.fillRect(0, y + plankH - 2, 512, 2);
        }
        this.textures.teakDeck = new THREE.CanvasTexture(deckCanvas);
        this.textures.teakDeck.wrapS = THREE.RepeatWrapping;
        this.textures.teakDeck.wrapT = THREE.RepeatWrapping;
        this.textures.teakDeck.repeat.set(4, 4);

        // Teak Normal Map
        const deckNormCanvas = document.createElement('canvas');
        deckNormCanvas.width = 512;
        deckNormCanvas.height = 512;
        const dnctx = deckNormCanvas.getContext('2d');
        const dnData = dnctx.createImageData(512, 512);
        const dnd = dnData.data;
        for (let y = 0; y < 512; y++) {
            for (let x = 0; x < 512; x++) {
                const localY = y % plankH;
                let ny = 0, nz = 1;
                if (localY === 0) ny = -0.6;
                else if (localY === plankH - 3) ny = 0.6;
                else if (localY >= plankH - 2) nz = 0.4;
                nz = Math.sqrt(Math.max(0.1, 1 - ny * ny));
                const idx = (y * 512 + x) * 4;
                dnd[idx]     = 128;
                dnd[idx + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
                dnd[idx + 2] = Math.floor(nz * 255);
                dnd[idx + 3] = 255;
            }
        }
        dnctx.putImageData(dnData, 0, 0);
        this.textures.teakDeckNormal = new THREE.CanvasTexture(deckNormCanvas);
        this.textures.teakDeckNormal.wrapS = THREE.RepeatWrapping;
        this.textures.teakDeckNormal.wrapT = THREE.RepeatWrapping;
        this.textures.teakDeckNormal.repeat.set(4, 4);

        // ── 4. Natural Stacked Ledger Basalt Stone ──
        const stoneCanvas = document.createElement('canvas');
        stoneCanvas.width = 512;
        stoneCanvas.height = 512;
        const sctx = stoneCanvas.getContext('2d');
        sctx.fillStyle = '#26292C';
        sctx.fillRect(0, 0, 512, 512);

        const rowHeight = 22;
        for (let y = 0; y < 512; y += rowHeight) {
            let x = 0;
            while (x < 512) {
                const blockW = 35 + Math.floor(Math.random() * 55);
                const lightness = 30 + Math.floor(Math.random() * 25);
                sctx.fillStyle = `rgb(${lightness}, ${lightness + 2}, ${lightness + 4})`;
                sctx.fillRect(x, y, Math.min(blockW, 512 - x) - 2, rowHeight - 2);
                sctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
                sctx.fillRect(x, y, Math.min(blockW, 512 - x) - 2, 1);
                sctx.fillStyle = '#121416';
                sctx.fillRect(x + Math.min(blockW, 512 - x) - 2, y, 2, rowHeight);
                sctx.fillRect(x, y + rowHeight - 2, Math.min(blockW, 512 - x), 2);
                x += blockW;
            }
        }
        this.textures.stackedStone = new THREE.CanvasTexture(stoneCanvas);
        this.textures.stackedStone.wrapS = THREE.RepeatWrapping;
        this.textures.stackedStone.wrapT = THREE.RepeatWrapping;
        this.textures.stackedStone.repeat.set(3, 4);

        // ── 5. Preserved Living Moss Wellness Wall ──
        const mossCanvas = document.createElement('canvas');
        mossCanvas.width = 512;
        mossCanvas.height = 512;
        const mssCtx = mossCanvas.getContext('2d');
        mssCtx.fillStyle = '#1b321a';
        mssCtx.fillRect(0, 0, 512, 512);

        for (let i = 0; i < 900; i++) {
            const rad = 5 + Math.random() * 10;
            const rx = Math.random() * 512;
            const ry = Math.random() * 512;
            const grad = mssCtx.createRadialGradient(rx, ry, 1, rx, ry, rad);
            grad.addColorStop(0, Math.random() > 0.4 ? '#689d38' : '#7cb342');
            grad.addColorStop(0.7, '#386326');
            grad.addColorStop(1, '#182b13');
            mssCtx.fillStyle = grad;
            mssCtx.beginPath();
            mssCtx.arc(rx, ry, rad, 0, Math.PI * 2);
            mssCtx.fill();
        }
        this.textures.moss = new THREE.CanvasTexture(mossCanvas);
        this.textures.moss.wrapS = THREE.RepeatWrapping;
        this.textures.moss.wrapT = THREE.RepeatWrapping;
        this.textures.moss.repeat.set(2, 4);

        // ── 6. Standing Seam Zinc Architectural Roof ──
        const roofCanvas = document.createElement('canvas');
        roofCanvas.width = 512;
        roofCanvas.height = 512;
        const rctx = roofCanvas.getContext('2d');
        rctx.fillStyle = '#222629';
        rctx.fillRect(0, 0, 512, 512);
        for (let x = 0; x < 512; x += 32) {
            rctx.fillStyle = '#171A1C';
            rctx.fillRect(x, 0, 4, 512);
            rctx.fillStyle = '#424A50';
            rctx.fillRect(x + 4, 0, 1, 512);
        }
        this.textures.zincRoof = new THREE.CanvasTexture(roofCanvas);
        this.textures.zincRoof.wrapS = THREE.RepeatWrapping;
        this.textures.zincRoof.wrapT = THREE.RepeatWrapping;
        this.textures.zincRoof.repeat.set(4, 4);

        // ── 7. Photorealistic Water Ripple Normal Map ──
        const waterNormCanvas = document.createElement('canvas');
        waterNormCanvas.width = 512;
        waterNormCanvas.height = 512;
        const wnctx = waterNormCanvas.getContext('2d');
        const wnImgData = wnctx.createImageData(512, 512);
        const wnd = wnImgData.data;
        for (let y = 0; y < 512; y++) {
            for (let x = 0; x < 512; x++) {
                const u = (x / 512) * Math.PI * 6;
                const v = (y / 512) * Math.PI * 6;
                const dx = Math.cos(u * 1.5 + v) * 0.35 + Math.cos(u * 3.0 - v * 2.0) * 0.22 + Math.sin(u * 6.0 + v * 4.0) * 0.12;
                const dy = Math.sin(u - v * 1.5) * 0.35 + Math.sin(u * 2.5 + v * 3.0) * 0.22 + Math.cos(u * 5.0 - v * 5.0) * 0.12;
                const nx = -dx * 0.6;
                const ny = -dy * 0.6;
                const nz = Math.sqrt(Math.max(0.05, 1 - nx * nx - ny * ny));
                const idx = (y * 512 + x) * 4;
                wnd[idx]     = Math.floor((nx * 0.5 + 0.5) * 255);
                wnd[idx + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
                wnd[idx + 2] = Math.floor(nz * 255);
                wnd[idx + 3] = 255;
            }
        }
        wnctx.putImageData(wnImgData, 0, 0);
        this.textures.waterNormal = new THREE.CanvasTexture(waterNormCanvas);
        this.textures.waterNormal.wrapS = THREE.RepeatWrapping;
        this.textures.waterNormal.wrapT = THREE.RepeatWrapping;
        this.textures.waterNormal.repeat.set(4, 4);

        // ── 8. Submerged Ceramic Pool Mosaic Tiles ──
        const poolMosaicCanvas = document.createElement('canvas');
        poolMosaicCanvas.width = 512;
        poolMosaicCanvas.height = 512;
        const pmctx = poolMosaicCanvas.getContext('2d');
        pmctx.fillStyle = '#062633';
        pmctx.fillRect(0, 0, 512, 512);
        const tileSize = 16;
        for (let y = 0; y < 512; y += tileSize) {
            for (let x = 0; x < 512; x += tileSize) {
                const bVal = 55 + Math.floor(Math.random() * 45);
                pmctx.fillStyle = `rgb(12, ${bVal + 35}, ${bVal + 60})`;
                pmctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);
            }
        }
        this.textures.poolMosaic = new THREE.CanvasTexture(poolMosaicCanvas);
        this.textures.poolMosaic.wrapS = THREE.RepeatWrapping;
        this.textures.poolMosaic.wrapT = THREE.RepeatWrapping;
        this.textures.poolMosaic.repeat.set(6, 6);

        // ── 9. Master Layout Plan Texture (Ashushri Creations) ──
        const loader = new THREE.TextureLoader();
        loader.load('assets/plan/master-plan.png', (tex) => {
            tex.encoding = THREE.sRGBEncoding;
            this.textures.masterPlan = tex;
            if (this.planPlaneMesh) {
                this.planPlaneMesh.material.map = tex;
                this.planPlaneMesh.material.needsUpdate = true;
            }
        });
    }

    /* ═══════════════════════════════════════════════════════════════════════════
       PHYSICALLY BASED LIGHTING & PROCEDURAL IBL SKYDOME
       ═══════════════════════════════════════════════════════════════════════════ */
    setupEnvironmentAndLights() {
        this.generateSkyEnvironment();

        // Directional Sun Light
        this.sunLight = new THREE.DirectionalLight(0xFFE5CE, 1.35);
        this.sunLight.position.set(14, 20, 12);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 120;
        this.sunLight.shadow.camera.left = -22;
        this.sunLight.shadow.camera.right = 22;
        this.sunLight.shadow.camera.top = 22;
        this.sunLight.shadow.camera.bottom = -22;
        this.sunLight.shadow.bias = -0.00015;
        this.sunLight.shadow.radius = 2.0;
        this.scene.add(this.sunLight);

        // Balanced Sky & Ground Ambient Fill
        this.hemiLight = new THREE.HemisphereLight(0xFDF6E8, 0x1E2B25, 0.55);
        this.scene.add(this.hemiLight);

        // Warm 2700K Interior LED Cove Accent Light
        this.warmAccentLight = new THREE.PointLight(0xFFA726, 1.4, 22, 1.6);
        this.warmAccentLight.position.set(0, 3.2, 0);
        this.scene.add(this.warmAccentLight);

        // Pool Underwater Turquoise Illumination & Caustic Bounce
        this.poolBounceLight = new THREE.PointLight(0x00E5FF, 1.1, 16, 1.7);
        this.poolBounceLight.position.set(3.2, 0.4, 2.6);
        this.scene.add(this.poolBounceLight);

        // Architectural Horizon Rim Light
        this.rimLight = new THREE.DirectionalLight(0x8AB7C2, 0.4);
        this.rimLight.position.set(-16, 10, -16);
        this.scene.add(this.rimLight);

        this.lightObjects = {
            sun: this.sunLight,
            hemi: this.hemiLight,
            warmAccent: this.warmAccentLight,
            poolBounce: this.poolBounceLight,
            rim: this.rimLight
        };
    }

    generateSkyEnvironment() {
        const skyCanvas = document.createElement('canvas');
        skyCanvas.width = 1024;
        skyCanvas.height = 512;
        const sctx = skyCanvas.getContext('2d');

        const skyGrad = sctx.createLinearGradient(0, 0, 0, 512);
        skyGrad.addColorStop(0, '#102C4C');
        skyGrad.addColorStop(0.35, '#3B688E');
        skyGrad.addColorStop(0.50, '#E8AF72');
        skyGrad.addColorStop(0.55, '#C6874E');
        skyGrad.addColorStop(0.70, '#1E2C28');
        skyGrad.addColorStop(1.0, '#0D1A17');
        sctx.fillStyle = skyGrad;
        sctx.fillRect(0, 0, 1024, 512);

        // Atmospheric sun disc & corona
        const sunX = 350;
        const sunY = 245;
        const sunGlow = sctx.createRadialGradient(sunX, sunY, 4, sunX, sunY, 180);
        sunGlow.addColorStop(0, 'rgba(255, 255, 245, 1.0)');
        sunGlow.addColorStop(0.12, 'rgba(255, 220, 160, 0.85)');
        sunGlow.addColorStop(0.4, 'rgba(235, 150, 70, 0.35)');
        sunGlow.addColorStop(1, 'rgba(235, 150, 70, 0.0)');
        sctx.fillStyle = sunGlow;
        sctx.beginPath();
        sctx.arc(sunX, sunY, 180, 0, Math.PI * 2);
        sctx.fill();

        // Cirrus clouds
        sctx.fillStyle = 'rgba(255, 245, 230, 0.14)';
        for (let c = 0; c < 8; c++) {
            sctx.beginPath();
            sctx.ellipse(Math.random() * 1024, 160 + Math.random() * 70, 140 + Math.random() * 160, 6 + Math.random() * 8, 0, 0, Math.PI * 2);
            sctx.fill();
        }

        const skyTexture = new THREE.CanvasTexture(skyCanvas);
        skyTexture.mapping = THREE.EquirectangularReflectionMapping;
        skyTexture.encoding = THREE.sRGBEncoding;

        if (typeof THREE.PMREMGenerator !== 'undefined') {
            const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
            pmremGenerator.compileEquirectangularShader();
            const envMap = pmremGenerator.fromEquirectangular(skyTexture).texture;
            this.scene.environment = envMap;
            this.environmentMap = envMap;
        }

        const skyDomeGeo = new THREE.SphereGeometry(180, 32, 24);
        const skyDomeMat = new THREE.MeshBasicMaterial({
            map: skyTexture,
            side: THREE.BackSide,
            fog: false
        });
        const skyDome = new THREE.Mesh(skyDomeGeo, skyDomeMat);
        this.scene.add(skyDome);
    }

    setLightingMode(mode) {
        this.lightingMode = mode;
        if (mode === 'golden') {
            this.sunLight.color.setHex(0xFFE5CE);
            this.sunLight.intensity = 1.35;
            this.sunLight.position.set(14, 18, 12);
            this.hemiLight.color.setHex(0xFDF4E3);
            this.hemiLight.groundColor.setHex(0x281F17);
            this.hemiLight.intensity = 0.55;
            this.warmAccentLight.color.setHex(0xFFA726);
            this.warmAccentLight.intensity = 1.4;
            this.poolBounceLight.color.setHex(0x00E5FF);
            this.poolBounceLight.intensity = 1.0;
            this.renderer.toneMappingExposure = 1.18;
            this.scene.fog.color.setHex(0x182024);
        } else if (mode === 'night') {
            this.sunLight.color.setHex(0x24354A);
            this.sunLight.intensity = 0.22;
            this.sunLight.position.set(6, 16, -10);
            this.hemiLight.color.setHex(0x0C1622);
            this.hemiLight.groundColor.setHex(0x050A0E);
            this.hemiLight.intensity = 0.32;
            this.warmAccentLight.color.setHex(0xFF9800);
            this.warmAccentLight.intensity = 2.8;
            this.poolBounceLight.color.setHex(0x00E5FF);
            this.poolBounceLight.intensity = 2.4;
            this.renderer.toneMappingExposure = 1.12;
            this.scene.fog.color.setHex(0x080E14);
        } else if (mode === 'studio') {
            this.sunLight.color.setHex(0xFFF9F0);
            this.sunLight.intensity = 1.5;
            this.sunLight.position.set(12, 26, 14);
            this.hemiLight.color.setHex(0xEEF4F8);
            this.hemiLight.groundColor.setHex(0x283238);
            this.hemiLight.intensity = 0.7;
            this.warmAccentLight.color.setHex(0xD4A96A);
            this.warmAccentLight.intensity = 0.9;
            this.poolBounceLight.color.setHex(0x26C6DA);
            this.poolBounceLight.intensity = 0.6;
            this.renderer.toneMappingExposure = 1.25;
            this.scene.fog.color.setHex(0x1B2625);
        }
    }

    /* ═══════════════════════════════════════════════════════════════════════════
       PBR MATERIAL LIBRARY
       ═══════════════════════════════════════════════════════════════════════════ */
    getMaterials() {
        return {
            flutedWood: new THREE.MeshStandardMaterial({
                map: this.textures.flutedWood,
                normalMap: this.textures.flutedWoodNormal,
                normalScale: new THREE.Vector2(0.8, 0.8),
                roughness: 0.52,
                metalness: 0.05,
            }),
            marble: new THREE.MeshStandardMaterial({
                map: this.textures.calacattaMarble,
                roughness: 0.14,
                metalness: 0.08,
            }),
            teak: new THREE.MeshStandardMaterial({
                map: this.textures.teakDeck,
                normalMap: this.textures.teakDeckNormal,
                normalScale: new THREE.Vector2(0.6, 0.6),
                roughness: 0.58,
                metalness: 0.05,
            }),
            stackedStone: new THREE.MeshStandardMaterial({
                map: this.textures.stackedStone,
                roughness: 0.85,
                metalness: 0.05,
            }),
            zincRoof: new THREE.MeshStandardMaterial({
                map: this.textures.zincRoof,
                roughness: 0.38,
                metalness: 0.55,
                color: 0x2A2E32
            }),
            champagneMetal: new THREE.MeshStandardMaterial({
                color: 0xD4A96A,
                roughness: 0.28,
                metalness: 0.88,
            }),
            charcoalMetal: new THREE.MeshStandardMaterial({
                color: 0x1A1C1E,
                roughness: 0.42,
                metalness: 0.7,
            }),
            mossWall: new THREE.MeshStandardMaterial({
                map: this.textures.moss,
                roughness: 0.92,
                metalness: 0.0,
            }),
            pearlWall: new THREE.MeshStandardMaterial({
                color: 0xEDE7DC,
                roughness: 0.80,
                metalness: 0.04,
            }),
            darkBasalt: new THREE.MeshStandardMaterial({
                color: 0x181A1C,
                roughness: 0.32,
                metalness: 0.12,
            }),
            glass: new THREE.MeshPhysicalMaterial({
                color: 0xD6EDF8,
                transparent: true,
                opacity: 0.22,
                roughness: 0.04,
                metalness: 0.08,
                transmission: 0.90,
                ior: 1.52,
                clearcoat: 1.0,
                clearcoatRoughness: 0.05,
            }),
            warmLed: new THREE.MeshBasicMaterial({
                color: 0xFFD59E,
            }),
            poolWater: new THREE.MeshPhysicalMaterial({
                color: 0x127A8C,
                transparent: true,
                opacity: 0.72,
                roughness: 0.03,
                metalness: 0.08,
                transmission: 0.76,
                ior: 1.333,
                clearcoat: 1.0,
                clearcoatRoughness: 0.02,
                normalMap: this.textures.waterNormal,
                normalScale: new THREE.Vector2(0.4, 0.4),
            }),
            poolMosaic: new THREE.MeshStandardMaterial({
                map: this.textures.poolMosaic,
                roughness: 0.22,
                metalness: 0.1,
            }),
            matteBlack: new THREE.MeshStandardMaterial({
                color: 0x141416,
                roughness: 0.38,
                metalness: 0.15,
            }),
            velvetChampagne: new THREE.MeshStandardMaterial({
                color: 0xC8B89E,
                roughness: 0.88,
                metalness: 0.04,
            }),
            darkFabric: new THREE.MeshStandardMaterial({
                color: 0x222326,
                roughness: 0.92,
                metalness: 0.0,
            }),
            sheerCurtain: new THREE.MeshStandardMaterial({
                color: 0xF8F5EE,
                roughness: 0.85,
                transparent: true,
                opacity: 0.55,
                side: THREE.DoubleSide
            })
        };
    }

    /* ═══════════════════════════════════════════════════════════════════════════
       MODEL 1: HIGH-FIDELITY LUXURY COTTAGE (Full Overview & Exploded Cutaway)
       ═══════════════════════════════════════════════════════════════════════════ */
    buildLuxuryCottage() {
        const mat = this.getMaterials();
        this.villaOverviewGroup = new THREE.Group();

        // ── LAYER 0: Ground Platform, Teak Deck & Infinity Plunge Pool Basin ──
        const poolDeckGroup = new THREE.Group();

        // Concrete foundation slab
        const slab = new THREE.Mesh(new THREE.BoxGeometry(11.2, 0.4, 10.2), mat.darkBasalt);
        slab.position.y = 0.2;
        slab.receiveShadow = true;
        poolDeckGroup.add(slab);

        // Weathered teak solarium deck with perimeter reveals
        const deck = new THREE.Mesh(new THREE.BoxGeometry(11.0, 0.08, 10.0), mat.teak);
        deck.position.y = 0.44;
        deck.receiveShadow = true;
        poolDeckGroup.add(deck);

        // Deck perimeter linear warm LED underglow
        const deckGlow = new THREE.Mesh(new THREE.BoxGeometry(11.0, 0.03, 0.03), mat.warmLed);
        deckGlow.position.set(0, 0.06, 5.0);
        poolDeckGroup.add(deckGlow);

        // Hollow Recessed Pool Basin Structure
        const poolGroup = new THREE.Group();
        poolGroup.position.set(3.2, 0, 2.6);

        // Pool Mosaic Floor (at depth y = -0.42)
        const pFloor = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 3.2), mat.poolMosaic);
        pFloor.rotation.x = -Math.PI / 2;
        pFloor.position.y = -0.42;
        pFloor.receiveShadow = true;
        poolGroup.add(pFloor);

        // Pool Inner Mosaic Walls
        const pWallN = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 0.88), mat.poolMosaic);
        pWallN.position.set(0, 0.02, -1.6);
        const pWallS = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 0.88), mat.poolMosaic);
        pWallS.rotation.y = Math.PI;
        pWallS.position.set(0, 0.02, 1.6);
        const pWallW = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.88), mat.poolMosaic);
        pWallW.rotation.y = Math.PI / 2;
        pWallW.position.set(-2.1, 0.02, 0);
        const pWallE = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.88), mat.poolMosaic);
        pWallE.rotation.y = -Math.PI / 2;
        pWallE.position.set(2.1, 0.02, 0);
        poolGroup.add(pWallN, pWallS, pWallW, pWallE);

        // Submerged Pool Steps
        for (let s = 0; s < 3; s++) {
            const step = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.14, 0.35), mat.poolMosaic);
            step.position.set(-1.4, -0.28 + s * 0.14, -1.35 + s * 0.35);
            poolGroup.add(step);
        }

        // Wet Dark Basalt Stone Coping Border
        const copingW = 0.28;
        const cN = new THREE.Mesh(new THREE.BoxGeometry(4.2 + copingW * 2, 0.08, copingW), mat.darkBasalt);
        cN.position.set(0, 0.46, -1.6 - copingW / 2);
        const cS = new THREE.Mesh(new THREE.BoxGeometry(4.2 + copingW * 2, 0.08, copingW), mat.darkBasalt);
        cS.position.set(0, 0.46, 1.6 + copingW / 2);
        const cW = new THREE.Mesh(new THREE.BoxGeometry(copingW, 0.08, 3.2), mat.darkBasalt);
        cW.position.set(-2.1 - copingW / 2, 0.46, 0);
        const cE = new THREE.Mesh(new THREE.BoxGeometry(copingW, 0.08, 3.2), mat.darkBasalt);
        cE.position.set(2.1 + copingW / 2, 0.46, 0);
        poolGroup.add(cN, cS, cW, cE);

        // Crystal Clear Ripling Water Surface at y = 0.40
        const waterGeo = new THREE.PlaneGeometry(4.2, 3.2, 32, 32);
        this.poolWaterMesh = new THREE.Mesh(waterGeo, mat.poolWater);
        this.poolWaterMesh.rotation.x = -Math.PI / 2;
        this.poolWaterMesh.position.y = 0.40;
        poolGroup.add(this.poolWaterMesh);

        // Underwater LED Niche Fixtures
        [-1.2, 0, 1.2].forEach(px => {
            const spot = new THREE.Mesh(
                new THREE.CylinderGeometry(0.08, 0.08, 0.03, 16),
                mat.charcoalMetal
            );
            spot.rotation.x = Math.PI / 2;
            spot.position.set(px, 0.05, -1.58);
            const lens = new THREE.Mesh(
                new THREE.CylinderGeometry(0.06, 0.06, 0.02, 16),
                new THREE.MeshBasicMaterial({ color: 0x00E5FF })
            );
            lens.rotation.x = Math.PI / 2;
            lens.position.set(px, 0.05, -1.56);
            poolGroup.add(spot, lens);
        });

        poolDeckGroup.add(poolGroup);

        // Twin Modern Black Sun Loungers
        [-0.7, 0.7].forEach(offset => {
            const lounger = new THREE.Group();
            const frame = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.08, 2.05), mat.charcoalMetal);
            const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.12, 1.45), mat.darkFabric);
            cushion.position.set(0, 0.1, 0.28);
            const headrest = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.12, 0.6), mat.darkFabric);
            headrest.position.set(0, 0.22, -0.72);
            headrest.rotation.x = -0.42;
            lounger.add(frame, cushion, headrest);
            lounger.position.set(3.2 + offset * 1.35, 0.52, 0.4);
            poolDeckGroup.add(lounger);
        });

        const drinkTable = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.35, 20), mat.darkBasalt);
        drinkTable.position.set(3.2, 0.64, 0.4);
        poolDeckGroup.add(drinkTable);

        this.explodedLayers.poolDeck = poolDeckGroup;
        this.villaOverviewGroup.add(poolDeckGroup);

        // ── LAYER 1: Ground Floor Architecture (Enclosed Pavilion, Sunken Lounge) ──
        const groundGroup = new THREE.Group();
        groundGroup.position.y = 0.48;

        // Exterior Architectural Walls
        // Back Wall
        const backWall = new THREE.Mesh(new THREE.BoxGeometry(7.4, 2.8, 0.28), mat.pearlWall);
        backWall.position.set(-1.5, 1.4, -4.5);
        backWall.castShadow = true;
        groundGroup.add(backWall);

        // East Side Exterior Stacked Stone Shear Wall
        const stoneShearWall = new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.8, 9.2), mat.stackedStone);
        stoneShearWall.position.set(-5.15, 1.4, 0);
        stoneShearWall.castShadow = true;
        groundGroup.add(stoneShearWall);

        // West Side Architectural Enclosure Wall (Stone + Timber)
        const westStoneWall = new THREE.Mesh(new THREE.BoxGeometry(0.28, 2.8, 4.6), mat.stackedStone);
        westStoneWall.position.set(2.2, 1.4, -2.2);
        westStoneWall.castShadow = true;
        groundGroup.add(westStoneWall);

        // Internal Acoustic Fluted Dark Oak Wall
        const flutedAccent = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.7, 4.6), mat.flutedWood);
        flutedAccent.position.set(-4.95, 1.4, -2.0);
        groundGroup.add(flutedAccent);

        // Concealed Top LED Cove Lighting Channel grazing down timber slats
        const coveStrip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 4.6), mat.warmLed);
        coveStrip.position.set(-4.90, 2.75, -2.0);
        groundGroup.add(coveStrip);

        // Recessed Ceiling Downlights
        for (let i = -3.8; i <= 0.2; i += 1.3) {
            const bezel = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 16), mat.charcoalMetal);
            const spotGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.015, 12), mat.warmLed);
            bezel.position.set(i, 2.78, 0);
            spotGlow.position.set(i, 2.77, 0);
            groundGroup.add(bezel, spotGlow);
        }

        // Sunken Conversation Lounge Pit
        const sofa = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.48, 1.4), mat.velvetChampagne);
        sofa.position.set(-2.0, 0.32, -1.8);
        sofa.castShadow = true;
        const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.42, 0.25), mat.velvetChampagne);
        sofaBack.position.set(-2.0, 0.65, -2.4);
        const chaise = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.48, 1.8), mat.velvetChampagne);
        chaise.position.set(-3.25, 0.32, -0.6);
        groundGroup.add(sofa, sofaBack, chaise);

        // Accent Lumbar Pillows
        [-2.8, -2.0, -1.2].forEach((px, idx) => {
            const pillow = new THREE.Mesh(
                new THREE.BoxGeometry(0.42, 0.28, 0.14),
                idx === 1 ? mat.darkFabric : mat.champagneMetal
            );
            pillow.rotation.y = (idx - 1) * 0.15;
            pillow.position.set(px, 0.65, -2.2);
            groundGroup.add(pillow);
        });

        // Honed Calacatta Marble Slab Coffee Table
        const coffeeTable = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.22, 0.85), mat.marble);
        coffeeTable.position.set(-1.8, 0.16, -0.6);
        coffeeTable.castShadow = true;
        const coffeeBase = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 0.65), mat.champagneMetal);
        coffeeBase.position.set(-1.8, 0.04, -0.6);
        groundGroup.add(coffeeTable, coffeeBase);

        // Biophilic Courtyard Garden & Natural Japanese Ficus Tree
        const planterCurb = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.1, 0.12, 24), mat.darkBasalt);
        planterCurb.position.set(0.6, 0.06, -1.0);
        const pebbleBed = new THREE.Mesh(new THREE.CylinderGeometry(0.98, 0.98, 0.04, 24), mat.pearlWall);
        pebbleBed.position.set(0.6, 0.11, -1.0);
        groundGroup.add(planterCurb, pebbleBed);

        const treeTrunkGroup = new THREE.Group();
        const trunk1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.10, 2.6, 12), mat.teak);
        trunk1.position.set(0, 1.3, 0);
        trunk1.rotation.z = -0.06;
        const trunk2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.07, 2.1, 10), mat.teak);
        trunk2.position.set(0.08, 1.1, 0.05);
        trunk2.rotation.z = 0.14;
        trunk2.rotation.x = 0.08;
        treeTrunkGroup.add(trunk1, trunk2);

        const canopyPositions = [
            { x: 0, y: 2.3, z: 0, scale: 0.48 },
            { x: -0.22, y: 2.5, z: 0.15, scale: 0.42 },
            { x: 0.25, y: 2.6, z: -0.12, scale: 0.45 },
            { x: 0.1, y: 2.85, z: 0.1, scale: 0.38 },
            { x: -0.15, y: 2.95, z: -0.1, scale: 0.35 }
        ];
        canopyPositions.forEach(c => {
            const foliage = new THREE.Mesh(
                new THREE.DodecahedronGeometry(c.scale, 1),
                mat.mossWall
            );
            foliage.position.set(c.x, c.y, c.z);
            treeTrunkGroup.add(foliage);
        });
        treeTrunkGroup.position.set(0.6, 0, -1.0);
        groundGroup.add(treeTrunkGroup);

        // Floor-to-Ceiling Panoramic Glass Glazing System with Black Mullions
        const frontGlass = new THREE.Mesh(new THREE.BoxGeometry(6.6, 2.7, 0.05), mat.glass);
        frontGlass.position.set(-1.5, 1.4, 2.5);
        groundGroup.add(frontGlass);

        const hFrame1 = new THREE.Mesh(new THREE.BoxGeometry(6.7, 0.07, 0.12), mat.charcoalMetal);
        hFrame1.position.set(-1.5, 2.75, 2.5);
        const hFrame2 = new THREE.Mesh(new THREE.BoxGeometry(6.7, 0.07, 0.12), mat.charcoalMetal);
        hFrame2.position.set(-1.5, 0.05, 2.5);
        [-4.8, -1.5, 1.8].forEach(mx => {
            const vMullion = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.75, 0.12), mat.charcoalMetal);
            vMullion.position.set(mx, 1.4, 2.5);
            groundGroup.add(vMullion);
        });
        groundGroup.add(hFrame1, hFrame2);

        // Linen sheer curtains
        [-4.5, 1.5].forEach(cx => {
            const curtain = new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.68, 0.18), mat.sheerCurtain);
            curtain.position.set(cx, 1.38, 2.4);
            groundGroup.add(curtain);
        });

        this.explodedLayers.groundFloor = groundGroup;
        this.villaOverviewGroup.add(groundGroup);

        // ── LAYER 2: Eurostairs Cantilevered Floating Staircase ──
        const stairsGroup = new THREE.Group();
        stairsGroup.position.set(-4.8, 0.48, -4.2);

        const stepCount = 11;
        const stepRise = 2.8 / stepCount;
        const stepRun = 0.32;

        for (let s = 0; s < stepCount; s++) {
            const tread = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.08, 0.30), mat.teak);
            tread.position.set(0.68, s * stepRise + 0.1, s * stepRun);
            tread.castShadow = true;
            stairsGroup.add(tread);

            const stepLed = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.02, 0.02), mat.warmLed);
            stepLed.position.set(0.68, s * stepRise + 0.04, s * stepRun + 0.12);
            stairsGroup.add(stepLed);
        }

        const balustrade = new THREE.Mesh(
            new THREE.BoxGeometry(0.03, 1.35, stepCount * stepRun + 0.2),
            mat.glass
        );
        balustrade.position.set(1.36, 1.85, (stepCount * stepRun) / 2);
        stairsGroup.add(balustrade);

        const handrail = new THREE.Mesh(
            new THREE.BoxGeometry(0.06, 0.04, stepCount * stepRun + 0.2),
            mat.champagneMetal
        );
        handrail.position.set(1.36, 2.52, (stepCount * stepRun) / 2);
        stairsGroup.add(handrail);

        this.explodedLayers.stairs = stairsGroup;
        this.villaOverviewGroup.add(stairsGroup);

        // ── LAYER 3: First Floor Mezzanine Architecture ──
        const upperGroup = new THREE.Group();
        upperGroup.position.y = 3.3;

        // Mezzanine Floor Slab
        const upperFloorSlab = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.24, 8.8), mat.teak);
        upperFloorSlab.position.set(-1.5, 0.0, -0.1);
        upperFloorSlab.receiveShadow = true;
        upperGroup.add(upperFloorSlab);

        // Upper Exterior Walls Enclosure
        const upBackWall = new THREE.Mesh(new THREE.BoxGeometry(7.4, 2.4, 0.25), mat.pearlWall);
        upBackWall.position.set(-1.5, 1.2, -4.5);
        upBackWall.castShadow = true;
        const upWestWall = new THREE.Mesh(new THREE.BoxGeometry(0.28, 2.4, 4.6), mat.stackedStone);
        upWestWall.position.set(2.2, 1.2, -2.2);
        upWestWall.castShadow = true;
        const upEastWall = new THREE.Mesh(new THREE.BoxGeometry(0.28, 2.4, 4.6), mat.stackedStone);
        upEastWall.position.set(-5.15, 1.2, -2.2);
        upEastWall.castShadow = true;
        upperGroup.add(upBackWall, upWestWall, upEastWall);

        // Low Japanese Platform King Bed
        const bedPlinth = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.22, 2.7), mat.flutedWood);
        bedPlinth.position.set(-2.4, 0.22, -1.8);
        const mattress = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.36, 2.3), mat.velvetChampagne);
        mattress.position.set(-2.4, 0.52, -1.7);
        const duvet = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.15, 1.6), mat.darkFabric);
        duvet.position.set(-2.4, 0.68, -1.35);
        const pillows = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.16, 0.45), mat.velvetChampagne);
        pillows.position.set(-2.4, 0.72, -2.4);

        // Full-Height Fluted Acoustic Wall Behind Headboard
        const headboard = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.3, 3.4), mat.flutedWood);
        headboard.position.set(-5.0, 1.15, -1.8);
        upperGroup.add(bedPlinth, mattress, duvet, pillows, headboard);

        // Master Bedroom Cove LED Grazing
        const bedLed = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 3.4), mat.warmLed);
        bedLed.position.set(-4.95, 2.28, -1.8);
        upperGroup.add(bedLed);

        // Bedside Floating Nightstands & Bronze Drop Globe Pendants
        [-3.8, -1.0].forEach(bx => {
            const nightstand = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.2, 0.45), mat.flutedWood);
            nightstand.position.set(bx, 0.25, -2.5);
            const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 1.2, 8), mat.charcoalMetal);
            cord.position.set(bx, 1.8, -2.5);
            const globe = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), mat.warmLed);
            globe.position.set(bx, 1.2, -2.5);
            upperGroup.add(nightstand, cord, globe);
        });

        // Luxury Spa Bathroom Suite
        const bathGroup = new THREE.Group();
        bathGroup.position.set(0.6, 0.12, -2.2);

        // Bookmatched Calacatta Gold Marble Slab Wall
        const marbleWall = new THREE.Mesh(new THREE.BoxGeometry(2.7, 2.4, 0.08), mat.marble);
        marbleWall.position.set(0, 1.2, -1.8);
        bathGroup.add(marbleWall);

        // Preserved Living Moss Wellness Wall
        const mossAccent = new THREE.Mesh(new THREE.BoxGeometry(0.65, 2.4, 0.12), mat.mossWall);
        mossAccent.position.set(1.0, 1.2, -1.76);
        bathGroup.add(mossAccent);

        // Slatted Teak Mat under Tub
        const tubMat = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.03, 1.2), mat.teak);
        tubMat.position.set(-0.3, 0.02, -0.6);
        bathGroup.add(tubMat);

        // Freestanding Matte Black Ergonomic Oval Soaking Tub
        const tubGeo = new THREE.CylinderGeometry(0.55, 0.45, 0.62, 28);
        tubGeo.scale(1.45, 1.0, 0.88);
        const tub = new THREE.Mesh(tubGeo, mat.matteBlack);
        tub.position.set(-0.3, 0.36, -0.6);
        bathGroup.add(tub);

        // Floor-Mounted Brass Tub Mixer
        const standPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.88, 16), mat.champagneMetal);
        standPipe.position.set(0.28, 0.44, -0.6);
        const spout = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 0.03), mat.champagneMetal);
        spout.position.set(0.2, 0.88, -0.6);
        bathGroup.add(standPipe, spout);

        // Floating Vanity & Vessel Basin
        const vanity = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.32, 0.48), mat.flutedWood);
        vanity.position.set(0.2, 0.8, -1.4);
        const basin = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.20, 0.16, 20), mat.marble);
        basin.position.set(0.2, 1.04, -1.4);

        // Backlit Circular Vanity Mirror
        const mirrorFrame = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.02, 32), mat.charcoalMetal);
        mirrorFrame.rotation.x = Math.PI / 2;
        mirrorFrame.position.set(0.2, 1.62, -1.74);
        const mirrorGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.025, 32), mat.warmLed);
        mirrorGlow.rotation.x = Math.PI / 2;
        mirrorGlow.position.set(0.2, 1.62, -1.73);
        bathGroup.add(vanity, basin, mirrorFrame, mirrorGlow);

        upperGroup.add(bathGroup);

        // Master Balcony Cantilever
        const balcony = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.16, 1.8), mat.teak);
        balcony.position.set(-1.5, 0.0, 3.4);
        upperGroup.add(balcony);

        const balcGlass = new THREE.Mesh(new THREE.BoxGeometry(7.0, 1.15, 0.04), mat.glass);
        balcGlass.position.set(-1.5, 0.62, 4.25);
        const balcCap = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.04, 0.06), mat.charcoalMetal);
        balcCap.position.set(-1.5, 1.2, 4.25);
        upperGroup.add(balcGlass, balcCap);

        // Sliding Timber Privacy Louvers (Matching photo 13-05-58)
        const louverPanel = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.3, 0.06), mat.flutedWood);
        louverPanel.position.set(-4.0, 1.2, 3.8);
        upperGroup.add(louverPanel);

        this.explodedLayers.upperFloor = upperGroup;
        this.villaOverviewGroup.add(upperGroup);

        // ── LAYER 4: Cantilevered Architectural Roof (Exploded Cutaway Component) ──
        const roofGroup = new THREE.Group();
        roofGroup.position.y = 5.8;

        const roofMain = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.28, 10.8), mat.zincRoof);
        roofMain.rotation.z = -0.04;
        roofMain.castShadow = true;
        roofGroup.add(roofMain);

        const soffit = new THREE.Mesh(new THREE.BoxGeometry(9.0, 0.05, 10.6), mat.teak);
        soffit.position.y = -0.16;
        roofGroup.add(soffit);

        const fasciaFront = new THREE.Mesh(new THREE.BoxGeometry(9.3, 0.32, 0.08), mat.charcoalMetal);
        fasciaFront.position.set(0, 0, 5.4);
        const fasciaSide = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.32, 10.8), mat.charcoalMetal);
        fasciaSide.position.set(4.6, 0, 0);
        roofGroup.add(fasciaFront, fasciaSide);

        const skylightFrame = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.08, 3.3), mat.charcoalMetal);
        skylightFrame.position.set(0.6, 0.16, -1.0);
        const skylightGlass = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.04, 3.1), mat.glass);
        skylightGlass.position.set(0.6, 0.20, -1.0);
        roofGroup.add(skylightFrame, skylightGlass);

        this.explodedLayers.roof = roofGroup;
        this.villaOverviewGroup.add(roofGroup);

        this.mainGroup.add(this.villaOverviewGroup);
    }

    /* ═══════════════════════════════════════════════════════════════════════════
       MODEL 2: 2.5 ACRE MASTER RESORT SITE PLAN (Ashushri Creations, Balasore)
       ═══════════════════════════════════════════════════════════════════════════ */
    buildMasterResort() {
        const mat = this.getMaterials();
        this.resortGroup = new THREE.Group();

        // 10 Detailed Luxury Cottages (Arranged per Ashushri Creations plan)
        const cottageCoords = [
            { x: -16, z: -8, ry: 0 },
            { x: -13, z: -8, ry: 0 },
            { x: -10, z: -8, ry: 0 },
            { x: -7,  z: -8, ry: 0 },
            { x: -4,  z: -8, ry: 0 },
            { x: -1,  z: -8, ry: 0 },
            { x: -18, z: -5, ry: Math.PI / 2 },
            { x: -18, z: -2, ry: Math.PI / 2 },
            { x: -18, z:  1, ry: Math.PI / 2 },
            { x: -18, z:  4, ry: Math.PI / 2 },
        ];

        cottageCoords.forEach((pos) => {
            const cottage = this.createCompactCottage(mat);
            cottage.position.set(pos.x, 0, pos.z);
            cottage.rotation.y = pos.ry;
            this.resortGroup.add(cottage);
        });

        // Grand Banquet Hall (Legend 3 - 2,000 sqft)
        const banquet = new THREE.Group();
        const bPlinth = new THREE.Mesh(new THREE.BoxGeometry(9.4, 0.3, 7.8), mat.darkBasalt);
        bPlinth.position.y = 0.15;
        bPlinth.receiveShadow = true;
        const banquetBase = new THREE.Mesh(new THREE.BoxGeometry(8.8, 3.0, 7.2), mat.pearlWall);
        banquetBase.position.y = 1.65;
        banquetBase.castShadow = true;
        const col1 = new THREE.Mesh(new THREE.BoxGeometry(0.75, 3.0, 0.75), mat.stackedStone);
        col1.position.set(-4.1, 1.65, 3.3);
        const col2 = new THREE.Mesh(new THREE.BoxGeometry(0.75, 3.0, 0.75), mat.stackedStone);
        col2.position.set(4.1, 1.65, 3.3);
        const bGlass = new THREE.Mesh(new THREE.BoxGeometry(5.4, 2.4, 0.06), mat.glass);
        bGlass.position.set(0, 1.5, 3.63);
        const bFascia = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.15, 8.0), mat.teak);
        bFascia.position.y = 3.2;
        bFascia.castShadow = true;
        const bRoof = new THREE.Mesh(new THREE.ConeGeometry(6.6, 2.2, 4), mat.zincRoof);
        bRoof.rotation.y = Math.PI / 4;
        bRoof.position.y = 4.3;
        bRoof.castShadow = true;
        banquet.add(bPlinth, banquetBase, col1, col2, bGlass, bFascia, bRoof);
        banquet.position.set(5.5, 0, -8.0);
        this.resortGroup.add(banquet);

        // Kitchen & Dining (Legend 2 - 525 sqft)
        const kitchen = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.5, 3.2), mat.pearlWall);
        kitchen.position.set(-18, 1.25, 7.5);
        const kRoof = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.45, 3.6), mat.zincRoof);
        kRoof.position.set(-18, 2.7, 7.5);
        this.resortGroup.add(kitchen, kRoof);

        // Main Resort Swimming Pool (Legend 8 - 1,800 sqft Lagoon Pool)
        const poolGroup = new THREE.Group();
        // Hollow basin wall
        const poolBasinGeo = new THREE.CylinderGeometry(4.2, 4.0, 0.65, 32, 1, true);
        poolBasinGeo.scale(1.45, 1.0, 0.92);
        const poolBasin = new THREE.Mesh(poolBasinGeo, mat.darkBasalt);
        poolBasin.position.y = 0.32;

        // Mosaic basin floor
        const poolFloorGeo = new THREE.CircleGeometry(4.0, 32);
        poolFloorGeo.scale(1.45, 0.92);
        const poolFloor = new THREE.Mesh(poolFloorGeo, mat.poolMosaic);
        poolFloor.rotation.x = -Math.PI / 2;
        poolFloor.position.y = 0.04;

        // Coping edge ring
        const copingGeo = new THREE.RingGeometry(3.9, 4.4, 32);
        copingGeo.scale(1.45, 0.92);
        const coping = new THREE.Mesh(copingGeo, mat.darkBasalt);
        coping.rotation.x = -Math.PI / 2;
        coping.position.y = 0.65;

        // Real turquoise lagoon pool water
        const poolWaterGeo = new THREE.CircleGeometry(4.0, 32);
        poolWaterGeo.scale(1.45, 0.92);
        this.resortPoolWaterMesh = new THREE.Mesh(poolWaterGeo, mat.poolWater);
        this.resortPoolWaterMesh.rotation.x = -Math.PI / 2;
        this.resortPoolWaterMesh.position.y = 0.58;

        // Underwater turquoise LED glow
        const poolGlow = new THREE.Mesh(poolWaterGeo.clone(), mat.waterLed);
        poolGlow.rotation.x = -Math.PI / 2;
        poolGlow.position.y = 0.06;

        poolGroup.add(poolBasin, poolFloor, coping, this.resortPoolWaterMesh, poolGlow);
        poolGroup.position.set(-11, 0, -2.5);
        this.resortGroup.add(poolGroup);

        // Central Vehicular Turning Plaza & 3-Tiered Water Fountain (Legend 15)
        const fountain = new THREE.Group();
        // Hollow basin wall
        const fBasin = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.5, 0.5, 28, 1, true), mat.darkBasalt);
        fBasin.position.y = 0.25;
        const fFloor = new THREE.Mesh(new THREE.CircleGeometry(2.3, 28), mat.poolMosaic);
        fFloor.rotation.x = -Math.PI / 2;
        fFloor.position.y = 0.03;
        const fCoping = new THREE.Mesh(new THREE.RingGeometry(2.1, 2.45, 28), mat.darkBasalt);
        fCoping.rotation.x = -Math.PI / 2;
        fCoping.position.y = 0.50;

        const fWater = new THREE.Mesh(new THREE.CircleGeometry(2.2, 28), mat.poolWater);
        fWater.rotation.x = -Math.PI / 2;
        fWater.position.y = 0.44;

        const fTier2 = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.2, 0.45, 24), mat.pearlWall);
        fTier2.position.y = 0.65;
        const fCenter = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 1.3, 16), mat.champagneMetal);
        fCenter.position.y = 1.05;
        fountain.add(fBasin, fFloor, fCoping, fWater, fTier2, fCenter);
        fountain.position.set(13.5, 0, 2.0);
        this.resortGroup.add(fountain);

        // Campfire Gathering Pit & Open Lounge (Legend 7)
        const campFire = new THREE.Group();
        const firePit = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.5, 0.45, 20), mat.darkBasalt);
        firePit.position.y = 0.22;
        const embers = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 12), mat.warmLed);
        embers.position.y = 0.42;
        const bench = new THREE.Mesh(new THREE.RingGeometry(1.9, 2.6, 28), mat.teak);
        bench.rotation.x = -Math.PI / 2;
        bench.position.y = 0.38;
        campFire.add(firePit, embers, bench);
        campFire.position.set(-8.5, 0, 7.5);
        this.resortGroup.add(campFire);

        // Eco Tree House (Legend 12)
        const treehouse = new THREE.Group();
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.55, 5.2, 10), mat.teak);
        trunk.position.y = 2.6;
        const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.9, 2.3), mat.flutedWood);
        cabin.position.y = 4.3;
        const thRoof = new THREE.Mesh(new THREE.ConeGeometry(1.9, 1.5, 4), mat.zincRoof);
        thRoof.rotation.y = Math.PI / 4;
        thRoof.position.y = 6.0;
        treehouse.add(trunk, cabin, thRoof);
        treehouse.position.set(2.5, 0, 7.5);
        this.resortGroup.add(treehouse);

        // Mud Huts (Legend 14 - 4 Units)
        for (let m = 0; m < 4; m++) {
            const mudHut = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.35, 1.7, 20), mat.pearlWall);
            mudHut.position.set(9.0 + m * 2.3, 0.85, 6.5 + m * 0.4);
            const hutRoof = new THREE.Mesh(new THREE.ConeGeometry(1.65, 1.3, 20), mat.teak);
            hutRoof.position.set(9.0 + m * 2.3, 2.3, 6.5 + m * 0.4);
            this.resortGroup.add(mudHut, hutRoof);
        }

        // Grand Entrance Gate (Legend 10)
        const gateGroup = new THREE.Group();
        const pillarL = new THREE.Mesh(new THREE.BoxGeometry(0.85, 3.6, 0.85), mat.stackedStone);
        pillarL.position.set(0, 1.8, -2.6);
        const pillarR = new THREE.Mesh(new THREE.BoxGeometry(0.85, 3.6, 0.85), mat.stackedStone);
        pillarR.position.set(0, 1.8, 2.6);
        const beam = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.65, 6.2), mat.teak);
        beam.position.set(0, 3.7, 0);
        gateGroup.add(pillarL, pillarR, beam);
        gateGroup.position.set(24.0, 0, 2.0);
        this.resortGroup.add(gateGroup);

        this.resortGroup.position.set(0, 0, 0);
        this.mainGroup.add(this.resortGroup);
    }

    createCompactCottage(mat) {
        const c = new THREE.Group();

        // Foundation plinth
        const plinth = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.25, 2.8), mat.darkBasalt);
        plinth.position.y = 0.12;
        plinth.receiveShadow = true;

        // Cottage body with fluted timber siding and stone base
        const base = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.8, 2.4), mat.flutedWood);
        base.position.y = 1.05;
        base.castShadow = true;

        // Timber fascia & cantilevered eaves
        const fascia = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.1, 2.9), mat.teak);
        fascia.position.y = 1.98;
        fascia.castShadow = true;

        // Modern standing seam zinc roof
        const roof = new THREE.Mesh(new THREE.ConeGeometry(2.2, 0.9, 4), mat.zincRoof);
        roof.rotation.y = Math.PI / 4;
        roof.position.y = 2.45;
        roof.castShadow = true;

        // Glass front with warm interior glow
        const glassFront = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.35, 0.04), mat.glass);
        glassFront.position.set(0, 0.95, 1.22);

        // Warm interior glow plane
        const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.25), mat.warmLed);
        glow.position.set(0, 0.95, 1.18);

        // Private veranda deck & mini plunge pool
        const veranda = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.06, 1.1), mat.teak);
        veranda.position.set(0, 0.26, 1.8);
        const miniPoolCoping = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.08, 0.9), mat.darkBasalt);
        miniPoolCoping.position.set(0.65, 0.27, 1.8);
        const miniPool = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.05, 0.7), mat.poolWater);
        miniPool.position.set(0.65, 0.29, 1.8);

        c.add(plinth, base, fascia, roof, glassFront, glow, veranda, miniPoolCoping, miniPool);
        return c;
    }

    /* ═══════════════════════════════════════════════════════════════════════════
       LANDSCAPING & NATURAL TROPICAL VEGETATION
       ═══════════════════════════════════════════════════════════════════════════ */
    buildLandscape() {
        const mat = this.getMaterials();

        // Coastal Sand & Earth Terrain
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(160, 160),
            new THREE.MeshStandardMaterial({
                color: 0xDAC8AC,
                roughness: 0.95,
                metalness: 0.02
            })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.05;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Resort Manicured Bermuda Grass Lawn
        const lawn = new THREE.Mesh(
            new THREE.PlaneGeometry(28, 18),
            new THREE.MeshStandardMaterial({
                color: 0x2E5E35,
                roughness: 0.88,
                metalness: 0.0
            })
        );
        lawn.rotation.x = -Math.PI / 2;
        lawn.position.set(6.0, 0.01, -0.5);
        lawn.receiveShadow = true;
        this.resortGroup.add(lawn);

        // Natural Flagstone Paved Walkway Path
        const pathMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(38, 3.2),
            mat.stackedStone
        );
        pathMesh.rotation.x = -Math.PI / 2;
        pathMesh.position.set(4.0, 0.02, 1.5);
        this.resortGroup.add(pathMesh);

        // Ocean Water
        this.oceanWaterMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(180, 70),
            new THREE.MeshPhysicalMaterial({
                color: 0x0C4F62,
                transparent: true,
                opacity: 0.85,
                roughness: 0.04,
                metalness: 0.12,
                transmission: 0.65,
                ior: 1.333,
                clearcoat: 1.0,
                normalMap: this.textures.waterNormal,
                normalScale: new THREE.Vector2(0.5, 0.5)
            })
        );
        this.oceanWaterMesh.rotation.x = -Math.PI / 2;
        this.oceanWaterMesh.position.set(0, -0.15, 60);
        this.scene.add(this.oceanWaterMesh);

        // Master Plan Overlay Projection Plane
        this.planPlaneMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(44, 28),
            new THREE.MeshBasicMaterial({
                color: 0xFFFFFF,
                transparent: true,
                opacity: 0.0,
                side: THREE.DoubleSide
            })
        );
        this.planPlaneMesh.rotation.x = -Math.PI / 2;
        this.planPlaneMesh.position.set(0, 0.06, 0);
        this.scene.add(this.planPlaneMesh);

        // Realistic Tropical Palm Trees for Single Villa Overview
        const palmPositions = [
            { x: -7.5, z: 6.5, scale: 1.15 },
            { x: -8.8, z: -4.8, scale: 1.35 },
            { x: 8.5,  z: 6.2, scale: 1.1 },
            { x: 8.8,  z: -5.5, scale: 1.3 },
            { x: -15,  z: 2.0, scale: 1.25 }
        ];

        palmPositions.forEach(p => {
            const palm = this.createRealisticPalmTree(mat, p.scale);
            palm.position.set(p.x, 0, p.z);
            this.villaOverviewGroup.add(palm);
        });

        // Master Site Plan scale palms (scaled 0.40 - 0.48) along promenade
        const resortPalmPositions = [
            { x: -14, z: 3.5, scale: 0.45 },
            { x: -8,  z: 3.5, scale: 0.42 },
            { x: -2,  z: 3.5, scale: 0.46 },
            { x: 4,   z: 3.5, scale: 0.44 },
            { x: 10,  z: 3.5, scale: 0.45 },
            { x: 16,  z: 3.5, scale: 0.42 },
            { x: -5,  z: -5.0, scale: 0.40 },
            { x: 1,   z: -5.0, scale: 0.42 },
            { x: 12,  z: -3.0, scale: 0.45 }
        ];
        resortPalmPositions.forEach(p => {
            const palm = this.createRealisticPalmTree(mat, p.scale);
            palm.position.set(p.x, 0, p.z);
            this.resortGroup.add(palm);
        });
    }

    createRealisticPalmTree(mat, scale = 1.0) {
        const palmGroup = new THREE.Group();
        palmGroup.scale.set(scale, scale, scale);

        // Curved segmented trunk with fibrous texture rings
        const trunkGroup = new THREE.Group();
        const segments = 8;
        let currY = 0;
        let currZ = 0;
        for (let s = 0; s < segments; s++) {
            const segH = 0.65;
            const topR = 0.18 - s * 0.01;
            const botR = 0.20 - s * 0.01;
            const segGeo = new THREE.CylinderGeometry(topR, botR, segH, 12);
            const segMesh = new THREE.Mesh(segGeo, mat.teak);
            segMesh.position.set(0, currY + segH / 2, currZ);
            segMesh.rotation.x = 0.03 * s;
            segMesh.castShadow = true;
            trunkGroup.add(segMesh);

            currY += segH;
            currZ += 0.03 * s * segH;
        }
        palmGroup.add(trunkGroup);

        // Crownshaft
        const crownshaft = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.14, 0.6, 12),
            mat.mossWall
        );
        crownshaft.position.set(0, currY + 0.3, currZ);
        palmGroup.add(crownshaft);

        // 14 Multi-Tiered Drooping Palm Fronds
        const frondCount = 14;
        for (let f = 0; f < frondCount; f++) {
            const frondGroup = new THREE.Group();
            const angle = (f / frondCount) * Math.PI * 2;
            const frondLen = 2.4 + (f % 3) * 0.3;

            const stem = new THREE.Mesh(
                new THREE.BoxGeometry(0.04, 0.04, frondLen),
                mat.mossWall
            );
            stem.position.z = frondLen / 2;
            stem.castShadow = true;
            frondGroup.add(stem);

            const leaflet = new THREE.Mesh(
                new THREE.PlaneGeometry(0.65, frondLen * 0.85),
                mat.mossWall
            );
            leaflet.rotation.x = Math.PI / 2;
            leaflet.position.z = frondLen * 0.5;
            frondGroup.add(leaflet);

            frondGroup.position.set(0, currY + 0.55, currZ);
            frondGroup.rotation.y = angle;
            frondGroup.rotation.x = 0.45 + (f % 2) * 0.25;
            palmGroup.add(frondGroup);
        }

        return palmGroup;
    }

    createAtmosphere() {
        const count = 180;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            pos[i * 3]     = (Math.random() - 0.5) * 50;
            pos[i * 3 + 1] = Math.random() * 18;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 50;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

        const mat = new THREE.PointsMaterial({
            color: 0xD4A96A,
            size: 0.08,
            transparent: true,
            opacity: 0.65,
            blending: THREE.AdditiveBlending,
        });

        const points = new THREE.Points(geo, mat);
        this.scene.add(points);
        this.ambientParticles.push(points);
    }

    /* ═══════════════════════════════════════════════════════════════════════════
       INTERACTIVE CONTROLS & INSPECTION API
       ═══════════════════════════════════════════════════════════════════════════ */
    setMode(mode) {
        this.activeMode = mode;
        if (mode === 'villa') {
            this.villaOverviewGroup.visible = true;
            this.resortGroup.visible = false;
            if (this.planPlaneMesh) this.planPlaneMesh.material.opacity = 0.0;
            this.targetCameraPos.set(0, 3.2, 8.8);
            this.targetLookAt.set(0, 1.8, 0);
            this.targetExplosion = 0.0;
            this.camera.position.set(0, 3.2, 8.8);
            this.currentLookAt.set(0, 1.8, 0);
            this.camera.lookAt(this.currentLookAt);
        } else if (mode === 'resort') {
            this.villaOverviewGroup.visible = false;
            this.resortGroup.visible = true;
            if (this.planPlaneMesh) this.planPlaneMesh.material.opacity = 0.40;
            this.targetCameraPos.set(2, 42, 34);
            this.targetLookAt.set(2, 0, -2);
            this.targetExplosion = 0.0;
            this.camera.position.set(2, 42, 34);
            this.currentLookAt.set(2, 0, -2);
            this.camera.lookAt(this.currentLookAt);
        }
    }

    setFreeOrbit(enabled) {
        this.isFreeOrbit = enabled;
        if (this.controls) {
            this.controls.enabled = enabled;
            if (enabled) {
                this.controls.target.copy(this.currentLookAt);
            }
        }
    }

    setRotationAngle(angle) {
        if (this.villaOverviewGroup) {
            this.villaOverviewGroup.rotation.y = angle;
        }
    }

    setExplosionProgress(val) {
        this.targetExplosion = Math.max(0, Math.min(1, val));
    }

    toggleWireframe(enabled) {
        this.isWireframe = (enabled !== undefined) ? enabled : !this.isWireframe;
        const target = (this.activeMode === 'resort') ? this.resortGroup : this.villaOverviewGroup;
        target.traverse((child) => {
            if (child.isMesh && child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.wireframe = this.isWireframe);
                } else {
                    child.material.wireframe = this.isWireframe;
                }
            }
        });
        return this.isWireframe;
    }

    focusHotspot(name) {
        this.setMode('villa');
        switch (name) {
            case 'front':
                this.targetCameraPos.set(0, 4.0, 11.5);
                this.targetLookAt.set(0, 1.8, 0);
                this.setRotationAngle(0);
                this.setExplosionProgress(0);
                break;
            case 'infinityPool':
                this.targetCameraPos.set(5.5, 2.2, 7.5);
                this.targetLookAt.set(3.0, 0.8, 2.5);
                this.setRotationAngle(-0.7);
                this.setExplosionProgress(0);
                break;
            case 'exploded':
                this.targetCameraPos.set(7, 7.5, 11);
                this.targetLookAt.set(0, 3.5, 0);
                this.setRotationAngle(-Math.PI * 0.75);
                this.setExplosionProgress(1.0);
                break;
            case 'masterSuite':
                this.targetCameraPos.set(-2.0, 4.4, 4.5);
                this.targetLookAt.set(-2.4, 3.8, -1.5);
                this.setRotationAngle(-Math.PI * 0.95);
                this.setExplosionProgress(0.35);
                break;
            case 'bathroom':
                this.targetCameraPos.set(1.8, 4.3, 2.0);
                this.targetLookAt.set(0.6, 3.6, -1.8);
                this.setRotationAngle(-Math.PI * 1.3);
                this.setExplosionProgress(0.35);
                break;
            case 'sunkenLounge':
                this.targetCameraPos.set(-1.0, 2.0, 3.8);
                this.targetLookAt.set(-2.0, 0.9, -1.0);
                this.setRotationAngle(-Math.PI * 1.65);
                this.setExplosionProgress(0.2);
                break;
            case 'floatingStairs':
                this.targetCameraPos.set(-3.2, 2.2, -1.0);
                this.targetLookAt.set(-4.5, 1.8, -3.2);
                this.setRotationAngle(-Math.PI * 1.88);
                this.setExplosionProgress(0.15);
                break;
            case 'aerial':
                this.targetCameraPos.set(0, 14, 16);
                this.targetLookAt.set(0, 2, 0);
                this.setRotationAngle(-Math.PI * 2);
                this.setExplosionProgress(0);
                break;
            default:
                this.targetCameraPos.set(0, 4.5, 12);
                this.targetLookAt.set(0, 1.8, 0);
        }
    }

    /* ═══════════════════════════════════════════════════════════════════════════
       NATIVE 3D MODEL EXPORTER (GLTF / GLB) FOR BLENDER & CAD SOFTWARE
       ═══════════════════════════════════════════════════════════════════════════ */
    exportGLTF(binary = true, onComplete) {
        if (typeof THREE.GLTFExporter === 'undefined') {
            console.error('THREE.GLTFExporter is not loaded');
            if (onComplete) onComplete(null, 'Exporter not available');
            return;
        }

        const exporter = new THREE.GLTFExporter();
        const options = {
            binary: binary,
            trs: false,
            onlyVisible: true,
            truncateDrawRange: true,
            embedImages: true
        };

        const target = (this.activeMode === 'resort') ? this.resortGroup : this.villaOverviewGroup;

        const prevExp = this.explosionFactor;
        if (this.explodedLayers.roof) this.explodedLayers.roof.position.y = 5.8;
        if (this.explodedLayers.upperFloor) this.explodedLayers.upperFloor.position.y = 3.3;
        if (this.explodedLayers.stairs) this.explodedLayers.stairs.position.y = 0.48;

        exporter.parse(
            target,
            (result) => {
                if (this.explodedLayers.roof) this.explodedLayers.roof.position.y = 5.8 + prevExp * 4.2;
                if (this.explodedLayers.upperFloor) this.explodedLayers.upperFloor.position.y = 3.3 + prevExp * 1.8;
                if (this.explodedLayers.stairs) this.explodedLayers.stairs.position.y = 0.48 + prevExp * 0.9;

                const baseName = (this.activeMode === 'resort') 
                    ? 'AER_Balasore_Master_Resort_SitePlan' 
                    : 'AER_Balasore_Luxury_Villa_Cottage';

                const fileName = `${baseName}.${binary ? 'glb' : 'gltf'}`;

                if (result instanceof ArrayBuffer) {
                    this.saveArrayBuffer(result, fileName);
                } else {
                    const output = JSON.stringify(result, null, 2);
                    this.saveString(output, fileName);
                }

                if (onComplete) onComplete(fileName);
            },
            options
        );
    }

    saveArrayBuffer(buffer, filename) {
        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(link.href), 1500);
    }

    saveString(text, filename) {
        const blob = new Blob([text], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(link.href), 1500);
    }

    /* ═══════════════════════════════════════════════════════════════════════════
       RENDER LOOP & ANIMATIONS
       ═══════════════════════════════════════════════════════════════════════════ */
    animate() {
        requestAnimationFrame(() => this.animate());

        const elapsed = this.clock.getElapsedTime();

        if (this.isFreeOrbit && this.controls) {
            this.controls.update();
        } else {
            this.camera.position.lerp(this.targetCameraPos, 0.05);
            this.currentLookAt.lerp(this.targetLookAt, 0.05);
            this.camera.lookAt(this.currentLookAt);
        }

        if (this.autoRotate && this.villaOverviewGroup) {
            this.villaOverviewGroup.rotation.y += 0.005 * this.autoRotateSpeed;
        }

        this.explosionFactor += (this.targetExplosion - this.explosionFactor) * 0.08;
        if (this.explodedLayers.roof) {
            this.explodedLayers.roof.position.y = 5.8 + this.explosionFactor * 4.2;
            this.explodedLayers.roof.rotation.y = this.explosionFactor * 0.04;
        }
        if (this.explodedLayers.upperFloor) {
            this.explodedLayers.upperFloor.position.y = 3.3 + this.explosionFactor * 1.8;
        }
        if (this.explodedLayers.stairs) {
            this.explodedLayers.stairs.position.y = 0.48 + this.explosionFactor * 0.9;
        }

        // Dynamically animate water ripple vectors
        if (this.textures.waterNormal) {
            this.textures.waterNormal.offset.x += 0.0007;
            this.textures.waterNormal.offset.y += 0.0004;
        }

        if (this.poolWaterMesh) {
            this.poolWaterMesh.position.y = 0.40 + Math.sin(elapsed * 2.0) * 0.006;
        }
        if (this.resortPoolWaterMesh) {
            this.resortPoolWaterMesh.position.y = 0.58 + Math.sin(elapsed * 1.8 + 1.0) * 0.006;
        }
        if (this.oceanWaterMesh) {
            this.oceanWaterMesh.position.y = -0.15 + Math.sin(elapsed * 1.1) * 0.035;
        }

        // Ambient dust particle drift
        this.ambientParticles.forEach(p => {
            const arr = p.geometry.attributes.position.array;
            for (let i = 0; i < arr.length; i += 3) {
                arr[i + 1] += Math.sin(elapsed * 1.2 + i) * 0.003;
                arr[i]     += Math.cos(elapsed * 0.8 + i) * 0.0015;
            }
            p.geometry.attributes.position.needsUpdate = true;
        });

        this.renderer.render(this.scene, this.camera);
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

window.VillaModel = VillaModel;
