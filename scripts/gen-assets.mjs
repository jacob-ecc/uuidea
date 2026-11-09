// Erzeugt PNG-Icons, favicon.ico und Open-Graph-Bilder aus HTML/SVG via Playwright.
// Aufruf: node scripts/gen-assets.mjs  (Ergebnis wird committet, nicht im CI-Build erzeugt)
import { chromium } from '@playwright/test';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const pub = (p) => fileURLToPath(new URL('public/' + p, root));
const fontDir = new URL('node_modules/@fontsource-variable/', root);
const font = async (pkg, file) =>
  (await readFile(new URL(`${pkg}/files/${file}`, fontDir))).toString('base64');

const svg = await readFile(pub('favicon.svg'), 'utf8');
const geist = await font('instrument-sans', 'instrument-sans-latin-wdth-normal.woff2');
const mono = (
  await readFile(
    new URL('node_modules/@fontsource/dm-mono/files/dm-mono-latin-500-normal.woff2', root),
  )
).toString('base64');

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });

async function shot(html, w, h, out) {
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const buf = await page.screenshot({ type: 'png', omitBackground: false });
  if (out) await writeFile(pub(out), buf);
  return buf;
}

const iconHtml = (size, pad = 0) =>
  `<html><body style="margin:0;background:#0a0d14;display:grid;place-items:center;width:${size}px;height:${size}px">
   <div style="width:${size - pad * 2}px;height:${size - pad * 2}px">${svg.replace('<svg ', '<svg width="100%" height="100%" ')}</div></body></html>`;

await shot(iconHtml(180), 180, 180, 'apple-touch-icon.png');
await shot(iconHtml(192), 192, 192, 'icon-192.png');
await shot(iconHtml(512), 512, 512, 'icon-512.png');
await shot(iconHtml(512, 64), 512, 512, 'icon-maskable-512.png');
const png32 = await shot(iconHtml(32), 32, 32);

// ICO-Container mit einem eingebetteten 32×32-PNG
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
header.writeUInt8(32, 6);
header.writeUInt8(32, 7);
header.writeUInt16LE(1, 10);
header.writeUInt16LE(32, 12);
header.writeUInt32LE(png32.length, 14);
header.writeUInt32LE(22, 18);
await writeFile(pub('favicon.ico'), Buffer.concat([header, png32]));

// Open-Graph-Bilder
const seg = (u) => {
  const c = ['#5ab9fc', '#5ce1e6', '#74e0a8', '#f2c46d', '#ff8f70'];
  return u
    .split('-')
    .map((s, i) => `<span style="color:${c[i]}">${s}</span>`)
    .join('<span style="color:#5b6373">-</span>');
};
const og = ({ eyebrow, title, serif: s, uuid }) => `<!doctype html><html><head><style>
@font-face{font-family:G;src:url(data:font/woff2;base64,${geist})}
@font-face{font-family:M;src:url(data:font/woff2;base64,${mono})}
body{margin:0;width:1200px;height:630px;background:#0a0d14;color:#f2f4f8;font-family:G;overflow:hidden;position:relative}
.aura{position:absolute;inset:-30% -20% auto -20%;height:130%;filter:blur(90px);opacity:.28;
background:radial-gradient(35% 35% at 25% 45%,#5ab9fc,transparent 70%),radial-gradient(30% 30% at 55% 30%,#74e0a8,transparent 70%),radial-gradient(32% 32% at 80% 60%,#ff8f70,transparent 70%)}
.wrap{position:relative;padding:72px 80px;height:100%;box-sizing:border-box;display:flex;flex-direction:column}
.eb{font-family:M;font-size:20px;letter-spacing:.14em;text-transform:uppercase;color:#8a93a3}
.u{font-family:M;font-size:47px;font-weight:500;margin-top:auto;white-space:nowrap;letter-spacing:-.01em}
h1{font-size:72px;line-height:1.02;letter-spacing:-.036em;font-weight:500;margin:28px 0 0;max-width:18ch}
.s{color:#a3abb9}
.line{height:2px;background:linear-gradient(90deg,#5ab9fc,#5ce1e6,#74e0a8,#f2c46d,#ff8f70);margin-top:28px;opacity:.7}
.brand{position:absolute;top:72px;right:80px;font-size:26px;font-weight:600;letter-spacing:-.02em}
</style></head><body><div class="aura"></div><div class="wrap">
<div class="eb">${eyebrow}</div><div class="brand">uuidea.de</div>
<h1>${title} <span class="s">${s}</span></h1>
<div class="u">${seg(uuid)}</div><div class="line"></div></div></body></html>`;

await mkdir(pub('og'), { recursive: true });
const ogs = {
  default: {
    eyebrow: 'UUIDs · Tools · Spiele',
    title: 'Jede UUID ist',
    serif: 'einzigartig.',
    uuid: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  },
  tools: {
    eyebrow: 'Tools · v1 v4 v5 v6 v7',
    title: 'Der UUID-',
    serif: 'Werkzeugkasten.',
    uuid: '0192f4c1-7a3e-7b21-9c4d-5e8f3a1b2c3d',
  },
  games: {
    eyebrow: 'Spiele · seeded by UUID',
    title: 'Eine UUID. Eine Runde.',
    serif: 'Fair geteilt.',
    uuid: '6ba7b810-9dad-41d1-80b4-00c04fd430c8',
  },
  about: {
    eyebrow: 'Über',
    title: 'Warum',
    serif: 'UUIDs?',
    uuid: '886313e1-3b8a-5372-9b90-0c9aee199e5d',
  },
};
for (const [name, cfg] of Object.entries(ogs)) await shot(og(cfg), 1200, 630, `og/${name}.png`);

// Hero-Aura: weiche Verläufe aus dem Segment-Spektrum, klein gerendert (skaliert verlustfrei hoch)
await page.setContent('<canvas id=c width=1440 height=810></canvas>');
const aura = await page.evaluate(() => {
  const c = document.getElementById('c');
  const x = c.getContext('2d');
  x.fillStyle = '#0a0d14';
  x.fillRect(0, 0, 1440, 810);
  x.scale(7.5, 7.5);
  x.filter = 'blur(105px)';
  const blob = (cx, cy, r, col, a) => {
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, col + a);
    g.addColorStop(1, col + '00');
    x.fillStyle = g;
    x.fillRect(0, 0, 192, 108);
  };
  blob(40, 40, 70, '#5ab9fc', '55');
  blob(105, 25, 55, '#74e0a8', '38');
  blob(160, 70, 70, '#ff8f70', '48');
  return c.toDataURL('image/webp', 0.75);
});
await writeFile(pub('aura.webp'), Buffer.from(aura.split(',')[1], 'base64'));

await browser.close();
console.log('Assets erzeugt.');
