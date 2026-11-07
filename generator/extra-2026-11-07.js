// Допълнително стори за 7 ноември 2026: колко хора имат отворен всеки център.
require('./theme');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const R = path.join(process.env.SHOP_DIR || path.join(__dirname, '..', '..', 'human-design-shop'), 'src', 'social') + '/';
const T = require(R + 'templates');
const { toPng } = require(R + 'render');

const SET = '2026-11-extra';
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'media', SET);
fs.mkdirSync(OUT, { recursive: true });

const st = {
  id: 'stats-open-head',
  template: 'statStory',
  eyebrow: 'Отворени центрове',
  big: '7 от 10',
  line: 'Толкова хора имат отворен център Глава – и мислят за чужди въпроси.',
  bars: [['Глава', 70], ['Сърце', 63], ['Аджна', 53], ['Слънчев сплит', 47], ['Сакрален център', 34]].map(([name, value]) => ({ name, value, label: `${value}%` })),
  highlight: 'Глава',
  footer: 'Кои са твоите? humanoetics.com',
};
const tmp = path.join(OUT, `01-${st.id}.png`);
fs.writeFileSync(tmp, toPng(T.statStory(st), T.STORY.w));
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', tmp, '-q:v', '2', tmp.replace(/\.png$/, '.jpg')]);
fs.unlinkSync(tmp);
const at = process.argv[2] || new Date().toISOString();
fs.writeFileSync(path.join(ROOT, 'schedule', `${SET}.json`), JSON.stringify([{ id: `${SET}-01-${st.id}`, at, type: 'story', media: [`${SET}/01-${st.id}.jpg`] }], null, 2) + '\n');
console.log('ok');
