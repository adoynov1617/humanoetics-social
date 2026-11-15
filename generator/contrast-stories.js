// Сторита „Ти си мислиш / Дизайнът казва“ (1080×1920) – същият стил като
// каруселя: курсивни надписи, текст в рамка, „Запази“ и логото долу.
// Съдържанието е в безопасната зона на сторитата (y ≈ 270–1440).
//   node generator/contrast-stories.js <папка>
require('./theme');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const R = path.join(process.env.SHOP_DIR || path.join(__dirname, '..', '..', 'human-design-shop'), 'src', 'social') + '/';
const { C, textWidth, textBlock, fitSize, background, brand, svgDoc, toPng, sparkle } = require(R + 'render');
const { bodygraphMotif } = require(R + 'templates');

const W = 1080;
const H = 1920;
const X = 80;
const TW = W - 2 * X;
const OUT = process.argv[2] || path.join(__dirname, '..', 'out-contrast-stories');
fs.mkdirSync(OUT, { recursive: true });

const STORIES = [
  ['sakralen', 'Сакрален авторитет', { defined: ['sacral'] }, '„Не мога да обясня защо го искам.“', 'Не е нужно. Тялото ти знае преди ума – довери се на онова „ъхъ“.'],
  ['splet', 'Отворен Слънчев сплит', { defined: [] }, '„Прекалено чувствителна съм.“', 'Усещаш емоциите на другите по-силно от тях. Дарба е – стига да не ги взимаш за свои.'],
  ['sakralen-otvoren', 'Отворен Сакрален център', { defined: [] }, '„Не знам кога да спра.“', 'Нямаш постоянна енергия за работа. Спри, преди да се изтощиш – не след това.'],
  ['liniya-3', 'Профил с линия 3', { defined: ['g'] }, '„Все греша.“', 'Учиш чрез опит. Всяко „не стана“ е информация, а не провал.'],
  ['dalak', 'Отворен Далак', { defined: [] }, '„Трудно пускам хора и неща.“', 'Задържаш това, което ти дава сигурност. Питай се: това още ли е добро за мен?'],
];

const bookmark = (x, y) => `<path d="M${x} ${y} h46 v66 l-23 -18 l-23 18 Z" fill="${C.ink}"/>`;

function boxed(text, y) {
  const size = fitSize(text, { family: 'Inter', width: TW - 100, max: 44, min: 34, maxLines: 3 });
  const t = textBlock(text, { x: W / 2, y: y + 38, width: TW - 100, size, color: C.ink, lineHeight: 1.32, anchor: 'middle' });
  const h = t.height + 76;
  return { svg: `<rect x="${X}" y="${y}" width="${TW}" height="${h}" rx="26" fill="none" stroke="${C.ink}" stroke-width="4"/>${t.svg}`, h };
}

function story([, topic, motif, thought, truth]) {
  let y = 330;
  const ts = fitSize(topic, { family: 'Lora', width: TW - 160, max: 60, min: 44, maxLines: 1 });
  const half = textWidth(topic, { family: 'Lora', size: ts }) / 2;
  const tw = textBlock(topic, { x: W / 2, y, width: TW - 120, size: ts, family: 'Lora', color: C.ink, anchor: 'middle' });
  const spark = `${sparkle(W / 2 - half - 36, y + ts * 0.5, 14)}${sparkle(W / 2 + half + 36, y + ts * 0.5, 14)}`;
  y += 150;
  const label = (text, yy) => `<text x="${W / 2}" y="${yy + 100}" text-anchor="middle" font-family="Lora" font-style="italic" font-weight="600" font-size="116" fill="${C.roseDeep}">${text}</text>`;
  const l1 = label('Ти си мислиш', y);
  y += 160;
  const b1 = boxed(thought, y);
  y += b1.h + 100;
  const l2 = label('Дизайнът казва', y);
  y += 160;
  const b2 = boxed(truth, y);
  y += b2.h;
  if (y > 1400) throw new Error(`Твърде дълго: ${topic} (${Math.round(y)})`);
  const m = bodygraphMotif({ cx: W / 2, cy: Math.max(y + 140, 1300), scale: 0.26, opacity: 0.6, channels: [], ...motif });
  return svgDoc(W, H, `${background(W, H, { seed: 2, glowY: 0.4 })}
    ${brand(X, 230, { size: 36 })}
    ${tw.svg}${spark}${l1}${b1.svg}${l2}${b2.svg}${m}
    <text x="${X}" y="1560" font-family="Inter" font-size="30" fill="${C.inkFaint}">Виж своя дизайн · humanoetics.com</text>
    <text x="${W - X - 70}" y="1532" text-anchor="end" font-family="Inter" font-weight="500" font-size="26" letter-spacing="2" fill="${C.inkSoft}">ЗАПАЗИ ЗА</text>
    <text x="${W - X - 70}" y="1564" text-anchor="end" font-family="Inter" font-weight="500" font-size="26" letter-spacing="2" fill="${C.inkSoft}">ПОСЛЕ</text>
    ${bookmark(W - X - 46, 1506)}`);
}

for (const s of STORIES) {
  const png = path.join(OUT, `story-contrast-${s[0]}.png`);
  fs.writeFileSync(png, toPng(story(s), W));
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', png, '-q:v', '2', png.replace(/\.png$/, '.jpg')]);
  fs.unlinkSync(png);
}
console.log(`ok: ${STORIES.length} сторита → ${OUT}`);
