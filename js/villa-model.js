/* ═══════════════════════════════════════════════════════════════
   3D Villa Model — Three.js
   Creates a detailed villa/cottage model with materials
   matching the Pearl & Champagne aesthetic
   ═══════════════════════════════════════════════════════════════ */

class VillaModel {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.villaGroup = null;
        this.resortGroup = null;
        this.ambientParticles = [];
        this.clock = new THREE.Clock();
        this.mouseX = 0;
        this.mouseY = 0;
        this.isVisible = false;
        this.currentRotation = 0;
        this.targetCameraY = 5;
        this.targetCameraZ = 12;

        this.init();
    }

    init() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x1A2F26, 0.015);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            100
        );
        this.camera.position.set(0, 5, 14);
        this.camera.lookAt(0, 1, 0);

        // Renderer
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
        this.renderer.toneMappingExposure = 1.2;
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        // Lights
        this.setupLights();

        // Build models
        this.buildResort();

        // Ground
        this.buildGround();

        // Particles
        this.createParticles();

        // Events
        window.addEventListener('resize', () => this.onResize());
        document.addEventListener('mousemove', (e) => {
            this.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            this.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        });

        // Start render loop
        this.animate();
    }

    setupLights() {
        // Warm ambient
        const ambient = new THREE.AmbientLight(0xD4A96A, 0.4);
        this.scene.add(ambient);

        // Main directional (warm sunlight)
        const sun = new THREE.DirectionalLight(0xFFF5E6, 1.2);
        sun.position.set(8, 15, 5);
        sun.castShadow = true;
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
        sun.shadow.camera.near = 0.5;
        sun.shadow.camera.far = 50;
        sun.shadow.camera.left = -15;
        sun.shadow.camera.right = 15;
        sun.shadow.camera.top = 15;
        sun.shadow.camera.bottom = -15;
        sun.shadow.bias = -0.0001;
        this.scene.add(sun);

        // Fill light (cool)
        const fill = new THREE.DirectionalLight(0x87CEEB, 0.3);
        fill.position.set(-5, 8, -5);
        this.scene.add(fill);

        // Rim light (champagne glow)
        const rim = new THREE.PointLight(0xD4A96A, 0.6, 30);
        rim.position.set(-8, 6, 0);
        this.scene.add(rim);

        // Ground bounce
        const bounce = new THREE.HemisphereLight(0xE8DCC8, 0x2D4A3E, 0.5);
        this.scene.add(bounce);
    }

    /* ── Materials ── */
    getMaterials() {
        return {
            // Cottage walls - warm stone/brick
            wall: new THREE.MeshStandardMaterial({
                color: 0xC8BBA8,
                roughness: 0.85,
                metalness: 0.05,
                flatShading: false,
            }),

            // Roof - clay/terracotta
            roof: new THREE.MeshStandardMaterial({
                color: 0x8B7355,
                roughness: 0.7,
                metalness: 0.1,
            }),

            // Door / windows
            door: new THREE.MeshStandardMaterial({
                color: 0x5C4033,
                roughness: 0.6,
                metalness: 0.15,
            }),

            // Glass (windows)
            glass: new THREE.MeshPhysicalMaterial({
                color: 0x87CEEB,
                transparent: true,
                opacity: 0.3,
                roughness: 0.05,
                metalness: 0.1,
                transmission: 0.8,
                thickness: 0.2,
                clearcoat: 1.0,
                clearcoatRoughness: 0.1,
            }),

            // Floor / path
            ground: new THREE.MeshStandardMaterial({
                color: 0xE8DCC8,
                roughness: 0.95,
                metalness: 0.0,
            }),

            // Deck wood
            wood: new THREE.MeshStandardMaterial({
                color: 0x8B6914,
                roughness: 0.7,
                metalness: 0.1,
            }),

            // Tree trunk
            trunk: new THREE.MeshStandardMaterial({
                color: 0x5C3D2E,
                roughness: 0.9,
                metalness: 0.0,
            }),

            // Foliage
            foliage: new THREE.MeshStandardMaterial({
                color: 0x2D6B3F,
                roughness: 0.8,
                metalness: 0.0,
            }),

            // Highlight glow
            glow: new THREE.MeshStandardMaterial({
                color: 0xD4A96A,
                emissive: 0xD4A96A,
                emissiveIntensity: 0.3,
                roughness: 0.3,
                metalness: 0.5,
            }),

            // Water
            water: new THREE.MeshPhysicalMaterial({
                color: 0x1B6B8A,
                transparent: true,
                opacity: 0.5,
                roughness: 0.0,
                metalness: 0.2,
                transmission: 0.6,
            }),
        };
    }

    /* ── Build a Single Cottage ── */
    buildCottage(materials) {
        const cottage = new THREE.Group();

        // -- Base Platform --
        const baseGeo = new THREE.BoxGeometry(4.5, 0.3, 4);
        const base = new THREE.Mesh(baseGeo, materials.wood);
        base.position.y = 0.15;
        base.castShadow = true;
        base.receiveShadow = true;
        cottage.add(base);

        // -- Main Walls --
        // Front wall
        const frontWallGeo = new THREE.BoxGeometry(4.2, 3, 0.2);
        const frontWall = new THREE.Mesh(frontWallGeo, materials.wall);
        frontWall.position.set(0, 1.8, 1.8);
        frontWall.castShadow = true;
        frontWall.receiveShadow = true;
        cottage.add(frontWall);

        // Back wall
        const backWall = new THREE.Mesh(frontWallGeo, materials.wall);
        backWall.position.set(0, 1.8, -1.8);
        backWall.castShadow = true;
        backWall.receiveShadow = true;
        cottage.add(backWall);

        // Left wall
        const sideWallGeo = new THREE.BoxGeometry(0.2, 3, 3.4);
        const leftWall = new THREE.Mesh(sideWallGeo, materials.wall);
        leftWall.position.set(-2.0, 1.8, 0);
        leftWall.castShadow = true;
        leftWall.receiveShadow = true;
        cottage.add(leftWall);

        // Right wall
        const rightWall = new THREE.Mesh(sideWallGeo, materials.wall);
        rightWall.position.set(2.0, 1.8, 0);
        rightWall.castShadow = true;
        rightWall.receiveShadow = true;
        cottage.add(rightWall);

        // -- Pitched Roof (A-frame) --
        const roofShape = new THREE.Shape();
        roofShape.moveTo(-2.5, 0);
        roofShape.lineTo(0, 2.2);
        roofShape.lineTo(2.5, 0);
        roofShape.lineTo(-2.5, 0);

        const extrudeSettings = {
            depth: 4.4,
            bevelEnabled: true,
            bevelThickness: 0.05,
            bevelSize: 0.05,
            bevelSegments: 2,
        };
        const roofGeo = new THREE.ExtrudeGeometry(roofShape, extrudeSettings);
        const roof = new THREE.Mesh(roofGeo, materials.roof);
        roof.position.set(0, 3.3, -2.2);
        roof.castShadow = true;
        cottage.add(roof);

        // -- Door (front) --
        const doorGeo = new THREE.BoxGeometry(0.9, 2.0, 0.05);
        const door = new THREE.Mesh(doorGeo, materials.door);
        door.position.set(0, 1.3, 1.95);
        cottage.add(door);

        // Door frame (gold accent)
        const doorFrameGeo = new THREE.BoxGeometry(1.1, 2.2, 0.02);
        const doorFrame = new THREE.Mesh(doorFrameGeo, materials.glow);
        doorFrame.position.set(0, 1.4, 1.96);
        cottage.add(doorFrame);

        // -- Windows --
        // Front windows (flanking door)
        const windowGeo = new THREE.BoxGeometry(0.7, 0.8, 0.05);
        const windowL = new THREE.Mesh(windowGeo, materials.glass);
        windowL.position.set(-1.2, 2.0, 1.95);
        cottage.add(windowL);

        const windowR = new THREE.Mesh(windowGeo, materials.glass);
        windowR.position.set(1.2, 2.0, 1.95);
        cottage.add(windowR);

        // Window frames
        const wfGeo = new THREE.BoxGeometry(0.8, 0.9, 0.02);
        const wfL = new THREE.Mesh(wfGeo, materials.glow);
        wfL.position.set(-1.2, 2.0, 1.96);
        cottage.add(wfL);

        const wfR = new THREE.Mesh(wfGeo, materials.glow);
        wfR.position.set(1.2, 2.0, 1.96);
        cottage.add(wfR);

        // Side windows
        const sideWinGeo = new THREE.BoxGeometry(0.05, 0.7, 0.6);
        const sideWinL = new THREE.Mesh(sideWinGeo, materials.glass);
        sideWinL.position.set(-2.05, 2.0, 0);
        cottage.add(sideWinL);

        const sideWinR = new THREE.Mesh(sideWinGeo, materials.glass);
        sideWinR.position.set(2.05, 2.0, 0);
        cottage.add(sideWinR);

        // Back window
        const backWin = new THREE.Mesh(windowGeo, materials.glass);
        backWin.position.set(0, 2.0, -1.95);
        cottage.add(backWin);

        // -- Front Veranda Roof --
        const verandaGeo = new THREE.BoxGeometry(4.5, 0.08, 1.2);
        const veranda = new THREE.Mesh(verandaGeo, materials.roof);
        veranda.position.set(0, 3.0, 2.4);
        veranda.castShadow = true;
        cottage.add(veranda);

        // Veranda pillars
        const pillarGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.7, 8);
        [-1.8, 1.8].forEach(x => {
            const pillar = new THREE.Mesh(pillarGeo, materials.glow);
            pillar.position.set(x, 1.65, 2.7);
            pillar.castShadow = true;
            cottage.add(pillar);
        });

        // -- Veranda steps --
        const stepGeo = new THREE.BoxGeometry(1.6, 0.12, 0.3);
        for (let i = 0; i < 2; i++) {
            const step = new THREE.Mesh(stepGeo, materials.wood);
            step.position.set(0, 0.06 + i * 0.12, 2.6 + i * 0.3);
            step.receiveShadow = true;
            cottage.add(step);
        }

        return cottage;
    }

    /* ── Build Palm Tree ── */
    buildPalmTree(materials, height = 4) {
        const tree = new THREE.Group();

        // Trunk (curved cylinder segments)
        const trunkGeo = new THREE.CylinderGeometry(0.08, 0.15, height, 8);
        const trunk = new THREE.Mesh(trunkGeo, materials.trunk);
        trunk.position.y = height / 2;
        trunk.castShadow = true;
        tree.add(trunk);

        // Fronds
        const frondGeo = new THREE.ConeGeometry(1.5, 2.5, 4);
        for (let i = 0; i < 5; i++) {
            const frond = new THREE.Mesh(frondGeo, materials.foliage);
            const angle = (i / 5) * Math.PI * 2;
            frond.position.set(
                Math.cos(angle) * 0.5,
                height + 0.5,
                Math.sin(angle) * 0.5
            );
            frond.rotation.x = Math.PI * 0.15;
            frond.rotation.z = Math.cos(angle) * 0.4;
            frond.rotation.y = angle;
            frond.castShadow = true;
            tree.add(frond);
        }

        // Top crown
        const crownGeo = new THREE.SphereGeometry(0.8, 8, 8);
        const crown = new THREE.Mesh(crownGeo, materials.foliage);
        crown.position.y = height + 0.3;
        crown.castShadow = true;
        tree.add(crown);

        return tree;
    }

    /* ── Build Full Resort ── */
    buildResort() {
        const materials = this.getMaterials();
        this.resortGroup = new THREE.Group();

        // ── Central featured cottage (larger) ──
        this.villaGroup = this.buildCottage(materials);
        this.villaGroup.scale.set(1.1, 1.1, 1.1);
        this.villaGroup.position.set(0, 0, 0);
        this.resortGroup.add(this.villaGroup);

        // ── Row of cottages behind ──
        const cottagePositions = [
            { x: -5.5, z: -3, ry: 0.1 },
            { x: -2.5, z: -4.5, ry: 0 },
            { x: 2.5, z: -4.5, ry: 0 },
            { x: 5.5, z: -3, ry: -0.1 },
        ];

        cottagePositions.forEach(pos => {
            const c = this.buildCottage(materials);
            c.scale.set(0.75, 0.75, 0.75);
            c.position.set(pos.x, 0, pos.z);
            c.rotation.y = pos.ry;
            this.resortGroup.add(c);
        });

        // ── Second row ──
        const row2 = [
            { x: -4, z: -8, ry: 0 },
            { x: 0, z: -9, ry: 0 },
            { x: 4, z: -8, ry: 0 },
        ];
        row2.forEach(pos => {
            const c = this.buildCottage(materials);
            c.scale.set(0.65, 0.65, 0.65);
            c.position.set(pos.x, 0, pos.z);
            c.rotation.y = pos.ry;
            this.resortGroup.add(c);
        });

        // ── Palm Trees ──
        const treePositions = [
            { x: -7, z: 2, h: 4.5 },
            { x: 7, z: 1, h: 5 },
            { x: -3, z: 5, h: 3.5 },
            { x: 4, z: 6, h: 4 },
            { x: -8, z: -5, h: 5.5 },
            { x: 8, z: -4, h: 4 },
            { x: 0, z: 8, h: 3 },
            { x: -6, z: -9, h: 4.5 },
            { x: 6, z: -9, h: 5 },
        ];

        treePositions.forEach(pos => {
            const tree = this.buildPalmTree(materials, pos.h);
            tree.position.set(pos.x, 0, pos.z);
            tree.rotation.y = Math.random() * Math.PI * 2;
            this.resortGroup.add(tree);
        });

        // ── Boundary Wall ──
        const wallGeo = new THREE.BoxGeometry(0.3, 1.5, 30);
        const wallL = new THREE.Mesh(wallGeo, materials.wall);
        wallL.position.set(-10, 0.75, -5);
        wallL.receiveShadow = true;
        this.resortGroup.add(wallL);

        const wallR = new THREE.Mesh(wallGeo, materials.wall);
        wallR.position.set(10, 0.75, -5);
        wallR.receiveShadow = true;
        this.resortGroup.add(wallR);

        const wallBackGeo = new THREE.BoxGeometry(20, 1.5, 0.3);
        const wallBack = new THREE.Mesh(wallBackGeo, materials.wall);
        wallBack.position.set(0, 0.75, -12);
        wallBack.receiveShadow = true;
        this.resortGroup.add(wallBack);

        // ── Pathway (champagne accent) ──
        const pathGeo = new THREE.BoxGeometry(1.5, 0.02, 10);
        const pathMat = new THREE.MeshStandardMaterial({
            color: 0xD4A96A,
            roughness: 0.6,
            metalness: 0.2,
        });
        const path = new THREE.Mesh(pathGeo, pathMat);
        path.position.set(0, 0.01, 4);
        path.receiveShadow = true;
        this.resortGroup.add(path);

        this.scene.add(this.resortGroup);
    }

    /* ── Ground Plane ── */
    buildGround() {
        const materials = this.getMaterials();

        // Sandy ground
        const groundGeo = new THREE.PlaneGeometry(60, 60);
        const ground = new THREE.Mesh(groundGeo, materials.ground);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Beach / water far plane
        const waterGeo = new THREE.PlaneGeometry(60, 20);
        const water = new THREE.Mesh(waterGeo, materials.water);
        water.rotation.x = -Math.PI / 2;
        water.position.set(0, -0.1, 20);
        this.scene.add(water);
    }

    /* ── Floating Particles ── */
    createParticles() {
        const particleCount = 150;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 30;
            positions[i * 3 + 1] = Math.random() * 15;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: 0xD4A96A,
            size: 0.05,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
        });

        const particles = new THREE.Points(geometry, material);
        this.scene.add(particles);
        this.ambientParticles.push(particles);
    }

    /* ── Animation Methods ── */
    setRotation(angle) {
        if (this.resortGroup) {
            this.resortGroup.rotation.y = angle;
        }
    }

    setCameraPosition(y, z) {
        this.targetCameraY = y;
        this.targetCameraZ = z;
    }

    setVisibility(visible) {
        this.isVisible = visible;
    }

    /* ── Render Loop ── */
    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();
        const elapsed = this.clock.getElapsedTime();

        // Smooth camera
        this.camera.position.y += (this.targetCameraY - this.camera.position.y) * 0.03;
        this.camera.position.z += (this.targetCameraZ - this.camera.position.z) * 0.03;

        // Subtle mouse parallax
        this.camera.position.x += (this.mouseX * 0.5 - this.camera.position.x) * 0.02;

        this.camera.lookAt(0, 1.5, 0);

        // Animate particles
        this.ambientParticles.forEach(p => {
            const positions = p.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] += Math.sin(elapsed + i) * 0.002;
                positions[i] += Math.cos(elapsed * 0.5 + i) * 0.001;
            }
            p.geometry.attributes.position.needsUpdate = true;
        });

        // Subtle tree sway (palm fronds)
        if (this.resortGroup) {
            this.resortGroup.children.forEach(child => {
                if (child.children) {
                    child.children.forEach(sub => {
                        if (sub.geometry && sub.geometry.type === 'ConeGeometry') {
                            sub.rotation.z += Math.sin(elapsed * 2 + sub.position.x) * 0.0005;
                        }
                    });
                }
            });
        }

        this.renderer.render(this.scene, this.camera);
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Export
window.VillaModel = VillaModel;
