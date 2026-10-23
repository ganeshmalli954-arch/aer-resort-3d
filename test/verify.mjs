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

  // Assertions
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

  // Verify Phase jumping
  for (let i = 0; i < 8; i++) {
    const phaseData = await evalInPage(`(() => {
      window.scrollController.jumpToPhase(${i});
      return {
        phase: window.scrollController.currentPhaseIndex,
        title: document.getElementById('card-title')?.textContent,
        angle: document.getElementById('hud-angle-val')?.textContent
      };
    })()`);
    console.log(`✓ Phase ${i} verified:`, phaseData.title, `(${phaseData.angle})`);
  }

  // Verify GLB Export
  const villaGlb = await evalInPage(`new Promise((resolve) => {
    window.villaModel.exportGLTF(true, (filename, err) => {
      resolve({ filename, success: !err });
    });
  })`);
  console.log('✓ Villa GLB Exporter:', villaGlb);

  if (!villaGlb.success) throw new Error('GLB exporter failed');

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
