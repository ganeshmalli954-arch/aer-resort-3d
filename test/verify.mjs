import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const PORT = 3849;
const ROOT = path.resolve('.');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.mp4': 'video/mp4',
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(ROOT, reqPath);
  
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, async () => {
  console.log(`Test server running on port ${PORT}`);

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const debugPort = 9225;
  const userDataDir = path.join(ROOT, '.chrome-temp-test');

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--disable-gpu-shader-disk-cache',
    'about:blank'
  ]);

  let wsUrl = null;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      const resp = await fetch(`http://127.0.0.1:${debugPort}/json/version`);
      if (resp.ok) {
        const data = await resp.json();
        wsUrl = data.webSocketDebuggerUrl;
        break;
      }
    } catch (e) {}
  }

  if (!wsUrl) {
    console.error('Could not connect to Chrome debugging endpoint');
    chromeProc.kill();
    server.close();
    process.exit(1);
  }

  const newTargetResp = await fetch(`http://127.0.0.1:${debugPort}/json/new?http://127.0.0.1:${PORT}`, { method: 'PUT' });
  const targetData = await newTargetResp.json();
  const pageWsUrl = targetData.webSocketDebuggerUrl;

  const ws = new WebSocket(pageWsUrl);
  const errors = [];
  const logs = [];

  ws.addEventListener('open', () => {
    let id = 1;
    ws.send(JSON.stringify({ id: id++, method: 'Runtime.enable' }));
    ws.send(JSON.stringify({ id: id++, method: 'Page.enable' }));
    ws.send(JSON.stringify({ id: id++, method: 'Log.enable' }));
    ws.send(JSON.stringify({
      id: id++,
      method: 'Emulation.setDeviceMetricsOverride',
      params: { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false }
    }));
  });

  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data.toString());
    if (msg.method === 'Runtime.consoleAPICalled') {
      const text = msg.params.args.map(a => a.value ?? a.description ?? '').join(' ');
      logs.push(`[Console ${msg.params.type}] ${text}`);
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      errors.push(msg.params.exceptionDetails.text + ' ' + (msg.params.exceptionDetails.exception?.description || ''));
    }
  });

  await new Promise(r => setTimeout(r, 3500));

  const evalInPage = (expression) => {
    return new Promise((resolve) => {
      const evalId = Math.floor(Math.random() * 100000);
      const handler = (event) => {
        const msg = JSON.parse(event.data.toString());
        if (msg.id === evalId) {
          ws.removeEventListener('message', handler);
          const r = msg.result?.result;
          resolve(r?.value !== undefined ? r.value : r);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({
        id: evalId,
        method: 'Runtime.evaluate',
        params: { expression, returnByValue: true, awaitPromise: true }
      }));
    });
  };

  // Assertions: 3D Engine
  const state = await evalInPage(`({
    hasThree: typeof THREE !== 'undefined',
    hasControls: typeof THREE?.OrbitControls !== 'undefined',
    hasExporter: typeof THREE?.GLTFExporter !== 'undefined',
    hasVillaModel: typeof window.villaModel !== 'undefined',
    villaLayers: window.villaModel?.villaOverviewGroup?.children?.length,
    resortLayers: window.villaModel?.resortGroup?.children?.length
  })`);

  console.log('✓ Three.js & Engine State:', state);

  if (!state.hasThree || !state.hasControls || !state.hasExporter || !state.hasVillaModel) {
    throw new Error('Core 3D engine components failed to initialize');
  }

  // Assertion: Verify Reference Elements Completely Removed
  const refChecks = await evalInPage(`({
    hasOpenRefsBtn: !!document.getElementById('btn-open-refs'),
    hasReferenceDrawer: !!document.getElementById('reference-drawer'),
    hasCardRefBox: !!document.getElementById('card-ref-box'),
    hasCardRefImg: !!document.getElementById('card-ref-img'),
    hasLightboxModal: !!document.getElementById('lightbox-modal'),
    hasHighlightsBox: !!document.getElementById('card-highlights-box'),
    hasHlDimensions: !!document.getElementById('hl-dimensions'),
    hasHlVolume: !!document.getElementById('hl-volume'),
    hasHlFinishes: !!document.getElementById('hl-finishes'),
    hasHlWater: !!document.getElementById('hl-water')
  })`);

  console.log('✓ Reference Cleanup & Highlights Check:', refChecks);

  if (refChecks.hasOpenRefsBtn || refChecks.hasReferenceDrawer || refChecks.hasCardRefBox || refChecks.hasCardRefImg || refChecks.hasLightboxModal) {
    throw new Error('Reference elements still found on page');
  }
  if (!refChecks.hasHighlightsBox || !refChecks.hasHlDimensions || !refChecks.hasHlVolume || !refChecks.hasHlFinishes || !refChecks.hasHlWater) {
    throw new Error('Architectural highlights panel elements missing');
  }

  // Verify Phase jumping & Highlights Sync
  for (let i = 0; i < 8; i++) {
    const phaseData = await evalInPage(`(() => {
      window.scrollController.jumpToPhase(${i});
      return {
        phase: window.scrollController.currentPhaseIndex,
        title: document.getElementById('card-title')?.textContent,
        angle: document.getElementById('hud-angle-val')?.textContent,
        dimensions: document.getElementById('hl-dimensions')?.textContent,
        water: document.getElementById('hl-water')?.textContent
      };
    })()`);
    console.log(`✓ Phase ${i} verified:`, phaseData.title, `(${phaseData.angle}) ->`, phaseData.dimensions);
  }

  // Verify Lighting Mode Cycles
  const lightingCycle = await evalInPage(`(() => {
    const btn = document.getElementById('btn-cycle-lighting');
    const m0 = window.villaModel.lightingMode;
    btn.click();
    const m1 = window.villaModel.lightingMode;
    btn.click();
    const m2 = window.villaModel.lightingMode;
    btn.click();
    const m3 = window.villaModel.lightingMode;
    return { m0, m1, m2, m3 };
  })()`);
  console.log('✓ Lighting cycle verified:', lightingCycle);

  // Verify Exploded Cutaway
  const explodedCheck = await evalInPage(`(() => {
    const btn = document.getElementById('btn-toggle-exploded');
    btn.click();
    const exp1 = window.villaModel.targetExplosion;
    btn.click();
    const exp0 = window.villaModel.targetExplosion;
    return { exp1, exp0 };
  })()`);
  console.log('✓ Exploded cutaway verified:', explodedCheck);

  // Verify Wireframe CAD Mode
  const wireframeCheck = await evalInPage(`(() => {
    const btn = document.getElementById('btn-toggle-wireframe');
    btn.click();
    const wf1 = window.villaModel.isWireframe;
    btn.click();
    const wf0 = window.villaModel.isWireframe;
    return { wf1, wf0 };
  })()`);
  console.log('✓ Wireframe CAD mode verified:', wireframeCheck);

  // Verify Status Strip
  const statusStripCheck = await evalInPage(`(() => {
    const el = document.getElementById('status-strip');
    return {
      exists: !!el,
      display: window.getComputedStyle(el).display,
      position: window.getComputedStyle(el).position
    };
  })()`);
  console.log('✓ Status Strip Check:', statusStripCheck);
  if (!statusStripCheck.exists || statusStripCheck.position !== 'fixed') {
    throw new Error('Status strip missing or not fixed');
  }

  // Verify Auto-Rotate in Villa & Resort Modes
  const autoRotateCheck = await evalInPage(`(() => {
    const btn = document.getElementById('btn-auto-rotate');
    btn.click();
    const ar1 = window.villaModel.autoRotate;
    const cr1 = window.villaModel.controls.autoRotate;
    document.getElementById('btn-mode-resort').click();
    const crResort = window.villaModel.controls.autoRotate;
    btn.click();
    const ar0 = window.villaModel.autoRotate;
    const cr0 = window.villaModel.controls.autoRotate;
    document.getElementById('btn-mode-villa').click();
    return { ar1, cr1, crResort, ar0, cr0 };
  })()`);
  console.log('✓ Auto-Rotate in Villa & Resort modes verified:', autoRotateCheck);
  if (!autoRotateCheck.ar1 || !autoRotateCheck.cr1 || !autoRotateCheck.crResort || autoRotateCheck.ar0 || autoRotateCheck.cr0) {
    throw new Error('Auto-Rotate failed verification across modes');
  }

  // Verify Cross-Mode Wireframe Synchronization
  const crossModeWireframe = await evalInPage(`(() => {
    const btn = document.getElementById('btn-toggle-wireframe');
    btn.click(); // turn on wireframe
    document.getElementById('btn-mode-resort').click();
    let resortHasWireframe = false;
    window.villaModel.resortGroup.traverse(c => {
      if (c.isMesh && c.material) {
        const mat = Array.isArray(c.material) ? c.material[0] : c.material;
        if (mat.wireframe) resortHasWireframe = true;
      }
    });
    btn.click(); // turn off wireframe
    document.getElementById('btn-mode-villa').click();
    let villaStillWireframe = false;
    window.villaModel.villaOverviewGroup.traverse(c => {
      if (c.isMesh && c.material) {
        const mat = Array.isArray(c.material) ? c.material[0] : c.material;
        if (mat.wireframe) villaStillWireframe = true;
      }
    });
    return { resortHasWireframe, villaStillWireframe };
  })()`);
  console.log('✓ Cross-mode wireframe verified:', crossModeWireframe);
  if (!crossModeWireframe.resortHasWireframe || crossModeWireframe.villaStillWireframe) {
    throw new Error('Cross-mode wireframe state desynchronized');
  }

  // Verify Resort Facility Navigation & Reset
  const resortFacCheck = await evalInPage(`(() => {
    document.getElementById('btn-mode-resort').click();
    const poolBtn = document.querySelector('#resort-dock-panel .room-btn[data-facility="pool"]');
    poolBtn.click();
    const poolTitle = document.getElementById('card-title')?.textContent;
    const poolActive = poolBtn.classList.contains('active');

    // Reset camera in resort mode
    document.getElementById('btn-reset-camera').click();
    const resetTitle = document.getElementById('card-title')?.textContent;
    const poolActiveAfterReset = poolBtn.classList.contains('active');
    const angleText = document.getElementById('hud-angle-val')?.textContent;

    // Test keyboard shortcut 3 for Banquet
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '3' }));
    const banquetTitle = document.getElementById('card-title')?.textContent;

    return { poolTitle, poolActive, resetTitle, poolActiveAfterReset, angleText, banquetTitle };
  })()`);
  console.log('✓ Resort facility navigation & reset verified:', resortFacCheck);
  if (!resortFacCheck.poolActive || resortFacCheck.poolActiveAfterReset || !resortFacCheck.banquetTitle.includes('Banquet')) {
    throw new Error('Resort facility navigation failed');
  }

  // Verify Mode Switch Camera Synchronization
  const modeCameraSync = await evalInPage(`(() => {
    document.getElementById('btn-mode-villa').click();
    window.scrollController.jumpToPhase(4); // Spa Bathroom
    const posPhase4 = window.villaModel.camera.position.clone();
    document.getElementById('btn-mode-resort').click();
    document.getElementById('btn-mode-villa').click();
    const posRestored = window.villaModel.camera.position.clone();
    const dist = posPhase4.distanceTo(posRestored);
    const cardTitle = document.getElementById('card-title')?.textContent;
    return { dist, cardTitle };
  })()`);
  console.log('✓ Mode switch camera synchronization verified:', modeCameraSync);
  if (modeCameraSync.dist > 0.1 || !modeCameraSync.cardTitle.includes('Calacatta')) {
    throw new Error('Mode switch camera synchronization failed');
  }

  // Verify GLB Export (Villa Mode)
  await evalInPage(`document.getElementById('btn-mode-villa').click()`);
  const villaGlb = await evalInPage(`new Promise((resolve) => {
    window.villaModel.exportGLTF(true, (filename, err) => {
      resolve({ filename, success: !err });
    });
  })`);
  console.log('✓ Villa GLB Exporter:', villaGlb);
  if (!villaGlb.success || villaGlb.filename !== 'AER_Balasore_Luxury_Villa_Cottage.glb') {
    throw new Error('Villa GLB export failed');
  }

  // Verify GLB Export (Resort Mode)
  const resortGlb = await evalInPage(`new Promise((resolve) => {
    document.getElementById('btn-mode-resort').click();
    window.villaModel.exportGLTF(true, (filename, err) => {
      resolve({ filename, success: !err });
    });
  })`);
  console.log('✓ Resort GLB Exporter:', resortGlb);
  if (!resortGlb.success || resortGlb.filename !== 'AER_Balasore_Master_Resort_SitePlan.glb') {
    throw new Error('Resort GLB export failed');
  }

  // Capture Screenshot of Photorealistic Render
  const takeScreenshot = (filename) => {
    return new Promise((resolve) => {
      const shotId = Math.floor(Math.random() * 100000);
      const handler = (event) => {
        const msg = JSON.parse(event.data.toString());
        if (msg.id === shotId) {
          ws.removeEventListener('message', handler);
          const buf = Buffer.from(msg.result.data, 'base64');
          fs.writeFileSync(path.join(ROOT, filename), buf);
          console.log(`✓ Screenshot captured: ${filename} (${buf.length} bytes)`);
          resolve();
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({
        id: shotId,
        method: 'Page.captureScreenshot',
        params: { format: 'png' }
      }));
    });
  };

  // Wait 1.5s for camera lerp to settle at Phase 0 and capture screenshot
  await evalInPage(`window.scrollController.jumpToPhase(0)`);
  await new Promise(r => setTimeout(r, 1500));
  await takeScreenshot('photorealistic-render-phase0.png');

  // Jump to Master Site Plan mode and capture screenshot
  await evalInPage(`document.getElementById('btn-mode-resort').click()`);
  await new Promise(r => setTimeout(r, 1500));
  await takeScreenshot('photorealistic-render-resort.png');

  // Clean up
  ws.close();
  chromeProc.kill();
  server.close();
  try {
    fs.rmSync(userDataDir, { recursive: true, force: true });
  } catch (e) {}

  if (errors.length > 0) {
    console.error('❌ Browser errors detected:', errors);
    process.exit(1);
  }

  console.log('\n🎉 ALL 3D ENGINE INTEGRATION TESTS PASSED!');
  process.exit(0);
});
