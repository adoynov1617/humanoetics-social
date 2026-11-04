// Петте типа: по един карусел (7 слайда) за всеки тип, в media/2026-11-types
// и schedule/2026-11-types.json. Първо графикът публикува Рефлектора, последно
// Генератора – така в профила горе стоят най-разпространените типове.
//   node generator/types.js 2026-11-04T17:20:00+02:00   (час на първия пост)
require('./theme');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const R = path.join(process.env.SHOP_DIR || path.join(__dirname, '..', '..', 'human-design-shop'), 'src', 'social') + '/';
const T = require(R + 'templates');
const L = require(R + 'library');
const { toPng } = require(R + 'render');
require('./types-data')(L);

const SET = '2026-11-types';
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'media', SET);
const HANDLE = '@humanoetics';
const START = Date.parse(process.argv[2] || new Date().toISOString());
fs.mkdirSync(OUT, { recursive: true });

function jpg(png, name) {
  const tmp = path.join(OUT, name.replace(/\.jpg$/, '.png'));
  fs.writeFileSync(tmp, png);
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', tmp, '-q:v', '2', path.join(OUT, name)]);
  fs.unlinkSync(tmp);
  return `${SET}/${name}`;
}

// Часовете на публикуване в българско време (+02:00 през зимата).
function local(ms) {
  const d = new Date(ms + 2 * 36e5);
  return d.toISOString().slice(0, 19) + '+02:00';
}

const ORDER = ['reflector', 'manifestor', 'projector', 'manifestinggenerator', 'generator'];
const items = ORDER.map((key, i) => {
  const c = L.typeCarousel(key);
  const p = String(i + 1).padStart(2, '0');
  const media = c.slides.map((s) => jpg(toPng(T[s.template]({ ...s, handle: HANDLE }), T.POST.w), `${p}-${c.id}-${s.index}.jpg`));
  return { id: `${SET}-${p}-${c.id}`, at: local(START + i * 60e3), type: 'carousel', media, caption: c.caption };
});
fs.writeFileSync(path.join(ROOT, 'schedule', `${SET}.json`), JSON.stringify(items, null, 2) + '\n');
console.log(`ok: ${items.length} карусела`);
