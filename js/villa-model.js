/* ═══════════════════════════════════════════════════════════════════════════════
   AER — Anandamayee Eco Resort (Balasore, Odisha)
   Advanced 3D Biomimetic Villa & Resort Architectural Engine
   
   Features:
   - Full Master Resort Layout (Balasore Site Plan: 10 Cottages, 1800 sqft Pool,
     Banquet Hall, Treehouse, Mud Huts, Fountain, Campfire, Lawn, etc.)
   - High-Fidelity Luxury Cottage 3D Model with Exploded Cutaway View
   - Rich Procedural & Image Textures (Fluted Oak, Calacatta Gold Marble, Teak Deck,
     Living Moss Wall, Herringbone Floor, Translucent Water)
   - Real Telegram Reference Image Texture integration
   - Interactive Hotspot Navigation & Orbit Controls
   ═══════════════════════════════════════════════════════════════════════════════ */

class VillaModel {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        
        // Root groups
        this.mainGroup = null;
        this.resortGroup = null;        // Full Master Plan
        this.villaOverviewGroup = null; // High-detail Cottage
        
        // Exploded view components of the Cottage
        this.explodedLayers = {
            roof: null,
            upperFloor: null,
            groundFloor: null,
            poolDeck: null,
            stairs: null,
            interiorWalls: null
        };
        
        // State
        this.activeMode = 'villa'; // 'villa' | 'resort' | 'exploded'
        this.explosionFactor = 0.0; // 0 (assembled) -> 1 (fully exploded)
        this.targetExplosion = 0.0;
        
        this.targetCameraPos = new THREE.Vector3(0, 4.5, 12);
        this.targetLookAt = new THREE.Vector3(0, 1.8, 0);
        this.currentLookAt = new THREE.Vector3(0, 1.8, 0);
        
        this.mouseX = 0;
        this.mouseY = 0;
        this.clock = new THREE.Clock();
        this.ambientParticles = [];
        this.fountainParticles = null;
        this.fireParticles = null;
        this.waterMesh = null;
        this.poolWaterMesh = null;
        
        // Texture cache
        this.textures = {};
        
