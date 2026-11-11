// Видео за стори (1080×1920, ~9 сек.): кука → бодиграфът се изрисува →
// призив с празно място за стикер „Линк“. Без звук – музиката се добавя в
// Instagram. Пуска се с ffmpeg в PATH:
//   node generator/story-video.js <изходен.mp4>
require('./theme');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const SHOP = process.env.SHOP_DIR || path.join(__dirname, '..', '..', 'human-design-shop');
const R = path.join(SHOP, 'src', 'social') + '/';
const { C, textBlock, background, brand, svgDoc, toPng, sparkle } = require(R + 'render');
const { ICON_POS, shapePoints } = require(path.join(SHOP, 'src', 'shareCard'));

const W = 1080;
const H = 1920;
const FPS = 30;
const DUR = 9;
const OUT = process.argv[2] || path.join(__dirname, '..', 'story-video.mp4');

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOut = (t) => 1 - Math.pow(1 - clamp(t), 3);
const easeInOut = (t) => {
  const x = clamp(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
const lerp = (a, b, t) => a + (b - a) * t;
// Видимост: появява се за inDur от start, изчезва за outDur до end.
function vis(t, start, end, inDur = 0.5, outDur = 0.4) {
  if (t < start || t > end) return 0;
  return Math.min(easeOut((t - start) / inDur), easeOut((end - t) / outDur));
}

const ORDER = ['head', 'ajna', 'throat', 'g', 'heart', 'spleen', 'sacral', 'solarplexus', 'root'];
const CHANNELS = [['head', 'ajna'], ['ajna', 'throat'], ['throat', 'g'], ['g', 'sacral'], ['sacral', 'root'], ['spleen', 'root'], ['solarplexus', 'root'], ['heart', 'g'], ['spleen', 'sacral']];
const DEFINED = ['ajna', 'throat', 'g', 'sacral', 'root', 'spleen'];

function bodygraph(t, { cx, cy, scale }) {
  const lines = CHANNELS.map(([a, b], i) => {
    const p = ICON_POS[a];
    const q = ICON_POS[b];
    const len = Math.hypot(q.cx - p.cx, q.cy - p.cy);
    const k = easeInOut((t - 3.3 - i * 0.11) / 0.55);
    return `<line x1="${p.cx}" y1="${p.cy}" x2="${q.cx}" y2="${q.cy}" stroke="${C.rose}" stroke-width="6" stroke-linecap="round" stroke-dasharray="${len.toFixed(1)}" stroke-dashoffset="${(len * (1 - k)).toFixed(1)}" opacity="0.8"/>`;
  }).join('');
  const shapes = ORDER.map((key, i) => {
    const pos = ICON_POS[key];
    const k = easeOut((t - 2.7 - i * 0.07) / 0.45);
    const on = DEFINED.includes(key);
    const f = on ? easeOut((t - 4.6 - i * 0.06) / 0.5) : 0;
    const fill = `rgba(184,138,98,${(0.85 * f).toFixed(2)})`;
    return `<g opacity="${k.toFixed(2)}" transform="translate(${pos.cx} ${pos.cy}) scale(${(0.6 + 0.4 * k).toFixed(3)}) translate(${-pos.cx} ${-pos.cy})">
      <polygon points="${shapePoints(pos)}" fill="#FBF3EC"/>
      <polygon points="${shapePoints(pos)}" fill="${fill}" stroke="${on && f > 0.5 ? C.goldDeep : 'rgba(90,60,55,0.55)'}" stroke-width="3.5"/></g>`;
  }).join('');
  return `<g transform="translate(${cx} ${cy}) scale(${scale})">${lines}${shapes}</g>`;
}

function frame(t) {
  let body = '';
  // 1) Кука: две реплики.
  const a1 = vis(t, 0.15, 2.9);
  const a2 = vis(t, 1.0, 2.9);
  const r1 = 36 * (1 - easeOut((t - 0.15) / 0.6));
  const r2 = 36 * (1 - easeOut((t - 1.0) / 0.6));
  const l1 = textBlock('Не си сбъркан/а.', { x: W / 2, y: 720 + r1, width: 860, size: 104, family: 'Lora', weight: 600, color: C.ink, anchor: 'middle', opacity: a1, lineHeight: 1.1 });
  const l2 = textBlock('Просто още не знаеш своя дизайн.', { x: W / 2, y: 720 + l1.height + 50 + r2, width: 820, size: 60, family: 'LoraItalic', color: C.roseDeep, anchor: 'middle', opacity: a2, lineHeight: 1.25 });
  body += l1.svg + l2.svg;

  // 2) Бодиграфът се изрисува, после се смалява нагоре.
  const m = easeInOut((t - 5.7) / 0.8);
  if (t > 2.6) body += bodygraph(t, { cx: W / 2, cy: lerp(880, 610, m), scale: lerp(1.25, 0.7, m) });

  // 3) Призив + стрелка към мястото за стикера.
  const c = easeOut((t - 6.1) / 0.6);
  const rc = 30 * (1 - c);
  const t1 = textBlock('Виж своя дизайн', { x: W / 2, y: 930 + rc, width: 880, size: 92, family: 'Lora', weight: 600, color: C.ink, anchor: 'middle', opacity: c, lineHeight: 1.1 });
  const t2 = textBlock('Безплатно, за 1 минута', { x: W / 2, y: 930 + t1.height + 30 + rc, width: 820, size: 46, color: C.inkSoft, anchor: 'middle', opacity: easeOut((t - 6.4) / 0.6) });
  const bounce = 10 * Math.sin(Math.max(0, t - 6.8) * 5);
  const ay = 1180 + bounce;
  const aa = easeOut((t - 6.8) / 0.4);
  body += t1.svg + t2.svg + `<path d="M${W / 2} ${ay} l0 52 m-22 -22 l22 22 l22 -22" stroke="${C.gold}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="${aa.toFixed(2)}"/>`;

  return svgDoc(W, H, `${background(W, H, { seed: 3, glowY: 0.36 + 0.03 * Math.sin(t / 1.5) })}
    ${brand(120, 230, { size: 36 })}
    ${body}
    ${sparkle(W / 2 - 150, 1712, 9)}
    <text x="${W / 2 + 10}" y="1722" text-anchor="middle" font-family="Inter" font-weight="500" font-size="30" fill="${C.inkFaint}">humanoetics.com</text>`);
}

const frames = DUR * FPS;
const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo', '-shortest', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', OUT]);
let err = '';
ff.stderr.on('data', (d) => (err += d));
ff.on('close', (code) => {
  if (code) {
    console.error(err);
    process.exit(1);
  }
  console.log(`ok: ${OUT} (${DUR} сек.)`);
});
(async () => {
  for (let i = 0; i < frames; i++) {
    if (!ff.stdin.write(toPng(frame(i / FPS), W))) await new Promise((r) => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
})();
module.exports = { frame };
