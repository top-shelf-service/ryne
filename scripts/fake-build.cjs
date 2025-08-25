const fs = require('fs');
const path = require('path');
const outDir = path.join(process.cwd(), 'dist');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'index.html'), `<!doctype html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>RYNE placeholder</title></head>
<body><h1>RYNE build placeholder</h1>
<p>Replace the "build" script with your real Next/Vite build when ready.</p></body></html>`);
console.log('Wrote dist/index.html');
