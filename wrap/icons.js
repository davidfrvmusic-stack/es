/* The launcher icons, drawn from the same shape index.html builds its PWA icon from —
   one source, so the installed app and the home-screen shortcut cannot drift apart.
   No image file enters the game's own folder: these are written into the Android project,
   which is where Play needs PNGs and where the single-file rule does not reach. */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');

const PAL = { ground:'#0B0D12', panel:'#171B24', accent:'#FF5364', accent2:'#20D6C7' };
/* the mark: a bass drum, a neck, and a flag of sound coming off it */
const MARK = (s) => `
  <circle cx="192" cy="336" r="72" fill="${PAL.accent}"/>
  <rect x="248" y="112" width="40" height="240" rx="20" fill="${PAL.accent}"/>
  <path d="M264 112l128-40v80l-128 40z" fill="${PAL.accent2}"/>`;

/* full icon: the mark on the panel ground, in a 512 box */
const FULL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="112" fill="${PAL.panel}"/>${MARK()}</svg>`;
const ROUND = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <circle cx="256" cy="256" r="256" fill="${PAL.panel}"/>${MARK()}</svg>`;
/* adaptive foreground: the mark alone, scaled into the 66/108 safe circle and centred */
const FG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <g transform="translate(256 256) scale(.62) translate(-256 -256)">${MARK()}</g></svg>`;
/* Play listing icon has no rounding of its own — the store applies the mask */
const STORE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="${PAL.panel}"/>${MARK()}</svg>`;
/* the splash is the window you see for the moment before the web view paints */
const SPLASH = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 960" width="960" height="960">
  <rect width="960" height="960" fill="${PAL.ground}"/>
  <g transform="translate(480 480) scale(.72) translate(-256 -256)">${MARK()}</g></svg>`;

const DPI = { mdpi:1, hdpi:1.5, xhdpi:2, xxhdpi:3, xxxhdpi:4 };
const R = 'android/app/src/main/res';

(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ deviceScaleFactor:1 })).newPage();
  const shot = async (svg, px, out) => {
    await p.setViewportSize({ width:px, height:px });
    await p.setContent(`<style>html,body{margin:0;background:transparent}
      svg{display:block;width:${px}px;height:${px}px}</style>${svg}`);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await p.screenshot({ path: out, omitBackground: true });
    return out;
  };
  const made = [];
  for (const [d, m] of Object.entries(DPI)) {
    made.push(await shot(FULL,  Math.round(48 * m),  `${R}/mipmap-${d}/ic_launcher.png`));
    made.push(await shot(ROUND, Math.round(48 * m),  `${R}/mipmap-${d}/ic_launcher_round.png`));
    made.push(await shot(FG,    Math.round(108 * m), `${R}/mipmap-${d}/ic_launcher_foreground.png`));
    made.push(await shot(SPLASH, Math.round(320 * m), `${R}/drawable-port-${d}/splash.png`));
    made.push(await shot(SPLASH, Math.round(320 * m), `${R}/drawable-land-${d}/splash.png`));
  }
  made.push(await shot(SPLASH, 640, `${R}/drawable/splash.png`));
  made.push(await shot(STORE,  512, 'store/playstore-icon-512.png'));
  await b.close();
  console.log(made.length + ' written');
  made.slice(0, 4).concat(made.slice(-2)).forEach(f =>
    console.log('  ' + f + '  ' + fs.statSync(f).size + 'b'));
})();
