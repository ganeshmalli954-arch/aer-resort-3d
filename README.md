# 🏡 AER — Anandamayee Eco Resort (Balasore, Odisha)
### Dedicated 3D Architectural Villa Model Explorer & Cutaway Engine

> **100% Dedicated 3D Model Experience** — Pure 3D Canvas with Sleek Pearl & Champagne Glassmorphism Overlays.
> Designed by **Ashushri Creations** for Promoter **Biswajeet Ghosh**.

---

## ✨ Dedicated 3D Engine Features

1. **100% Full-Screen 3D WebGL Canvas** — No generic website clutter, marketing sections, or enquiry forms. Pure architectural 3D viewer.
2. **Scroll-Driven 360° Continuous Rotation** — Scrolling down smoothly rotates the villa through all 8 elevations and interior rooms.
3. **Exploded Architectural Cutaway** — Lifts the standing-seam zinc roof (+4.2m) and upper mezzanine floor (+1.8m) to reveal the complete interior dual-level core.
4. **Free 3D Orbit & Inspection Mode** — Toggle OrbitControls (`Space` or `O`) to freely drag, rotate at any angle, pinch/scroll zoom into fine details, or right-click pan.
5. **Architectural Inspection Cards** — Automatically updates as you rotate, displaying room titles, architectural specifications, material tags, and real Telegram reference photo thumbnails.
6. **Procedural PBR Textures (Telegram References)**:
   - 🪵 **Fluted Dark Oak**: Acoustic wall slats with recessed warm 2700K LED cove lighting.
   - 🏛️ **Calacatta Gold Marble**: Italian veined marble in the wellness spa washroom.
   - 🪵 **Eurostairs Floating Steps**: Solid dark oak treads with under-step LED channels and frameless glass balustrade.
   - 🌿 **Living Moss Wall**: Vertical preserved organic botanical green wall.
   - 🛁 **Matte-Black Soaking Tub**: Freestanding oval soaking bath with brushed champagne brass tapware.
   - 🛋️ **Sunken Living Lounge**: Step-down conversation pit with indoor Japanese courtyard tree lightwell.
   - 🏊 **Private Teak Deck & Infinity Pool**: Weathered teak solarium with cyan rippling plunge pool and twin black loungers.
7. **2.5 Acre Master Site Plan 3D Mode** — Switch to view all 15 zones (10 luxury cottages, 1,800 sqft pool, banquet hall, treehouse, mud huts, campfire pit, gate, fountain).
8. **Wireframe CAD Mesh Mode (`W`)** — Inspect polygon topology and geometry like in Blender / Rhino / 3ds Max.
9. **Dynamic Lighting Modes (`L`)**:
   - 🌅 **Golden Hour Sunset**: Warm 2700K amber lighting with soft coastal sun shadows.
   - 🌙 **Luxury Night**: Dramatic twilight with glowing warm LED cove backlighting and cyan pool water.
   - ☀️ **Studio Day**: Clean daylight architectural rendering.
10. **Native 3D Model Exporter (`G` or Export button)** — One-click download of the complete 3D model as `AER_Balasore_Luxury_Villa_Cottage.glb` directly into your browser for Blender, 3ds Max, or CAD software!
11. **Telegram References Drawer** — Inspect the original photos and multi-level architectural walkthrough video side-by-side with the 3D model.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Space` or `O` | Toggle between **Scroll Tour** and **Free 3D Orbit** |
| `E` | Toggle **Exploded Cutaway View** (Lifts Roof & Floors) |
| `W` | Toggle **Wireframe CAD Mesh** |
| `L` | Cycle **Lighting Mode** (Golden Sunset ➔ Night LEDs ➔ Studio Day) |
| `G` | **Export 3D Model (.GLB)** for Blender & 3D software |
| `R` | Reset Camera to Front Elevation |
| `Esc` | Close Drawer or Lightbox Modal |

---

## 🚀 How to Run in VS Code

### Option 1: Using Live Server Extension (Recommended)
1. Open this folder `aer-resort-3d` in **VS Code**:
   ```powershell
   code .
   ```
2. In VS Code, install the extension **"Live Server"** (by Ritwick Dey) if you haven't already.
3. In the file explorer, right-click `index.html` and click **"Open with Live Server"**.
4. The 3D model will launch automatically in your browser at `http://127.0.0.1:5500`.

### Option 2: Using the Command Line (`npm start` / `npx live-server`)
Open the terminal inside `aer-resort-3d` in VS Code (`Ctrl + ~`) and run:
```powershell
npx live-server --port=3000 --open
```
or
```powershell
npm start
```
The browser will automatically open at `http://localhost:3000`.

---

## 📁 Project Structure

```
aer-resort-3d/
├── index.html               # 100% Dedicated 3D Model Explorer Viewport
├── css/
│   └── style.css            # Pearl & Champagne Frosted Glassmorphism Styles
├── js/
│   ├── three.min.js         # Three.js 3D Library (local offline bundle)
│   ├── OrbitControls.js     # Free 3D Orbit & Zoom Controls
│   ├── GLTFExporter.js      # Raw 3D Model (.GLB/.GLTF) Exporter
│   ├── gsap.min.js          # GSAP Animation Engine
│   ├── ScrollTrigger.min.js # Scroll-driven Choreography
│   ├── villa-model.js       # 3D Villa & Master Resort Procedural Engine
│   ├── animations.js        # 360° Scroll Rotation & Inspection Controller
│   └── main.js              # Application Controller & Tool Handlers
├── assets/
│   ├── images/              # Logo & site ground photos
│   ├── plan/                # Ashushri Creations Master Layout Plan
│   └── references/          # Telegram photos & walkthrough video
└── package.json
```

---

© 2026 Anandamayee Eco Resort. Master Architectural Plan by Ashushri Creations. All rights reserved.
