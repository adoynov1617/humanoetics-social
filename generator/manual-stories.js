// Сторита за ръчно качване от телефона: оставят празно място за стикерите
// на Instagram (анкета, въпрос, линк, плъзгач), които не стават през API.
//   node generator/manual-stories.js <папка>
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
const OUT = process.argv[2] || path.join(__dirname, '..', 'manual-stories');
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
const STORIES = [
  ['1-anketa-tip', { eyebrow: 'Анкета', title: 'Знаеш ли своя тип?', sub: 'В Human Design има 5 типа – и всеки взима решения различно.', slot: { label: 'тук стикер „Анкета“: Да / Още не', h: 260 } }],
  ['2-vupros', { eyebrow: 'Питай ме', title: 'Какво искаш да знаеш за Human Design?', sub: 'Отговарям в сторитата през седмицата.', slot: { label: 'тук стикер „Въпроси“', h: 320 } }],
  ['3-link-karta', { eyebrow: 'Безплатно', title: 'Виж своята карта за 1 минута', sub: 'Дата, час и място на раждане – и бодиграфът ти е готов.', slot: { label: 'тук стикер „Линк“: humanoetics.com', h: 200 }, arrow: true, motif: ALL }],
  ['4-plazgach-energia', { eyebrow: 'Как си днес?', title: 'Колко енергия имаш в момента?', sub: 'Генераторите често не я усещат, докато не свърши.', slot: { label: 'тук стикер „Плъзгач“ с емоджи', h: 220 } }],
  ['5-anketa-reshenia', { eyebrow: 'Анкета', title: 'Как взимаш големите решения?', sub: 'Веднага – или след като ги „преспиш“?', slot: { label: 'тук „Анкета“: Веднага / Преспивам ги', h: 260 }, dark: true }],
  ['6-fon-svetal', { eyebrow: 'Human Design', title: ' ', sub: null, motif: ALL }],
  ['7-fon-tumen', { eyebrow: 'Human Design', title: ' ', sub: null, motif: ALL, dark: true }],
];
for (const [name, spec] of STORIES) fs.writeFileSync(path.join(OUT, `${name}.png`), toPng(story(spec), W));
console.log(`ok: ${STORIES.length} → ${OUT}`);
