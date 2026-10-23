/* ═══════════════════════════════════════════════════════════════════════════════
   AER — Anandamayee Eco Resort (Balasore, Odisha)
   Dedicated 3D Architectural Model Engine & Interactive Explorer

   Features:
   - High-Fidelity 3D Luxury Villa Cottage (Dual-level mezzanine, 225 sqft footprint)
   - Procedural PBR Textures matching Telegram references:
     * Fluted Dark Oak acoustic wall slats
     * Calacatta Gold veined Italian marble
     * Weathered Teak solarium decking
     * Preserved Living Moss wellness wall
     * Architectural standing-seam zinc roof
     * Cyan translucent ripple pool water
   - Eurostairs cantilevered floating oak stairs with under-tread LED strips
   - Japanese indoor courtyard garden with central bonsai tree
   - Freestanding matte black soaking tub with brushed brass tapware
   - Exploded Architectural Cutaway (roof and upper mezzanine lifting)
   - Full 2.5 Acre Master Plan (Ashushri Creations, Balasore: 10 Cottages, 1800 sqft pool,
     banquet hall, treehouse, mud huts, campfire pit, entrance gate, fountain)
   - Three.js OrbitControls for free 3D inspection (drag to rotate, wheel to zoom)
   - Wireframe CAD mode toggle
   - Studio, Golden Hour & Luxury Night lighting modes with warm LED cove illumination
   - Native GLTF / GLB 3D Model Exporter for Blender, 3ds Max, & CAD software
   ═══════════════════════════════════════════════════════════════════════════════ */

class VillaModel {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;

        // Scene Groups
        this.mainGroup = null;
        this.resortGroup = null;        // Master Site Plan
        this.villaOverviewGroup = null; // Detailed Cottage Model

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
        this.oceanWaterMesh = null;
        this.planPlaneMesh = null;
        this.clock = new THREE.Clock();

        // Texture Cache
        this.textures = {};

