/* The game is one file and stays one file. This copies it into www/ so Capacitor has a
   webDir to sync; nothing is transformed, minified or bundled on the way. */
const fs = require('fs'), path = require('path');
const src = path.join(__dirname, '..', 'index.html');
const dst = path.join(__dirname, 'www', 'index.html');
fs.mkdirSync(path.dirname(dst), { recursive: true });
fs.copyFileSync(src, dst);
const kb = (fs.statSync(dst).size / 1024).toFixed(0);
console.log(`copied index.html -> www/index.html (${kb} KB)`);
