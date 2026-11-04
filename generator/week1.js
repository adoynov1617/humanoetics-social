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

L.TYPE_SIGNS.generator = {
  typeName: 'Генератор',
  share: 'Около 37% от хората',
  motif: { defined: ['sacral', 'root', 'spleen'], channels: [['sacral', 'root'], ['spleen', 'root']] },
  signs: [
    ['Когато нещо те увлича, нямаш край', 'Имаш сили с часове и не усещаш как минава времето. Работата, която не те докосва, те изцежда бързо, дори да е лесна.'],
    ['Тялото ти отговаря преди ума', 'Онова „ъхъ“ или „ъ-ъ“, което излиза само. В Human Design това е сакралният отклик – най-прекият ти отговор.'],
    ['Фрустрацията е твоят сигнал', 'Появява се, когато продължаваш нещо, за което тялото отдавна е казало „не“, или когато работиш по чужд план.'],
    ['С времето ставаш майстор', 'Умението ти расте, когато правиш нещо, което те държи. Повторението не те плаши, ако работата е твоя.'],
    ['Сънят показва какъв е бил денят', 'Енергията ти свършва напълно и се възстановява със сън. Ако вечер не можеш да заспиш, денят не е бил твой.'],
  ],
  caption: [
    'Повече от всеки трети човек е Генератор – най-разпространеният тип в Human Design.',
    'Генераторът не е тук да започва от нищото, а да отговаря на това, което идва към него. Когато тялото каже „да“, енергията му стига за всичко.',
    'Типът се изчислява от датата, часа и мястото на раждане. Виж своя безплатно – линкът е в профила.',
  ],
  tags: ['#генератор', '#generator'],
};
L.TYPE_SIGNS.manifestinggenerator = {
  typeName: 'Манифестиращ генератор',
  share: 'Около 33% от хората',
  motif: null, // дългото име заема мястото на илюстрацията
  signs: [
    ['Водиш няколко неща наведнъж', 'Няколко отворени проекта и хобита са нормалното ти състояние. Това не е разпиляност, а начинът, по който работиш.'],
    ['Прескачаш стъпки и стигаш първи/а', 'Често намираш по-кратък път. Понякога се връщаш за пропуснатото – и това е част от процеса.'],
    ['Интересът ти изгасва рязко', 'Когато нещо спре да те вълнува, спираш. Важното е да започваш онова, на което тялото казва „да“.'],
    ['Другите не смогват с темпото ти', 'Отстрани завоите ти изглеждат хаотични. Едно кратко „сменям подхода, ето защо“ спестява много триене.'],
    ['Фрустрацията идва с нотка гняв', 'Когато те бавят или когато действаш без истински отклик. Тогава спри и провери какво казва тялото.'],
  ],
  caption: [
    'Ако често ти казват, че си „разпилян/а“, може да си Манифестиращ генератор. Такива са около една трета от хората.',
    'Стратегията е проста: отговори на това, което те вълнува, кажи на хората около теб какво ще направиш – и действай с твоето темпо.',
    'Провери типа си безплатно за минута – линкът е в профила.',
  ],
  tags: ['#манифестиращгенератор', '#manifestinggenerator'],
};

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