        this.init();
    }

    init() {
        // 1. Scene & Atmosphere
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x181410, 0.012);

        // 2. Camera Setup
        this.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            250
        );
        this.camera.position.set(0, 5, 14);

        // 3. Canvas & WebGL Renderer
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
        this.renderer.toneMappingExposure = 1.25;
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        // 4. OrbitControls (Free 3D Inspection)
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.06;
            this.controls.maxPolarAngle = Math.PI / 2 - 0.02; // Keep above ground level
            this.controls.minDistance = 2.5;
            this.controls.maxDistance = 60;
            this.controls.target.set(0, 1.8, 0);
            this.controls.enabled = false; // Scroll tour mode by default
        }

        // 5. Generate Procedural PBR Textures
        this.generateProceduralTextures();

        // 6. Setup Lighting Architecture
        this.setupLights();

        // 7. Scene Hierarchy
        this.mainGroup = new THREE.Group();
        this.scene.add(this.mainGroup);

        // 8. Build 3D Models
        this.buildLuxuryCottage();
        this.buildMasterResort();
        this.buildLandscape();
        this.createAtmosphere();

        // Set default mode
        this.setMode('villa');
        this.setLightingMode('golden');

        // Window resize handler
        window.addEventListener('resize', () => this.onResize());

        // Start 60fps render loop
        this.animate();
    }

    /* ═══════════════════════════════════════════════════════════════════════════
       PROCEDURAL PBR TEXTURES (Synthesized from Telegram References)
       ═══════════════════════════════════════════════════════════════════════════ */
    generateProceduralTextures() {
        // 1. Fluted Dark Oak Acoustic Wood (Photos 13-05-43, 13-05-42, 13-05-59)
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
            grad.addColorStop(0.18, '#2a1b11');
            grad.addColorStop(0.5, '#48311f');
            grad.addColorStop(0.82, '#2a1b11');
            grad.addColorStop(1, '#0e0805');
            fctx.fillStyle = grad;
            fctx.fillRect(x, 0, slatWidth - 2, 512);

            // Recessed groove shadow
            fctx.fillStyle = '#080503';
            fctx.fillRect(x + slatWidth - 2, 0, 2, 512);
        }
        this.textures.flutedWood = new THREE.CanvasTexture(flutedCanvas);
        this.textures.flutedWood.wrapS = THREE.RepeatWrapping;
        this.textures.flutedWood.wrapT = THREE.RepeatWrapping;
        this.textures.flutedWood.repeat.set(4, 2);

        // 2. Calacatta Gold Marble (Photos 13-05-37, 13-05-42)
        const marbleCanvas = document.createElement('canvas');
        marbleCanvas.width = 1024;
        marbleCanvas.height = 1024;
        const mctx = marbleCanvas.getContext('2d');
        mctx.fillStyle = '#FAF7F2'; // Pearl base
        mctx.fillRect(0, 0, 1024, 1024);

        // Soft clouding
        mctx.fillStyle = 'rgba(235, 227, 216, 0.45)';
        for (let i = 0; i < 24; i++) {
            mctx.beginPath();
            mctx.arc(Math.random() * 1024, Math.random() * 1024, 140 + Math.random() * 200, 0, Math.PI * 2);
            mctx.fill();
        }

        // Golden Champagne & Slate veins
        const drawVein = (color, width, startX, startY) => {
            mctx.strokeStyle = color;
            mctx.lineWidth = width;
            mctx.beginPath();
            mctx.moveTo(startX, startY);
            let cx = startX, cy = startY;
            for (let step = 0; step < 14; step++) {
                cx += (Math.random() - 0.35) * 110;
                cy += 70 + Math.random() * 45;
                mctx.lineTo(cx, cy);
            }
            mctx.stroke();
        };

        for (let i = 0; i < 7; i++) {
            drawVein('rgba(201, 160, 92, 0.52)', 2.5 + Math.random() * 3, Math.random() * 850, 0); // Champagne Gold
            drawVein('rgba(130, 125, 120, 0.28)', 1.5, Math.random() * 850, 0); // Slate
        }
        this.textures.calacattaMarble = new THREE.CanvasTexture(marbleCanvas);
        this.textures.calacattaMarble.wrapS = THREE.RepeatWrapping;
        this.textures.calacattaMarble.wrapT = THREE.RepeatWrapping;

        // 3. Teak Wood Decking (Photos 13-05-38, 13-05-40)
        const deckCanvas = document.createElement('canvas');
        deckCanvas.width = 512;
        deckCanvas.height = 512;
        const dctx = deckCanvas.getContext('2d');
        dctx.fillStyle = '#6E4D25';
        dctx.fillRect(0, 0, 512, 512);
        const plankH = 24;
        for (let y = 0; y < 512; y += plankH) {
            dctx.fillStyle = (y % 48 === 0) ? '#7B562B' : '#6A4A24';
            dctx.fillRect(0, y, 512, plankH - 2);
            dctx.fillStyle = '#34220F';
            dctx.fillRect(0, y + plankH - 2, 512, 2);
        }
        this.textures.teakDeck = new THREE.CanvasTexture(deckCanvas);
        this.textures.teakDeck.wrapS = THREE.RepeatWrapping;
        this.textures.teakDeck.wrapT = THREE.RepeatWrapping;
        this.textures.teakDeck.repeat.set(3, 3);

        // 4. Living Moss Wellness Wall (Photo 13-05-37)
        const mossCanvas = document.createElement('canvas');
        mossCanvas.width = 256;
        mossCanvas.height = 256;
        const mossCtx = mossCanvas.getContext('2d');
        mossCtx.fillStyle = '#223B24';
        mossCtx.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 480; i++) {
            mossCtx.fillStyle = Math.random() > 0.4 ? '#4E7D3A' : '#73A842';
            mossCtx.beginPath();
            mossCtx.arc(Math.random() * 256, Math.random() * 256, 2 + Math.random() * 4, 0, Math.PI * 2);
            mossCtx.fill();
        }
        this.textures.moss = new THREE.CanvasTexture(mossCanvas);
        this.textures.moss.wrapS = THREE.RepeatWrapping;
        this.textures.moss.wrapT = THREE.RepeatWrapping;
        this.textures.moss.repeat.set(2, 4);

        // 5. Standing Seam Zinc / Dark Architectural Roof
        const roofCanvas = document.createElement('canvas');
        roofCanvas.width = 512;
        roofCanvas.height = 512;
        const rctx = roofCanvas.getContext('2d');
        rctx.fillStyle = '#222629';
        rctx.fillRect(0, 0, 512, 512);
        for (let x = 0; x < 512; x += 32) {
            rctx.fillStyle = '#171A1C';
            rctx.fillRect(x, 0, 3, 512);
            rctx.fillStyle = '#393F44';
            rctx.fillRect(x + 3, 0, 1, 512);
        }
        this.textures.zincRoof = new THREE.CanvasTexture(roofCanvas);
        this.textures.zincRoof.wrapS = THREE.RepeatWrapping;
        this.textures.zincRoof.wrapT = THREE.RepeatWrapping;
        this.textures.zincRoof.repeat.set(4, 4);

        // 6. Master Layout Plan Texture (Ashushri Creations)
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
       LIGHTING ARCHITECTURE & ATMOSPHERES
       ═══════════════════════════════════════════════════════════════════════════ */
    setupLights() {
        // Natural Sun Light
        this.sunLight = new THREE.DirectionalLight(0xFFE8D0, 1.4);
        this.sunLight.position.set(12, 22, 10);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 100;
        this.sunLight.shadow.camera.left = -20;
        this.sunLight.shadow.camera.right = 20;
        this.sunLight.shadow.camera.top = 20;
        this.sunLight.shadow.camera.bottom = -20;
        this.sunLight.shadow.bias = -0.0001;
        this.scene.add(this.sunLight);

        // Ambient Fill
        this.hemiLight = new THREE.HemisphereLight(0xF4ECE1, 0x1A2820, 0.6);
        this.scene.add(this.hemiLight);

        // Warm Champagne Cove LED Accent (2700K recessed glow)
        this.warmAccentLight = new THREE.PointLight(0xD4A96A, 1.3, 20, 1.5);
        this.warmAccentLight.position.set(0, 3.2, 0);
        this.scene.add(this.warmAccentLight);

        // Poolside Turquoise Bounce Light
        this.poolBounceLight = new THREE.PointLight(0x2BD9D0, 0.9, 14, 1.8);
        this.poolBounceLight.position.set(3.5, 0.8, 2.8);
        this.scene.add(this.poolBounceLight);

        // Moon / Ocean Rim Light
        this.rimLight = new THREE.DirectionalLight(0x7FB5B5, 0.4);
        this.rimLight.position.set(-15, 8, -15);
        this.scene.add(this.rimLight);

        this.lightObjects = {
            sun: this.sunLight,
            hemi: this.hemiLight,
            warmAccent: this.warmAccentLight,
            poolBounce: this.poolBounceLight,
            rim: this.rimLight
        };
    }

    setLightingMode(mode) {
        this.lightingMode = mode;
        if (mode === 'golden') {
            this.sunLight.color.setHex(0xFFE0B2);
            this.sunLight.intensity = 1.45;
            this.sunLight.position.set(14, 18, 12);
            this.hemiLight.color.setHex(0xFDF4E3);
            this.hemiLight.groundColor.setHex(0x281F17);
            this.hemiLight.intensity = 0.65;
            this.warmAccentLight.color.setHex(0xD4A96A);
            this.warmAccentLight.intensity = 1.4;
            this.poolBounceLight.color.setHex(0x3CD2CE);
            this.poolBounceLight.intensity = 0.85;
            this.renderer.toneMappingExposure = 1.25;
            this.scene.fog.color.setHex(0x181410);
        } else if (mode === 'night') {
            this.sunLight.color.setHex(0x243447);
            this.sunLight.intensity = 0.22;
            this.sunLight.position.set(5, 15, -10);
            this.hemiLight.color.setHex(0x0F1A24);
            this.hemiLight.groundColor.setHex(0x060B10);
            this.hemiLight.intensity = 0.35;
            this.warmAccentLight.color.setHex(0xFFA726);
            this.warmAccentLight.intensity = 2.8; // Bright warm cove illumination
            this.poolBounceLight.color.setHex(0x00E5FF);
            this.poolBounceLight.intensity = 2.2; // Glowing turquoise pool
            this.renderer.toneMappingExposure = 1.1;
            this.scene.fog.color.setHex(0x080C10);
        } else if (mode === 'studio') {
            this.sunLight.color.setHex(0xFFFFFF);
            this.sunLight.intensity = 1.5;
            this.sunLight.position.set(12, 26, 14);
            this.hemiLight.color.setHex(0xEEF2F6);
            this.hemiLight.groundColor.setHex(0x2D3748);
            this.hemiLight.intensity = 0.75;
            this.warmAccentLight.color.setHex(0xD4A96A);
            this.warmAccentLight.intensity = 0.8;
            this.poolBounceLight.color.setHex(0x26C6DA);
            this.poolBounceLight.intensity = 0.5;
            this.renderer.toneMappingExposure = 1.3;
            this.scene.fog.color.setHex(0x1A2522);
        }
    }

    /* ═══════════════════════════════════════════════════════════════════════════
       PBR MATERIAL LIBRARY
       ═══════════════════════════════════════════════════════════════════════════ */
    getMaterials() {
        return {
            flutedWood: new THREE.MeshStandardMaterial({
                map: this.textures.flutedWood,
                roughness: 0.55,
                metalness: 0.1,
            }),
            marble: new THREE.MeshStandardMaterial({
                map: this.textures.calacattaMarble,
                roughness: 0.15,
                metalness: 0.1,
            }),
            teak: new THREE.MeshStandardMaterial({
                map: this.textures.teakDeck,
                roughness: 0.65,
                metalness: 0.05,
            }),
            zincRoof: new THREE.MeshStandardMaterial({
                map: this.textures.zincRoof,
                roughness: 0.4,
                metalness: 0.5,
                color: 0x33393E
            }),
            champagneMetal: new THREE.MeshStandardMaterial({
                color: 0xD4A96A,
                roughness: 0.3,
                metalness: 0.85,
            }),
            charcoalMetal: new THREE.MeshStandardMaterial({
                color: 0x1F2224,
                roughness: 0.45,
                metalness: 0.6,
            }),
            mossWall: new THREE.MeshStandardMaterial({
                map: this.textures.moss,
                roughness: 0.9,
                metalness: 0.0,
            }),
            pearlWall: new THREE.MeshStandardMaterial({
                color: 0xF2ECE1,
                roughness: 0.8,
                metalness: 0.05,
            }),
            glass: new THREE.MeshPhysicalMaterial({
                color: 0xD8EDF8,
                transparent: true,
                opacity: 0.28,
                roughness: 0.05,
                metalness: 0.1,
                transmission: 0.88,
                clearcoat: 1.0,
                clearcoatRoughness: 0.08,
            }),
            warmLed: new THREE.MeshBasicMaterial({
                color: 0xFFE0A0,
            }),
            poolWater: new THREE.MeshPhysicalMaterial({
                color: 0x18A3B8,
                transparent: true,
                opacity: 0.65,
                roughness: 0.08,
                metalness: 0.15,
                transmission: 0.75,
                ior: 1.33,
            }),
            matteBlack: new THREE.MeshStandardMaterial({
                color: 0x141414,
                roughness: 0.35,
                metalness: 0.2,
            }),
            velvetChampagne: new THREE.MeshStandardMaterial({
                color: 0xC5B498,
                roughness: 0.9,
                metalness: 0.05,
            }),
            darkFabric: new THREE.MeshStandardMaterial({
                color: 0x242426,
                roughness: 0.95,
                metalness: 0.0,
            }),
            sheerCurtain: new THREE.MeshStandardMaterial({
                color: 0xF7F4EF,
                roughness: 0.85,
                transparent: true,
                opacity: 0.65,
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

        // ── LAYER 0: Ground Platform & Teak Infinity Pool Deck ──
        const poolDeckGroup = new THREE.Group();

        // Concrete foundation
        const slab = new THREE.Mesh(new THREE.BoxGeometry(11, 0.4, 10), mat.pearlWall);
        slab.position.y = 0.2;
        slab.receiveShadow = true;
        poolDeckGroup.add(slab);

        // Teak wood deck
        const deck = new THREE.Mesh(new THREE.BoxGeometry(10.8, 0.08, 9.8), mat.teak);
        deck.position.y = 0.44;
        deck.receiveShadow = true;
        poolDeckGroup.add(deck);

        // Deck Floating Underglow Strip
        const deckGlow = new THREE.Mesh(new THREE.BoxGeometry(10.8, 0.03, 0.03), mat.warmLed);
        deckGlow.position.set(0, 0.05, 4.9);
        poolDeckGroup.add(deckGlow);

        // Private Infinity Pool
        const poolTrough = new THREE.Mesh(
            new THREE.BoxGeometry(4.2, 0.9, 3.2),
            new THREE.MeshStandardMaterial({ color: 0x0C4759, roughness: 0.2 })
        );
        poolTrough.position.set(3.0, 0.0, 2.8);
        poolDeckGroup.add(poolTrough);

        // Pool Water surface
        this.poolWaterMesh = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 3.0), mat.poolWater);
        this.poolWaterMesh.rotation.x = -Math.PI / 2;
        this.poolWaterMesh.position.set(3.0, 0.42, 2.8);
        poolDeckGroup.add(this.poolWaterMesh);

        // Underwater Pool Spotlights
        [1.8, 3.0, 4.2].forEach(px => {
            const spot = new THREE.Mesh(
                new THREE.CylinderGeometry(0.08, 0.08, 0.03, 12),
                new THREE.MeshBasicMaterial({ color: 0x00E5FF })
            );
            spot.rotation.x = Math.PI / 2;
            spot.position.set(px, 0.15, 1.3);
            poolDeckGroup.add(spot);
        });

        // Twin Sun Loungers (Modern black loungers from Telegram ref)
        [-0.7, 0.7].forEach(offset => {
            const lounger = new THREE.Group();
            const bedPart = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.12, 2.0), mat.darkFabric);
            const headPart = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.12, 0.6), mat.darkFabric);
            headPart.position.set(0, 0.2, -0.8);
            headPart.rotation.x = -0.4;
            lounger.add(bedPart, headPart);
            lounger.position.set(3.0 + offset * 1.3, 0.55, 0.4);
            poolDeckGroup.add(lounger);
        });

        // Cocktail Table between loungers
        const sideTable = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.32, 16), mat.teak);
        sideTable.position.set(3.0, 0.62, 0.4);
        poolDeckGroup.add(sideTable);

        this.explodedLayers.poolDeck = poolDeckGroup;
        this.villaOverviewGroup.add(poolDeckGroup);

        // ── LAYER 1: Ground Floor (Sunken Lounge, Japanese Tree, Living) ──
        const groundGroup = new THREE.Group();
        groundGroup.position.y = 0.48;

        // Exterior stone & pearl walls
        const backWall = new THREE.Mesh(new THREE.BoxGeometry(7.0, 2.8, 0.25), mat.pearlWall);
        backWall.position.set(-1.5, 1.4, -4.5);
        backWall.castShadow = true;
        groundGroup.add(backWall);

        const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.25, 2.8, 9.0), mat.pearlWall);
        leftWall.position.set(-5.0, 1.4, 0);
        leftWall.castShadow = true;
        groundGroup.add(leftWall);

        // Internal Fluted Wood Feature Wall
        const flutedAccent = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.7, 4.5), mat.flutedWood);
        flutedAccent.position.set(-4.85, 1.4, -2.0);
        groundGroup.add(flutedAccent);

        // Warm LED linear cove light behind fluted wall
        const ledStrip = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 4.5), mat.warmLed);
        ledStrip.position.set(-4.8, 2.75, -2.0);
        groundGroup.add(ledStrip);

        // Ceiling Recessed Downlights
        for (let i = -3.8; i <= 0.2; i += 1.3) {
            const spotGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 12), mat.warmLed);
            spotGlow.position.set(i, 2.78, 0);
            groundGroup.add(spotGlow);
        }

        // Sunken Living Room Lounge (Telegram video & photos)
        const sofa = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.45, 1.4), mat.velvetChampagne);
        sofa.position.set(-2.0, 0.3, -1.8);
        sofa.castShadow = true;
        groundGroup.add(sofa);

        const chaise = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.45, 1.8), mat.velvetChampagne);
        chaise.position.set(-3.2, 0.3, -0.6);
        groundGroup.add(chaise);

        // Low Honed Calacatta Marble Coffee Table
        const coffeeTable = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.22, 0.8), mat.marble);
        coffeeTable.position.set(-1.8, 0.16, -0.6);
        coffeeTable.castShadow = true;
        groundGroup.add(coffeeTable);

        // Indoor Japanese Courtyard Garden & Tree (Telegram ref photo 13-05-50)
        const pebbleBed = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.08, 16), mat.pearlWall);
        pebbleBed.position.set(0.6, 0.04, -1.0);
        groundGroup.add(pebbleBed);

        const treeTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 2.6, 8), mat.teak);
        treeTrunk.position.set(0.6, 1.3, -1.0);
        treeTrunk.rotation.z = -0.06;
        groundGroup.add(treeTrunk);

        // Tree foliage canopy
        for (let f = 0; f < 5; f++) {
            const leafCanopy = new THREE.Mesh(new THREE.SphereGeometry(0.42 + f * 0.08, 8, 8), mat.mossWall);
            leafCanopy.position.set(0.6 + (f % 2 - 0.5) * 0.38, 2.2 + f * 0.22, -1.0 + (f > 1 ? 0.28 : -0.2));
            groundGroup.add(leafCanopy);
        }

        // Floor-to-Ceiling Panoramic Glass Sliders
        const frontGlass = new THREE.Mesh(new THREE.BoxGeometry(6.5, 2.7, 0.06), mat.glass);
        frontGlass.position.set(-1.5, 1.4, 2.5);
        groundGroup.add(frontGlass);

        // Sheer pearl curtains
        [-4.5, 1.5].forEach(cx => {
            const curtain = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.65, 0.2), mat.sheerCurtain);
            curtain.position.set(cx, 1.38, 2.4);
            groundGroup.add(curtain);
        });

        // Charcoal aluminium frame mullions
        const hFrame1 = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.08, 0.12), mat.charcoalMetal);
        hFrame1.position.set(-1.5, 2.75, 2.5);
        const hFrame2 = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.08, 0.12), mat.charcoalMetal);
        hFrame2.position.set(-1.5, 0.05, 2.5);
        groundGroup.add(hFrame1, hFrame2);

        this.explodedLayers.groundFloor = groundGroup;
        this.villaOverviewGroup.add(groundGroup);

        // ── LAYER 2: Eurostairs Cantilevered Floating Staircase ──
        // (Solid dark oak floating treads, under-step LED strips, frameless glass balustrade)
        const stairsGroup = new THREE.Group();
        stairsGroup.position.set(-4.7, 0.48, -4.2);

        const stepCount = 10;
        const stepRise = 2.8 / stepCount;
        const stepRun = 0.32;

        for (let s = 0; s < stepCount; s++) {
            // Solid oak tread
            const tread = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.08, 0.3), mat.teak);
            tread.position.set(0.65, s * stepRise + 0.1, s * stepRun);
            tread.castShadow = true;
            stairsGroup.add(tread);

            // Step-by-step under-tread LED light strip
            const stepLed = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.02, 0.02), mat.warmLed);
            stepLed.position.set(0.65, s * stepRise + 0.04, s * stepRun + 0.13);
            stairsGroup.add(stepLed);
        }

        // Structural frameless glass balustrade
        const balustrade = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.4, stepCount * stepRun), mat.glass);
        balustrade.position.set(1.32, 1.8, (stepCount * stepRun) / 2);
        stairsGroup.add(balustrade);

        // Champagne metal handrail cap
        const handrail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, stepCount * stepRun), mat.champagneMetal);
        handrail.position.set(1.32, 2.5, (stepCount * stepRun) / 2);
        stairsGroup.add(handrail);

        this.explodedLayers.stairs = stairsGroup;
        this.villaOverviewGroup.add(stairsGroup);

        // ── LAYER 3: First Floor Mezzanine (Master Suite & Spa Washroom) ──
        const upperGroup = new THREE.Group();
        upperGroup.position.y = 3.3;

        // Mezzanine floor slab
        const upperFloorSlab = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.25, 8.8), mat.teak);
        upperFloorSlab.position.set(-1.5, 0.0, -0.1);
        upperFloorSlab.receiveShadow = true;
        upperGroup.add(upperFloorSlab);

        // Low Japanese Platform King Bed
        const bedBase = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.25, 2.6), mat.flutedWood);
        bedBase.position.set(-2.4, 0.25, -1.8);
        const mattress = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.35, 2.2), mat.velvetChampagne);
        mattress.position.set(-2.4, 0.55, -1.7);
        const headboard = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.2, 3.2), mat.flutedWood);
        headboard.position.set(-4.95, 1.1, -1.8);
        upperGroup.add(bedBase, mattress, headboard);

        // Master Suite Bedroom Cove Warm Lighting
        const bedLed = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 3.2), mat.warmLed);
        bedLed.position.set(-4.9, 2.2, -1.8);
        upperGroup.add(bedLed);

        // Bedside Nightstands & Drop Sconces
        [-3.8, -1.0].forEach(bx => {
            const nightstand = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.2, 0.45), mat.flutedWood);
            nightstand.position.set(bx, 0.25, -2.5);
            const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 1.2, 8), mat.charcoalMetal);
            cord.position.set(bx, 1.8, -2.5);
            const globe = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), mat.warmLed);
            globe.position.set(bx, 1.2, -2.5);
            upperGroup.add(nightstand, cord, globe);
        });

        // Luxury Spa Bathroom Suite (Calacatta marble & living moss wall)
        const bathGroup = new THREE.Group();
        bathGroup.position.set(0.6, 0.12, -2.2);

        const marbleWall = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.4, 0.08), mat.marble);
        marbleWall.position.set(0, 1.2, -1.8);
        bathGroup.add(marbleWall);

        const mossAccent = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.4, 0.1), mat.mossWall);
        mossAccent.position.set(1.0, 1.2, -1.78);
        bathGroup.add(mossAccent);

        // Freestanding Matte Black Soaking Tub
        const tubGeo = new THREE.CylinderGeometry(0.55, 0.45, 0.6, 24);
        tubGeo.scale(1.4, 1.0, 0.85);
        const tub = new THREE.Mesh(tubGeo, mat.matteBlack);
        tub.position.set(-0.3, 0.35, -0.6);
        bathGroup.add(tub);

        // Floor-Mounted Champagne Brass Tub Mixer / Faucet
        const standPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.85, 12), mat.champagneMetal);
        standPipe.position.set(0.25, 0.42, -0.6);
        const spout = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.03, 0.03), mat.champagneMetal);
        spout.position.set(0.18, 0.85, -0.6);
        bathGroup.add(standPipe, spout);

        // Fluted Wood Vanity & Marble Vessel Basin
        const vanity = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 0.45), mat.flutedWood);
        vanity.position.set(0.2, 0.8, -1.4);
        const basin = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.15, 16), mat.marble);
        basin.position.set(0.2, 1.02, -1.4);

        // Backlit Circular Vanity Mirror
        const mirror = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.02, 24), mat.warmLed);
        mirror.rotation.x = Math.PI / 2;
        mirror.position.set(0.2, 1.6, -1.74);
        bathGroup.add(vanity, basin, mirror);

        upperGroup.add(bathGroup);

        // Master Balcony Cantilever with glass railing
        const balcony = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.15, 1.8), mat.teak);
        balcony.position.set(-1.5, 0.0, 3.4);
        upperGroup.add(balcony);

        const balcGlass = new THREE.Mesh(new THREE.BoxGeometry(6.8, 1.1, 0.04), mat.glass);
        balcGlass.position.set(-1.5, 0.6, 4.2);
        upperGroup.add(balcGlass);

        this.explodedLayers.upperFloor = upperGroup;
        this.villaOverviewGroup.add(upperGroup);

        // ── LAYER 4: Cantilevered Architectural Roof (Lifts up in Exploded View) ──
        const roofGroup = new THREE.Group();
        roofGroup.position.y = 5.8;

        const roofMain = new THREE.Mesh(new THREE.BoxGeometry(8.8, 0.28, 10.4), mat.zincRoof);
        roofMain.rotation.z = -0.04;
        roofMain.castShadow = true;
        roofGroup.add(roofMain);

        const soffit = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.05, 10.2), mat.teak);
        soffit.position.y = -0.16;
        roofGroup.add(soffit);

        const fasciaFront = new THREE.Mesh(new THREE.BoxGeometry(8.9, 0.32, 0.08), mat.champagneMetal);
        fasciaFront.position.set(0, 0, 5.2);
        const fasciaSide = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.32, 10.4), mat.champagneMetal);
        fasciaSide.position.set(4.4, 0, 0);
        roofGroup.add(fasciaFront, fasciaSide);

        const skylight = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 3.2), mat.glass);
        skylight.position.set(0.6, 0.16, -1.0);
        roofGroup.add(skylight);

        this.explodedLayers.roof = roofGroup;
        this.villaOverviewGroup.add(roofGroup);

        // Attach to main scene
        this.mainGroup.add(this.villaOverviewGroup);
    }

    /* ═══════════════════════════════════════════════════════════════════════════
       MODEL 2: FULL 2.5 ACRE MASTER RESORT (Ashushri Creations, Balasore)
       ═══════════════════════════════════════════════════════════════════════════ */
    buildMasterResort() {
        const mat = this.getMaterials();
        this.resortGroup = new THREE.Group();

        // 10 Cottages (Legend 1)
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
        const banquetBase = new THREE.Mesh(new THREE.BoxGeometry(8.5, 3.2, 7.0), mat.pearlWall);
        banquetBase.position.y = 1.6;
        banquetBase.castShadow = true;
        const redRoofMat = new THREE.MeshStandardMaterial({ color: 0x9E2B2B, roughness: 0.65 });
        const bRoof = new THREE.Mesh(new THREE.ConeGeometry(6.2, 2.5, 4), redRoofMat);
        bRoof.rotation.y = Math.PI / 4;
        bRoof.position.y = 4.4;
        bRoof.castShadow = true;
        banquet.add(banquetBase, bRoof);
        banquet.position.set(5.5, 0, -8.0);
        this.resortGroup.add(banquet);

        // Kitchen & Dining (Legend 2 - 525 sqft)
        const kitchen = new THREE.Mesh(new THREE.BoxGeometry(4.0, 2.4, 3.0), mat.pearlWall);
        kitchen.position.set(-18, 1.2, 7.5);
        const kRoof = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.4, 3.4), redRoofMat);
        kRoof.position.set(-18, 2.6, 7.5);
        this.resortGroup.add(kitchen, kRoof);

        // Resort Swimming Pool (Legend 8 - 1,800 sqft)
        const poolGroup = new THREE.Group();
        const poolBasinGeo = new THREE.CylinderGeometry(3.8, 3.4, 0.8, 32);
        poolBasinGeo.scale(1.4, 1.0, 0.9);
        const poolBasin = new THREE.Mesh(poolBasinGeo, new THREE.MeshStandardMaterial({ color: 0xD4C8B4, roughness: 0.5 }));
        poolBasin.position.y = 0.35;
        const poolWaterGeo = new THREE.CircleGeometry(3.6, 32);
        poolWaterGeo.scale(1.4, 0.9);
        const poolWater = new THREE.Mesh(poolWaterGeo, mat.poolWater);
        poolWater.rotation.x = -Math.PI / 2;
        poolWater.position.y = 0.72;
        poolGroup.add(poolBasin, poolWater);
        poolGroup.position.set(-11, 0, -2.5);
        this.resortGroup.add(poolGroup);

        // Central Water Fountain (Legend 15)
        const fountain = new THREE.Group();
        const fBasin = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.2, 0.5, 24), mat.pearlWall);
        fBasin.position.y = 0.25;
        const fTier2 = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.1, 0.4, 24), mat.pearlWall);
        fTier2.position.y = 0.7;
        const fCenter = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.4, 16), mat.champagneMetal);
        fCenter.position.y = 1.0;
        fountain.add(fBasin, fTier2, fCenter);
        fountain.position.set(13.5, 0, 2.0);
        this.resortGroup.add(fountain);

        // Camp Fire Pit & Open Lounge (Legend 7)
        const campFire = new THREE.Group();
        const firePit = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 0.4, 16), mat.charcoalMetal);
        firePit.position.y = 0.2;
        const embers = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), mat.warmLed);
        embers.position.y = 0.4;
        const bench = new THREE.Mesh(new THREE.RingGeometry(1.8, 2.5, 24), mat.pearlWall);
        bench.rotation.x = -Math.PI / 2;
        bench.position.y = 0.35;
        campFire.add(firePit, embers, bench);
        campFire.position.set(-8.5, 0, 7.5);
        this.resortGroup.add(campFire);

        // Tree House (Legend 12)
        const treehouse = new THREE.Group();
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 5.0, 8), mat.teak);
        trunk.position.y = 2.5;
        const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.8, 2.2), mat.flutedWood);
        cabin.position.y = 4.2;
        const thRoof = new THREE.Mesh(new THREE.ConeGeometry(1.8, 1.4, 4), redRoofMat);
        thRoof.rotation.y = Math.PI / 4;
        thRoof.position.y = 5.8;
        treehouse.add(trunk, cabin, thRoof);
        treehouse.position.set(2.5, 0, 3.5);
        this.resortGroup.add(treehouse);

        // Mud House Cabins (Legend 14 - 4 Units)
        for (let m = 0; m < 4; m++) {
            const mudHut = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.3, 1.6, 16), mat.pearlWall);
            mudHut.position.set(9.0 + m * 2.2, 0.8, 6.5 + m * 0.4);
            const hutRoof = new THREE.Mesh(new THREE.ConeGeometry(1.6, 1.2, 16), mat.teak);
            hutRoof.position.set(9.0 + m * 2.2, 2.2, 6.5 + m * 0.4);
            this.resortGroup.add(mudHut, hutRoof);
        }

        // Grand Entrance Gate (Legend 10)
        const gateGroup = new THREE.Group();
        const pillarL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 3.5, 0.8), mat.pearlWall);
        pillarL.position.set(0, 1.75, -2.5);
        const pillarR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 3.5, 0.8), mat.pearlWall);
        pillarR.position.set(0, 1.75, 2.5);
        const beam = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.6, 6.0), mat.teak);
        beam.position.set(0, 3.6, 0);
        gateGroup.add(pillarL, pillarR, beam);
        gateGroup.position.set(24.0, 0, 2.0);
        this.resortGroup.add(gateGroup);

        this.resortGroup.position.set(0, 0, 0);
        this.mainGroup.add(this.resortGroup);
    }

    createCompactCottage(mat) {
        const c = new THREE.Group();
        const base = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.8, 2.2), mat.pearlWall);
        base.position.y = 0.9;
        base.castShadow = true;
        const redRoofMat = new THREE.MeshStandardMaterial({ color: 0xA63232, roughness: 0.65 });
        const roof = new THREE.Mesh(new THREE.ConeGeometry(1.9, 1.3, 4), redRoofMat);
        roof.rotation.y = Math.PI / 4;
        roof.position.y = 2.4;
        roof.castShadow = true;
        const door = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.1, 0.05), mat.teak);
        door.position.set(0, 0.6, 1.12);
        c.add(base, roof, door);
        return c;
    }

    buildLandscape() {
        // Coastal Sand Terrain
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(120, 120),
            new THREE.MeshStandardMaterial({ color: 0xE4D3B8, roughness: 0.95 })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.05;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Resort Main Lawn
        const lawn = new THREE.Mesh(
            new THREE.PlaneGeometry(24, 16),
            new THREE.MeshStandardMaterial({ color: 0x3D7344, roughness: 0.85 })
        );
        lawn.rotation.x = -Math.PI / 2;
        lawn.position.set(6.0, 0.01, -0.5);
        lawn.receiveShadow = true;
        this.resortGroup.add(lawn);

        // Ocean Water
        this.oceanWaterMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(140, 50),
            new THREE.MeshPhysicalMaterial({
                color: 0x0E5468,
                transparent: true,
                opacity: 0.8,
                roughness: 0.05,
                metalness: 0.2,
            })
        );
        this.oceanWaterMesh.rotation.x = -Math.PI / 2;
        this.oceanWaterMesh.position.set(0, -0.15, 55);
        this.scene.add(this.oceanWaterMesh);

        // Blueprint Projection Plane
        this.planPlaneMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(42, 26),
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
    }

    createAtmosphere() {
        const count = 180;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            pos[i * 3]     = (Math.random() - 0.5) * 45;
            pos[i * 3 + 1] = Math.random() * 16;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 45;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

        const mat = new THREE.PointsMaterial({
            color: 0xD4A96A,
            size: 0.07,
            transparent: true,
            opacity: 0.7,
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
            this.targetCameraPos.set(0, 4.5, 12);
            this.targetLookAt.set(0, 1.8, 0);
            this.targetExplosion = 0.0;
        } else if (mode === 'resort') {
            this.villaOverviewGroup.visible = false;
            this.resortGroup.visible = true;
            if (this.planPlaneMesh) this.planPlaneMesh.material.opacity = 0.35;
            this.targetCameraPos.set(0, 28, 22);
            this.targetLookAt.set(0, 0, 0);
            this.targetExplosion = 0.0;
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

        // Temporarily reset explosion to guarantee clean CAD assembly
        const prevExp = this.explosionFactor;
        if (this.explodedLayers.roof) this.explodedLayers.roof.position.y = 5.8;
        if (this.explodedLayers.upperFloor) this.explodedLayers.upperFloor.position.y = 3.3;
        if (this.explodedLayers.stairs) this.explodedLayers.stairs.position.y = 0.48;

        exporter.parse(
            target,
            (result) => {
                // Restore cutaway position
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

        // If in Free Orbit mode, OrbitControls controls camera directly
        if (this.isFreeOrbit && this.controls) {
            this.controls.update();
        } else {
            // Scroll Tour mode: smoothly lerp camera position and lookAt target
            this.camera.position.lerp(this.targetCameraPos, 0.05);
            this.currentLookAt.lerp(this.targetLookAt, 0.05);
            this.camera.lookAt(this.currentLookAt);
        }

        // Auto-rotation toggle
        if (this.autoRotate && this.villaOverviewGroup) {
            this.villaOverviewGroup.rotation.y += 0.005 * this.autoRotateSpeed;
        }

        // Exploded Cutaway animation lerp
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

        // Ambient ripples in pool and ocean
        if (this.poolWaterMesh) {
            this.poolWaterMesh.position.y = 0.42 + Math.sin(elapsed * 2.2) * 0.015;
        }
        if (this.oceanWaterMesh) {
            this.oceanWaterMesh.position.y = -0.15 + Math.sin(elapsed * 1.2) * 0.04;
        }

        // Dust particle drift
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
