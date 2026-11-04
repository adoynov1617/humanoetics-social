// Седмица 1 (5–11 ноември 2026): визиите в media/2026-11-w1 и графикът в
// schedule/2026-11-w1.json. Пуска се локално, при клониран human-design-shop
// до това хранилище (или SHOP_DIR=...), с ffmpeg в PATH:
//   node generator/week1.js
require('./theme');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const R = path.join(process.env.SHOP_DIR || path.join(__dirname, '..', '..', 'human-design-shop'), 'src', 'social') + '/';
const T = require(R + 'templates');
const L = require(R + 'library');
const { toPng } = require(R + 'render');
const { renderReel, reelFramePng } = require(R + 'reel');

const WEEK = '2026-11-w1';
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'media', WEEK);
const HANDLE = '@humanoetics';
fs.mkdirSync(OUT, { recursive: true });

require('./types-data')(L);

// PNG -> JPEG (Instagram API приема само JPEG).
function jpg(png, name) {
  const tmp = path.join(OUT, name.replace(/\.jpg$/, '.png'));
  fs.writeFileSync(tmp, png);
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', tmp, '-q:v', '2', path.join(OUT, name)]);
  fs.unlinkSync(tmp);
  return `${WEEK}/${name}`;
}

const items = [];
let n = 0;
const num = () => String(++n).padStart(2, '0');

function carousel(key, at) {
  const c = L.typeCarousel(key);
  const p = num();
  const media = c.slides.map((s) => jpg(toPng(T[s.template]({ ...s, handle: HANDLE }), T.POST.w), `${p}-${c.id}-${s.index}.jpg`));
  items.push({ id: `${WEEK}-${p}-${c.id}`, at, type: 'carousel', media, caption: c.caption });
}
function story(st, at, note) {
  const p = num();
  items.push({ id: `${WEEK}-${p}-${st.id}`, at, type: 'story', media: [jpg(toPng(T[st.template](st), T.STORY.w), `${p}-${st.id}.jpg`)], note });
}

(async () => {
  carousel('generator', '2026-11-05T19:31:00+02:00');
  story(L.statsStory(), '2026-11-06T09:13:00+02:00', 'Без анкета – стикерите не са достъпни през API.');

  const reel = L.typesReel();
  const p = num();
  const cover = jpg(reelFramePng(reel, 2.6), `${p}-${reel.id}-cover.jpg`);
  const silent = path.join(OUT, `${p}-${reel.id}-silent.mp4`);
  const video = path.join(OUT, `${p}-${reel.id}.mp4`);
  await renderReel(reel, silent);
  // Тиха аудио пътечка: някои видеа без звук се отказват от Instagram.
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', silent, '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo', '-shortest', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', video]);
  fs.unlinkSync(silent);
  items.push({ id: `${WEEK}-${p}-${reel.id}`, at: '2026-11-07T19:37:00+02:00', type: 'reel', media: [`${WEEK}/${p}-${reel.id}.mp4`], cover, caption: reel.caption, note: 'Без музика – музиката не се слага през API.' });

  story(L.gateOfDay(57), '2026-11-08T09:13:00+02:00');
  carousel('manifestinggenerator', '2026-11-09T19:31:00+02:00');
  const quiz = L.typeQuiz();
  story(quiz, '2026-11-10T09:13:00+02:00');
  story(quiz.next, '2026-11-10T20:43:00+02:00');
  story(L.gateOfDay(27), '2026-11-11T09:13:00+02:00');

  fs.writeFileSync(path.join(ROOT, 'schedule', `${WEEK}.json`), JSON.stringify(items, null, 2) + '\n');
  console.log(`ok: ${items.length} публикации, ${fs.readdirSync(OUT).length} файла`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
