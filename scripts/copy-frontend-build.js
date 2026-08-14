// Copies frontend/dist -> backend/public so the backend can serve the built
// React app as static files (single-service deployment).
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'frontend', 'dist');
const dest = path.join(__dirname, '..', 'backend', 'public');

if (!fs.existsSync(src)) {
  console.error(`[copy-frontend-build] Source not found: ${src}. Did "npm run build --prefix frontend" run first?`);
  process.exit(1);
}

fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(src, dest, { recursive: true });

console.log(`[copy-frontend-build] Copied ${src} -> ${dest}`);
