# 🏡 AER — Anandamayee Eco Resort (Balasore, Odisha)
### Dedicated 3D Architectural Villa Model Explorer & Cutaway Engine

> **100% Dedicated 3D Model Experience** — Pure 3D Canvas with Sleek Pearl & Champagne Glassmorphism Overlays.
> Designed by **Ashushri Creations** for Promoter **Biswajeet Ghosh**.

---

## ✨ Dedicated 3D Architectural Engine Features

1. **Two Primary Interactive 3D Modes**:
   - **🏡 LUXURY VILLA 3D (225 sqft Cottage)**: Detailed photorealistic luxury cottage with coherent architectural design: 3D standing seam zinc roof, exposed timber rafters, slender steel columns, 2.4m teak pivot entrance door, frameless glass sliders, Eurostairs cantilevered floating oak stairs, designer kitchenette & bar with Calacatta Gold waterfall countertop and induction hob, sunken living lounge with biophilic lightwell courtyard tree and OLED display, master bedroom suite with acoustic fluted oak cove lighting, and Italian Calacatta spa bath with freestanding soaking tub and preserved moss wall.
   - **🗺️ MASTER SITE PLAN 3D (2.5 Acres, Ashushri Creations)**: Complete 3D visualization with actual 3D terrain grading, asphalt entry boulevard with granite curbs, central turning circle around a 3-tiered fountain, 6 guest parking stalls, flagstone pedestrian promenade with curbs, contoured Bermuda lawns, perimeter privacy landscape berms, raised planting beds with shrubs, 10 private luxury cottages with plunge pools, 1,800 sqft lagoon pool with sun loungers and cabana umbrellas, 2,000 sqft double-height Grand Banquet Hall, kitchen & restaurant dining pergola, elevated eco treehouse on 4.5m timber stilts, and 4 authentic thatched mud huts.
2. **Species-Specific 3D Vegetation & Natural Wind Animation**:
   - Multi-tiered coconut palms with ringed trunks, crownshafts, coconut clusters, and drooping pinnate fronds.
   - Broadleaf banana plants with arching paddle leaves.
   - Sculptural frangipani trees with cream/yellow blossoms.
   - Manicured boxwood hedges and flowering hibiscus shrubs.
   - Harmonic wind sway simulation continuously rustling foliage in the coastal breeze.
3. **Physically Accurate Water Simulation & PBR Shading**:
   - Dynamic multi-frequency normal map animation with crystal clear physical transmission, IOR 1.333, and cyan underwater gradient.
   - Realistic recessed hollow plunge pools and central lagoon pool with underwater mosaic tiling and glowing LED fixtures.
4. **Architectural Inspection System**:
   - Left Navigation Dock with direct room/viewpoint jumping for the Villa mode and facility inspection for the Master Resort mode.
   - Live architectural inspection cards with dimensions, volumetric clearances, finishes, and water specifications.
   - Continuous Cutaway Roof Lift slider (0% to 100%) revealing the dual-level interior volume.
5. **Interactive CAD & Lighting Suite**:
   - Free 3D Orbit, Zoom & Pan via OrbitControls.
   - Dynamic lighting cycle (`L`): Golden Hour Sunset, Luxury Night with Cove LEDs, and Studio Daylight.
   - Wireframe CAD Mesh toggle (`W`) for topology inspection.
   - Native binary .GLB exporter (`G`) for 3D export to Blender, Rhino, or 3ds Max.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `M` | Switch between **Luxury Villa 3D** & **Master Site Plan 3D** |
| `E` | Toggle **Exploded Cutaway View** (Lifts Roof & Mezzanine) |
| `W` | Toggle **Wireframe CAD Mesh** |
| `L` | Cycle **Lighting Atmosphere** (Golden Sunset ➔ Luxury Night ➔ Studio Day) |
| `A` | Toggle **Auto-Rotate 360°** |
| `R` | **Reset Camera** to Default Architectural View |
| `G` | **Export 3D Model (.GLB)** for Blender / 3ds Max |
| `1` – `8` | Direct jump to **Villa Viewpoint 1 to 8** |

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