        this.init();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x13221B, 0.012);

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            250
        );
        this.camera.position.set(0, 5, 14);

        // Canvas & Renderer
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

        // Generate procedural textures matching Telegram references
        this.generateProceduralTextures();

        // Lights
        this.setupLights();

        // Main scene tree
        this.mainGroup = new THREE.Group();
        this.scene.add(this.mainGroup);

        // Build both models
        this.buildLuxuryCottage();
        this.buildMasterResort();
        this.buildLandscape();
        this.createAtmosphere();

        // Start in villa mode (prominent detailed cottage)
        this.setMode('villa');

        // Events
        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('mousemove', (e) => {
            this.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            this.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        });

        // Start render loop
        this.animate();
    }

    /* ── Procedural PBR Textures (Inspired by Telegram references) ── */
    generateProceduralTextures() {
        // 1. Fluted Dark Wood Slats (As seen in the Master Suite & Washroom refs)
        const flutedCanvas = document.createElement('canvas');
        flutedCanvas.width = 512;
        flutedCanvas.height = 512;
        const fctx = flutedCanvas.getContext('2d');
        fctx.fillStyle = '#1e140d';
        fctx.fillRect(0, 0, 512, 512);
        
        const slatWidth = 16;
        for (let x = 0; x < 512; x += slatWidth) {
            // Wood slat highlight
            const grad = fctx.createLinearGradient(x, 0, x + slatWidth, 0);
            grad.addColorStop(0, '#150e09');
            grad.addColorStop(0.15, '#2e1f14');
            grad.addColorStop(0.5, '#4a3321');
            grad.addColorStop(0.85, '#2e1f14');
            grad.addColorStop(1, '#0e0906');
            fctx.fillStyle = grad;
            fctx.fillRect(x, 0, slatWidth - 2, 512);
            
            // Recessed groove shadow
            fctx.fillStyle = '#0a0604';
            fctx.fillRect(x + slatWidth - 2, 0, 2, 512);
        }
        this.textures.flutedWood = new THREE.CanvasTexture(flutedCanvas);
        this.textures.flutedWood.wrapS = THREE.RepeatWrapping;
        this.textures.flutedWood.wrapT = THREE.RepeatWrapping;
        this.textures.flutedWood.repeat.set(4, 2);

        // 2. Calacatta Gold Marble (As in Executive Office & Luxury Bath refs)
        const marbleCanvas = document.createElement('canvas');
        marbleCanvas.width = 1024;
        marbleCanvas.height = 1024;
        const mctx = marbleCanvas.getContext('2d');
        mctx.fillStyle = '#FAF7F2'; // Pearl base
        mctx.fillRect(0, 0, 1024, 1024);
        
        // Soft cloudy undertones
        mctx.fillStyle = 'rgba(230, 222, 210, 0.4)';
        for (let i = 0; i < 20; i++) {
            mctx.beginPath();
            mctx.arc(Math.random() * 1024, Math.random() * 1024, 150 + Math.random() * 200, 0, Math.PI * 2);
            mctx.fill();
        }
        
        // Golden & Grey veins
        const drawVein = (color, width, startX, startY) => {
            mctx.strokeStyle = color;
            mctx.lineWidth = width;
            mctx.beginPath();
            mctx.moveTo(startX, startY);
            let cx = startX, cy = startY;
            for (let step = 0; step < 12; step++) {
                cx += (Math.random() - 0.3) * 120;
                cy += 80 + Math.random() * 40;
                mctx.lineTo(cx, cy);
            }
            mctx.stroke();
        };

        for (let i = 0; i < 6; i++) {
            drawVein('rgba(196, 154, 86, 0.45)', 2.5 + Math.random() * 3, Math.random() * 800, 0); // Champagne gold
            drawVein('rgba(120, 115, 110, 0.3)', 1.5, Math.random() * 800, 0); // Subtle slate grey
        }
        this.textures.calacattaMarble = new THREE.CanvasTexture(marbleCanvas);
        this.textures.calacattaMarble.wrapS = THREE.RepeatWrapping;
        this.textures.calacattaMarble.wrapT = THREE.RepeatWrapping;

        // 3. Teak Wood Decking (Poolside & Veranda)
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
            dctx.fillStyle = '#3A2711'; // Seam line
            dctx.fillRect(0, y + plankH - 2, 512, 2);
        }
        this.textures.teakDeck = new THREE.CanvasTexture(deckCanvas);
        this.textures.teakDeck.wrapS = THREE.RepeatWrapping;
        this.textures.teakDeck.wrapT = THREE.RepeatWrapping;
        this.textures.teakDeck.repeat.set(3, 3);

        // 4. Living Moss / Vertical Green Wall
        const mossCanvas = document.createElement('canvas');
        mossCanvas.width = 256;
        mossCanvas.height = 256;
        const mossCtx = mossCanvas.getContext('2d');
        mossCtx.fillStyle = '#223B24';
        mossCtx.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 400; i++) {
            mossCtx.fillStyle = Math.random() > 0.4 ? '#4E7D3A' : '#73A842';
            mossCtx.beginPath();
            mossCtx.arc(Math.random() * 256, Math.random() * 256, 2 + Math.random() * 4, 0, Math.PI * 2);
            mossCtx.fill();
        }
        this.textures.moss = new THREE.CanvasTexture(mossCanvas);
        this.textures.moss.wrapS = THREE.RepeatWrapping;
        this.textures.moss.wrapT = THREE.RepeatWrapping;
        this.textures.moss.repeat.set(2, 4);

        // 5. Standing Seam Zinc / Slate Dark Roof
        const roofCanvas = document.createElement('canvas');
        roofCanvas.width = 512;
        roofCanvas.height = 512;
        const rctx = roofCanvas.getContext('2d');
        rctx.fillStyle = '#24282B';
        rctx.fillRect(0, 0, 512, 512);
        for (let x = 0; x < 512; x += 32) {
            rctx.fillStyle = '#1A1D1F';
            rctx.fillRect(x, 0, 3, 512);
            rctx.fillStyle = '#3A4045';
            rctx.fillRect(x + 3, 0, 1, 512);
        }
        this.textures.zincRoof = new THREE.CanvasTexture(roofCanvas);
        this.textures.zincRoof.wrapS = THREE.RepeatWrapping;
        this.textures.zincRoof.wrapT = THREE.RepeatWrapping;
        this.textures.zincRoof.repeat.set(4, 4);

        // 6. Master Plan Ashushri Image Texture
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

    /* ── Lighting Architecture ── */
    setupLights() {
        // Natural Coastal Sun (Warm Pearl/Champagne key light)
        const sun = new THREE.DirectionalLight(0xFFF4E5, 1.35);
        sun.position.set(12, 22, 10);
        sun.castShadow = true;
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
        sun.shadow.camera.near = 0.5;
        sun.shadow.camera.far = 100;
        sun.shadow.camera.left = -25;
        sun.shadow.camera.right = 25;
        sun.shadow.camera.top = 25;
        sun.shadow.camera.bottom = -25;
        sun.shadow.bias = -0.0001;
        this.scene.add(sun);

        // Sky / Ocean Ambient Fill
        const hemi = new THREE.HemisphereLight(0xEAE3D2, 0x1A2F26, 0.55);
        this.scene.add(hemi);

        // Warm Champagne Accent Glow (recessed cove lighting aesthetic)
        const warmAccent = new THREE.PointLight(0xD4A96A, 1.2, 18);
        warmAccent.position.set(0, 3.2, 0);
        this.scene.add(warmAccent);

        // Poolside turquoise water bounce light
        const poolBounce = new THREE.PointLight(0x3CD2CE, 0.8, 14);
        poolBounce.position.set(4.5, 0.8, 2.5);
        this.scene.add(poolBounce);

        // Soft moon/ocean rim light
        const rim = new THREE.DirectionalLight(0x7FB5B5, 0.4);
        rim.position.set(-15, 8, -15);
        this.scene.add(rim);
    }

    /* ── PBR Material Library ── */
    getMaterials() {
        return {
            // Fluted Dark Wood (Wall panelling & bedroom accent)
            flutedWood: new THREE.MeshStandardMaterial({
                map: this.textures.flutedWood,
                roughness: 0.55,
                metalness: 0.1,
            }),

            // Calacatta Gold Marble (Bathroom & vanity)
            marble: new THREE.MeshStandardMaterial({
                map: this.textures.calacattaMarble,
                roughness: 0.15,
                metalness: 0.1,
            }),

            // Teak Decking (Verandas, decks, stairs)
            teak: new THREE.MeshStandardMaterial({
                map: this.textures.teakDeck,
                roughness: 0.65,
                metalness: 0.05,
            }),

            // Standing Seam Architectural Roof
            zincRoof: new THREE.MeshStandardMaterial({
                map: this.textures.zincRoof,
                roughness: 0.4,
                metalness: 0.5,
                color: 0x33393E
            }),

            // Luxury Champagne Metal Trims & Mullions
            champagneMetal: new THREE.MeshStandardMaterial({
                color: 0xD4A96A,
                roughness: 0.3,
                metalness: 0.85,
            }),

            // Matte Charcoal Architecture (Frames & Cantilevers)
            charcoalMetal: new THREE.MeshStandardMaterial({
                color: 0x1F2224,
                roughness: 0.45,
                metalness: 0.6,
            }),

            // Living Green Moss Wall
            mossWall: new THREE.MeshStandardMaterial({
                map: this.textures.moss,
                roughness: 0.9,
                metalness: 0.0,
            }),

            // Structural Pearl Stone & Render
            pearlWall: new THREE.MeshStandardMaterial({
                color: 0xF2ECE1,
                roughness: 0.8,
                metalness: 0.05,
            }),

            // Frameless Ultra-Clear Glass
            glass: new THREE.MeshPhysicalMaterial({
                color: 0xD8EDF8,
                transparent: true,
                opacity: 0.28,
                roughness: 0.05,
                metalness: 0.1,
                transmission: 0.88,
                thickness: 0.35,
                clearcoat: 1.0,
                clearcoatRoughness: 0.08,
            }),

            // Warm LED Cove / Strip Light (Emissive)
            warmLed: new THREE.MeshBasicMaterial({
                color: 0xFFE0A0,
            }),

            // Cyan Swimming Pool Water
            poolWater: new THREE.MeshPhysicalMaterial({
                color: 0x18A3B8,
                transparent: true,
                opacity: 0.65,
                roughness: 0.08,
                metalness: 0.15,
                transmission: 0.75,
                ior: 1.33,
            }),

            // Freestanding Matte Black Bathtub (from ref)
            matteBlack: new THREE.MeshStandardMaterial({
                color: 0x141414,
                roughness: 0.35,
                metalness: 0.2,
            }),

            // Fabric / Velvet Bed & Sofa
            velvetChampagne: new THREE.MeshStandardMaterial({
                color: 0xC5B498,
                roughness: 0.9,
                metalness: 0.05,
            }),

            darkFabric: new THREE.MeshStandardMaterial({
                color: 0x242426,
                roughness: 0.95,
                metalness: 0.0,
            })
        };
    }

    /* ═══════════════════════════════════════════════════════════════════════════
       MODEL 1: ULTRA-LUXURY COTTAGE (Full Overview & Exploded Cutaway)
       ═══════════════════════════════════════════════════════════════════════════ */
    buildLuxuryCottage() {
        const mat = this.getMaterials();
        this.villaOverviewGroup = new THREE.Group();

        // ── LAYER 0: Ground Platform & Teak Infinity Pool Deck ──
        const poolDeckGroup = new THREE.Group();
        
        // Concrete foundation slab
        const slabGeo = new THREE.BoxGeometry(11, 0.4, 10);
        const slab = new THREE.Mesh(slabGeo, mat.pearlWall);
        slab.position.y = 0.2;
        slab.receiveShadow = true;
        poolDeckGroup.add(slab);

        // Teak wood deck
        const deckGeo = new THREE.BoxGeometry(10.8, 0.08, 9.8);
        const deck = new THREE.Mesh(deckGeo, mat.teak);
        deck.position.y = 0.44;
        deck.receiveShadow = true;
        poolDeckGroup.add(deck);

        // Private Infinity Pool
        const poolTroughGeo = new THREE.BoxGeometry(4.2, 0.9, 3.2);
        const poolInnerMat = new THREE.MeshStandardMaterial({ color: 0x0C4759, roughness: 0.2 });
        const poolTrough = new THREE.Mesh(poolTroughGeo, poolInnerMat);
        poolTrough.position.set(3.0, 0.0, 2.8);
        poolDeckGroup.add(poolTrough);

        // Pool Water surface
        const pWaterGeo = new THREE.PlaneGeometry(4.0, 3.0);
        this.poolWaterMesh = new THREE.Mesh(pWaterGeo, mat.poolWater);
        this.poolWaterMesh.rotation.x = -Math.PI / 2;
        this.poolWaterMesh.position.set(3.0, 0.42, 2.8);
        poolDeckGroup.add(this.poolWaterMesh);

        // Poolside Sun Loungers (twin modern black loungers as in Telegram ref)
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

        this.explodedLayers.poolDeck = poolDeckGroup;
        this.villaOverviewGroup.add(poolDeckGroup);

        // ── LAYER 1: Ground Floor (Sunken Lounge, Courtyard Tree, Living) ──
        const groundGroup = new THREE.Group();
        groundGroup.position.y = 0.48;

        // Exterior stone & pearl walls (L-shaped luxury layout)
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

        // Sunken Living Room Lounge (inspired by video & photos)
        const sofaGeo = new THREE.BoxGeometry(3.2, 0.45, 1.4);
        const sofa = new THREE.Mesh(sofaGeo, mat.velvetChampagne);
        sofa.position.set(-2.0, 0.3, -1.8);
        sofa.castShadow = true;
        groundGroup.add(sofa);

        // Chaise extension
        const chaise = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.45, 1.8), mat.velvetChampagne);
        chaise.position.set(-3.2, 0.3, -0.6);
        groundGroup.add(chaise);

        // Low Marble Coffee Table (Tom Ford styling as in ref)
        const coffeeTable = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.22, 0.8), mat.marble);
        coffeeTable.position.set(-1.8, 0.16, -0.6);
        coffeeTable.castShadow = true;
        groundGroup.add(coffeeTable);

        // Indoor Japanese Courtyard Garden & Tree (from Telegram ref)
        const pebbleBed = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.08, 16), mat.pearlWall);
        pebbleBed.position.set(0.6, 0.04, -1.0);
        groundGroup.add(pebbleBed);

        const treeTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 2.6, 8), mat.teak);
        treeTrunk.position.set(0.6, 1.3, -1.0);
        treeTrunk.rotation.z = -0.06;
        groundGroup.add(treeTrunk);

        // Tree foliage canopy
        for (let f = 0; f < 4; f++) {
            const leafCanopy = new THREE.Mesh(new THREE.SphereGeometry(0.45 + f * 0.1, 8, 8), mat.mossWall);
            leafCanopy.position.set(0.6 + (f % 2 - 0.5) * 0.4, 2.2 + f * 0.25, -1.0 + (f > 1 ? 0.3 : -0.2));
            groundGroup.add(leafCanopy);
        }

        // Floor-to-Ceiling Panoramic Glass Sliders (facing the pool/sea)
        const frontGlass = new THREE.Mesh(new THREE.BoxGeometry(6.5, 2.7, 0.06), mat.glass);
        frontGlass.position.set(-1.5, 1.4, 2.5);
        groundGroup.add(frontGlass);

        // Charcoal aluminium frame outlines
        const hFrame1 = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.08, 0.12), mat.charcoalMetal);
        hFrame1.position.set(-1.5, 2.75, 2.5);
        const hFrame2 = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.08, 0.12), mat.charcoalMetal);
        hFrame2.position.set(-1.5, 0.05, 2.5);
        groundGroup.add(hFrame1, hFrame2);

        this.explodedLayers.groundFloor = groundGroup;
        this.villaOverviewGroup.add(groundGroup);

        // ── LAYER 2: Floating Cantilevered Oak Staircase with Glass Railing ──
        const stairsGroup = new THREE.Group();
        stairsGroup.position.set(-4.7, 0.48, -4.2);

        const stepCount = 10;
        const stepRise = 2.8 / stepCount;
        const stepRun = 0.32;

        for (let s = 0; s < stepCount; s++) {
            const tread = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.08, 0.3), mat.teak);
            tread.position.set(0.65, s * stepRise + 0.1, s * stepRun);
            tread.castShadow = true;
            stairsGroup.add(tread);

            const stepLed = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.02, 0.02), mat.warmLed);
            stepLed.position.set(0.65, s * stepRise + 0.04, s * stepRun + 0.13);
            stairsGroup.add(stepLed);
        }

        const balustradeGeo = new THREE.BoxGeometry(0.04, 1.4, stepCount * stepRun);
        const balustrade = new THREE.Mesh(balustradeGeo, mat.glass);
        balustrade.position.set(1.32, 1.8, (stepCount * stepRun) / 2);
        stairsGroup.add(balustrade);

        const handrail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, stepCount * stepRun), mat.champagneMetal);
        handrail.position.set(1.32, 2.5, (stepCount * stepRun) / 2);
        stairsGroup.add(handrail);

        this.explodedLayers.stairs = stairsGroup;
        this.villaOverviewGroup.add(stairsGroup);

        // ── LAYER 3: First Floor (Master Bedroom Suite & Luxury Spa Washroom) ──
        const upperGroup = new THREE.Group();
        upperGroup.position.y = 3.3;

        // Mezzanine floor slab
        const upperFloorSlab = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.25, 8.8), mat.teak);
        upperFloorSlab.position.set(-1.5, 0.0, -0.1);
        upperFloorSlab.receiveShadow = true;
        upperGroup.add(upperFloorSlab);

        // King Platform Bed
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

        // Luxury Spa Bathroom Suite
        const bathGroup = new THREE.Group();
        bathGroup.position.set(0.6, 0.12, -2.2);

        const marbleWall = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.4, 0.08), mat.marble);
        marbleWall.position.set(0, 1.2, -1.8);
        bathGroup.add(marbleWall);

        const mossAccent = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.4, 0.1), mat.mossWall);
        mossAccent.position.set(1.0, 1.2, -1.78);
        bathGroup.add(mossAccent);

        const tubGeo = new THREE.CylinderGeometry(0.55, 0.45, 0.6, 24);
        tubGeo.scale(1.4, 1.0, 0.85);
        const tub = new THREE.Mesh(tubGeo, mat.matteBlack);
        tub.position.set(-0.3, 0.35, -0.6);
        bathGroup.add(tub);

        const vanity = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 0.45), mat.flutedWood);
        vanity.position.set(0.2, 0.8, -1.4);
        const basin = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.15, 16), mat.marble);
        basin.position.set(0.2, 1.02, -1.4);
        const mirror = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.02, 24), mat.warmLed);
        mirror.rotation.x = Math.PI / 2;
        mirror.position.set(0.2, 1.6, -1.74);
        bathGroup.add(vanity, basin, mirror);

        upperGroup.add(bathGroup);

        // Master Balcony Cantilever with glass railing
        const balconyGeo = new THREE.BoxGeometry(6.8, 0.15, 1.8);
        const balcony = new THREE.Mesh(balconyGeo, mat.teak);
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

        const roofSlabGeo = new THREE.BoxGeometry(8.8, 0.28, 10.4);
        const roofMain = new THREE.Mesh(roofSlabGeo, mat.zincRoof);
        roofMain.rotation.z = -0.04;
        roofMain.castShadow = true;
        roofGroup.add(roofMain);

        const soffitGeo = new THREE.BoxGeometry(8.6, 0.05, 10.2);
        const soffit = new THREE.Mesh(soffitGeo, mat.teak);
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

        // Add cottage to main scene
        this.mainGroup.add(this.villaOverviewGroup);
    }

    /* ═══════════════════════════════════════════════════════════════════════════
       MODEL 2: FULL MASTER RESORT (Biswajeet Ghosh, Balasore, Odisha)
       ═══════════════════════════════════════════════════════════════════════════ */
    buildMasterResort() {
        const mat = this.getMaterials();
        this.resortGroup = new THREE.Group();

        // ── 10 Cottages (Legend 1) Along North/West arc ──
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

        cottageCoords.forEach((pos, idx) => {
            const cottage = this.createCompactCottage(mat);
            cottage.position.set(pos.x, 0, pos.z);
            cottage.rotation.y = pos.ry;
            this.resortGroup.add(cottage);
        });

        // ── Grand Banquet Hall (Legend 3 - 2,000 sqft) ──
        const banquet = new THREE.Group();
        const banquetBase = new THREE.Mesh(new THREE.BoxGeometry(8.5, 3.2, 7.0), mat.pearlWall);
        banquetBase.position.y = 1.6;
        banquetBase.castShadow = true;
        
        const bRoofGeo = new THREE.ConeGeometry(6.2, 2.5, 4);
        const redRoofMat = new THREE.MeshStandardMaterial({ color: 0x9E2B2B, roughness: 0.65 });
        const bRoof = new THREE.Mesh(bRoofGeo, redRoofMat);
        bRoof.rotation.y = Math.PI / 4;
        bRoof.position.y = 4.4;
        bRoof.castShadow = true;
        banquet.add(banquetBase, bRoof);
        banquet.position.set(5.5, 0, -8.0);
        this.resortGroup.add(banquet);

        // ── Kitchen & Dining (Legend 2 - 525 sqft) ──
        const kitchen = new THREE.Mesh(new THREE.BoxGeometry(4.0, 2.4, 3.0), mat.pearlWall);
        kitchen.position.set(-18, 1.2, 7.5);
        const kRoof = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.4, 3.4), redRoofMat);
        kRoof.position.set(-18, 2.6, 7.5);
        this.resortGroup.add(kitchen, kRoof);

        // ── Resort Swimming Pool (Legend 8 - 1,800 sqft) ──
        const poolGroup = new THREE.Group();
        const poolBasinGeo = new THREE.CylinderGeometry(3.8, 3.4, 0.8, 32);
        poolBasinGeo.scale(1.4, 1.0, 0.9);
        const poolRimMat = new THREE.MeshStandardMaterial({ color: 0xD4C8B4, roughness: 0.5 });
        const poolBasin = new THREE.Mesh(poolBasinGeo, poolRimMat);
        poolBasin.position.y = 0.35;
        
        const poolWaterGeo = new THREE.CircleGeometry(3.6, 32);
        poolWaterGeo.scale(1.4, 0.9);
        const poolWater = new THREE.Mesh(poolWaterGeo, mat.poolWater);
        poolWater.rotation.x = -Math.PI / 2;
        poolWater.position.y = 0.72;
        poolGroup.add(poolBasin, poolWater);
        poolGroup.position.set(-11, 0, -2.5);
        this.resortGroup.add(poolGroup);

        // ── Entrance Water Fountain (Legend 15 - central roundabout) ──
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

        // ── Camp Fire & Open Lounge (Legend 7) ──
        const campFire = new THREE.Group();
        const firePit = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 0.4, 16), mat.charcoalMetal);
        firePit.position.y = 0.2;
        const embers = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), mat.warmLed);
        embers.position.y = 0.4;
        const benchGeo = new THREE.RingGeometry(1.8, 2.5, 24);
        const bench = new THREE.Mesh(benchGeo, mat.pearlWall);
        bench.rotation.x = -Math.PI / 2;
        bench.position.y = 0.35;
        campFire.add(firePit, embers, bench);
        campFire.position.set(-8.5, 0, 7.5);
        this.resortGroup.add(campFire);

        // ── Tree House (Legend 12) ──
        const treehouse = new THREE.Group();
        const trunkGeo = new THREE.CylinderGeometry(0.35, 0.5, 5.0, 8);
        const trunk = new THREE.Mesh(trunkGeo, mat.teak);
        trunk.position.y = 2.5;
        const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.8, 2.2), mat.flutedWood);
        cabin.position.y = 4.2;
        const thRoof = new THREE.Mesh(new THREE.ConeGeometry(1.8, 1.4, 4), redRoofMat);
        thRoof.rotation.y = Math.PI / 4;
        thRoof.position.y = 5.8;
        treehouse.add(trunk, cabin, thRoof);
        treehouse.position.set(2.5, 0, 3.5);
        this.resortGroup.add(treehouse);

        // ── Open Stage (Legend 13) ──
        const stage = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.6, 2.8), mat.teak);
        stage.position.set(5.5, 0.3, 7.5);
        this.resortGroup.add(stage);

        // ── Mud Houses (Legend 14 - 4 Units) ──
        for (let m = 0; m < 4; m++) {
            const mudHut = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.3, 1.6, 16), mat.pearlWall);
            mudHut.position.set(9.0 + m * 2.2, 0.8, 6.5 + m * 0.4);
            const hutRoof = new THREE.Mesh(new THREE.ConeGeometry(1.6, 1.2, 16), mat.teak);
            hutRoof.position.set(9.0 + m * 2.2, 2.2, 6.5 + m * 0.4);
            this.resortGroup.add(mudHut, hutRoof);
        }

        // ── Badminton Court (Legend 9) ──
        const court = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 6.0), new THREE.MeshStandardMaterial({ color: 0x3A6F54 }));
        court.rotation.x = -Math.PI / 2;
        court.position.set(-21, 0.02, -5.5);
        this.resortGroup.add(court);

        // ── Grand Entrance Gate (Legend 10) ──
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
        const mat = this.getMaterials();

        const groundGeo = new THREE.PlaneGeometry(120, 120);
        const groundMat = new THREE.MeshStandardMaterial({
            color: 0xE4D3B8,
            roughness: 0.95,
        });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.05;
        ground.receiveShadow = true;
        this.scene.add(ground);

        const lawnGeo = new THREE.PlaneGeometry(24, 16);
        const lawnMat = new THREE.MeshStandardMaterial({
            color: 0x3D7344,
            roughness: 0.85,
        });
        const lawn = new THREE.Mesh(lawnGeo, lawnMat);
        lawn.rotation.x = -Math.PI / 2;
        lawn.position.set(6.0, 0.01, -0.5);
        lawn.receiveShadow = true;
        this.resortGroup.add(lawn);

        const roadGeo = new THREE.PlaneGeometry(26, 4.2);
        const roadMat = new THREE.MeshStandardMaterial({
            color: 0xC9B99E,
            roughness: 0.75,
        });
        const road = new THREE.Mesh(roadGeo, roadMat);
        road.rotation.x = -Math.PI / 2;
        road.position.set(11.0, 0.02, 2.0);
        this.resortGroup.add(road);

        const oceanGeo = new THREE.PlaneGeometry(140, 50);
        const oceanMat = new THREE.MeshPhysicalMaterial({
            color: 0x0E5468,
            transparent: true,
            opacity: 0.8,
            roughness: 0.05,
            metalness: 0.2,
        });
        this.waterMesh = new THREE.Mesh(oceanGeo, oceanMat);
        this.waterMesh.rotation.x = -Math.PI / 2;
        this.waterMesh.position.set(0, -0.15, 55);
        this.scene.add(this.waterMesh);

        const planGeo = new THREE.PlaneGeometry(42, 26);
        const planMat = new THREE.MeshBasicMaterial({
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.0,
            side: THREE.DoubleSide
        });
        this.planPlaneMesh = new THREE.Mesh(planGeo, planMat);
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
        } else if (mode === 'exploded') {
            this.villaOverviewGroup.visible = true;
            this.resortGroup.visible = false;
            if (this.planPlaneMesh) this.planPlaneMesh.material.opacity = 0.0;
            this.targetCameraPos.set(7, 7.5, 11);
            this.targetLookAt.set(0, 3.5, 0);
            this.targetExplosion = 1.0;
        }
    }

    setExplosionProgress(val) {
        this.targetExplosion = Math.max(0, Math.min(1, val));
    }

    focusHotspot(name) {
        this.setMode('villa');
        switch (name) {
            case 'masterSuite':
                this.targetCameraPos.set(-2.0, 4.4, 4.5);
                this.targetLookAt.set(-2.4, 3.8, -1.5);
                break;
            case 'bathroom':
                this.targetCameraPos.set(1.5, 4.2, 1.5);
                this.targetLookAt.set(0.6, 3.6, -1.8);
                break;
            case 'sunkenLounge':
                this.targetCameraPos.set(-1.0, 1.8, 3.5);
                this.targetLookAt.set(-2.0, 0.8, -1.0);
                break;
            case 'floatingStairs':
                this.targetCameraPos.set(-3.2, 2.2, -1.0);
                this.targetLookAt.set(-4.5, 1.8, -3.2);
                break;
            case 'infinityPool':
                this.targetCameraPos.set(5.5, 1.8, 6.5);
                this.targetLookAt.set(3.0, 0.5, 2.5);
                break;
            default:
                this.targetCameraPos.set(0, 4.5, 12);
                this.targetLookAt.set(0, 1.8, 0);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const elapsed = this.clock.getElapsedTime();

        this.camera.position.lerp(this.targetCameraPos, 0.04);
        this.currentLookAt.lerp(this.targetLookAt, 0.04);
        
        const parallaxX = this.mouseX * 0.4;
        const parallaxY = this.mouseY * 0.25;
        this.camera.lookAt(
            this.currentLookAt.x + parallaxX,
            this.currentLookAt.y - parallaxY,
            this.currentLookAt.z
        );

        this.explosionFactor += (this.targetExplosion - this.explosionFactor) * 0.06;
        if (this.explodedLayers.roof) {
            this.explodedLayers.roof.position.y = 5.8 + this.explosionFactor * 4.2;
            this.explodedLayers.roof.rotation.y = this.explosionFactor * 0.05;
        }
        if (this.explodedLayers.upperFloor) {
            this.explodedLayers.upperFloor.position.y = 3.3 + this.explosionFactor * 1.8;
        }
        if (this.explodedLayers.stairs) {
            this.explodedLayers.stairs.position.y = 0.48 + this.explosionFactor * 0.9;
        }

        if (this.poolWaterMesh) {
            this.poolWaterMesh.position.y = 0.42 + Math.sin(elapsed * 2.2) * 0.015;
        }
        if (this.waterMesh) {
            this.waterMesh.position.y = -0.15 + Math.sin(elapsed * 1.2) * 0.04;
        }

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
