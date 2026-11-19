// Сторита с анкета за ръчно качване от телефона (стикерът „Анкета“ не става
// през API). Празното място в средата е за стикера.
//   node generator/poll-stories.js <папка>
require('./theme');
const fs = require('fs');
const path = require('path');
const R = path.join(process.env.SHOP_DIR || path.join(__dirname, '..', '..', 'human-design-shop'), 'src', 'social') + '/';
const { C, textBlock, background, brand, svgDoc, toPng, sparkle } = require(R + 'render');
const { bodygraphMotif } = require(R + 'templates');

const W = 1080;
const H = 1920;
const X = 120;
const TW = W - 2 * X;
const OUT = process.argv[2] || path.join(__dirname, '..', 'out-polls');
fs.mkdirSync(OUT, { recursive: true });

// Пунктирана рамка „тук сложи стикера“ – вижда се само като насока, слабо.
function stickerSlot(y, h, label) {
  return `<rect x="${X + 40}" y="${y}" width="${TW - 80}" height="${h}" rx="36" fill="none" stroke="${C.roseLight}" stroke-width="3" stroke-dasharray="14 12" opacity="0.7"/>
  <text x="${W / 2}" y="${y + h / 2 + 12}" text-anchor="middle" font-family="Inter" font-weight="500" font-size="34" fill="${C.inkFaint}" opacity="0.8">${label}</text>`;
}

function story({ eyebrow, title, sub, slot, dark = false, motif = null, arrow = false }) {
  let y = 330;
  const eb = textBlock(eyebrow.toUpperCase(), { x: W / 2, y, width: TW, size: 30, weight: 600, color: dark ? C.goldLight : C.roseDeep, spacing: 4, anchor: 'middle' });
  y += 80;
  const t = textBlock(title, { x: W / 2, y, width: TW, size: 92, family: 'Lora', weight: 600, color: dark ? '#FFF6EE' : C.ink, lineHeight: 1.1, anchor: 'middle' });
  y += t.height + 44;
  const s = sub ? textBlock(sub, { x: W / 2, y, width: TW - 40, size: 42, color: dark ? C.goldLight : C.inkSoft, lineHeight: 1.35, anchor: 'middle' }) : { svg: '', height: 0 };
  y += s.height + 70;
  // Мястото за стикера остава празно; slot.label е само подсказка в README.
  const slotSvg = slot && process.env.GUIDES ? stickerSlot(Math.max(y, 900), slot.h || 300, slot.label) : '';
  const arrowSvg = arrow ? `<path d="M${W / 2} ${Math.max(y, 900) - 60} l0 44 m-18 -18 l18 18 l18 -18" stroke="${C.gold}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` : '';
  const m = motif ? bodygraphMotif({ cx: W / 2, cy: 1430, scale: 0.48, dark, opacity: 0.55, ...motif }) : '';
  return svgDoc(W, H, `${background(W, H, { dark, seed: 5, glowY: 0.35 })}
    ${brand(X, 230, { dark, size: 36 })}
    ${eb.svg}${t.svg}${s.svg}${arrowSvg}${slotSvg}${m}
    ${sparkle(W / 2 - 150, 1712, 9)}
    <text x="${W / 2 + 10}" y="${1722}" text-anchor="middle" font-family="Inter" font-weight="500" font-size="30" fill="${dark ? C.goldLight : C.inkFaint}">humanoetics.com</text>`);
}

const ALL = { defined: ['ajna', 'throat', 'g', 'sacral', 'root'], channels: [['ajna', 'throat'], ['throat', 'g'], ['g', 'sacral'], ['sacral', 'root']] };
const POLLS = [
  ['1-tip', { eyebrow: 'Анкета', title: 'Знаеш ли своя тип?', sub: 'В Human Design има 5 типа и всеки взима решения различно.', slot: { label: 'Да / Още не' } }],
  ['2-reshenia', { eyebrow: 'Анкета', title: 'Как взимаш големите решения?', sub: 'Веднага или след като ги „преспиш“?', slot: { label: 'Веднага / Преспивам ги' }, dark: true }],
  ['3-umora', { eyebrow: 'Анкета', title: 'Изморяваш ли се по-бързо от другите?', sub: 'При някои типове това е дизайн, а не слабост.', slot: { label: 'Да / Не' } }],
  ['4-koy-tip', { eyebrow: 'Анкета', title: 'Кой тип си ти?', sub: 'Ако не знаеш, провери безплатно на humanoetics.com', slot: { label: 'Генератор / МГ / Прожектор / Друг' }, motif: ALL }],
  ['5-ahah', { eyebrow: 'Анкета', title: 'Чуваш ли „ъхъ“ на тялото си?', sub: 'Генераторите имат отговор, преди умът да се намеси.', slot: { label: 'Да / Какво е това?' }, dark: true }],
  ['6-pochivka', { eyebrow: 'Анкета', title: 'Почиваш ли без чувство за вина?', sub: 'Почивката също е част от дизайна ти.', slot: { label: 'Да / Трудно ми е' } }],
  ['7-karta', { eyebrow: 'Безплатно', title: 'Искаш ли да видиш своята карта?', sub: 'Дата, час и място на раждане. Готова е за минута.', slot: { label: 'Да! / По-късно' }, arrow: true, motif: ALL }],
];
for (const [name, spec] of POLLS) fs.writeFileSync(path.join(OUT, `anketa-${name}.png`), toPng(story(spec), W));
console.log(`ok: ${POLLS.length} → ${OUT}`);
