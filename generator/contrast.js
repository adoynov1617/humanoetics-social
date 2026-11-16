// Карусел „Ти си мислиш … / Дизайнът ти казва …“ (1080×1350), по образеца
// „100 views / 1M views“: номер, тема, два надписа в курсив и текст в рамка,
// „Последвай за още“ горе и „Запази за после“ долу.
//   node generator/contrast.js <папка>
require('./theme');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const R = path.join(process.env.SHOP_DIR || path.join(__dirname, '..', '..', 'human-design-shop'), 'src', 'social') + '/';
const { C, textWidth, textBlock, fitSize, background, brand, svgDoc, toPng, sparkle } = require(R + 'render');
const { bodygraphMotif } = require(R + 'templates');

const W = 1080;
const H = 1350;
const X = 80;
const TW = W - 2 * X;
const OUT = process.argv[2] || path.join(__dirname, '..', 'out-contrast');
fs.mkdirSync(OUT, { recursive: true });

const SLIDES = [
  ['Генератор', '„Работохоличка съм и не мога да спра.“', 'Тялото ти има огромна енергия – но само за работа, която те пали. Умората е знак, че не е твоята.'],
  ['Манифестиращ генератор', '„Разпиляна съм и не довършвам нищо.“', 'Създадена си да прескачаш стъпки. Довършваш това, което наистина има значение.'],
  ['Прожектор', '„Мързелива съм, бързо се изморявам.“', 'Не си създадена за осем часа поточна работа. Ти виждаш хората – и ги насочваш.'],
  ['Манифестор', '„Хората ме намират за рязка.“', 'Аурата ти е силна. Едно кратко „ето какво ще направя“ маха съпротивата.'],
  ['Рефлектор', '„Не знам коя съм – всеки ден съм различна.“', 'Ти си огледало на средата. Правилното място ти показва коя си.'],
  ['Емоционален авторитет', '„Нерешителна съм.“', 'Яснотата ти идва с времето, не в момента. Изчакай вълната – и решавай.'],
  ['Отворено Сърце', '„Трябва да доказвам, че заслужавам.“', 'Нямаш какво да доказваш. Стойността ти не зависи от обещанията, които даваш.'],
  ['Отворена Глава', '„Не мога да спра да мисля.“', 'Поемаш чужди въпроси. Не всеки въпрос в главата ти е твой за решаване.'],
];
const TOTAL = SLIDES.length + 2;

// Извита стрелка (като „Tap here to follow me ↗“).
const curlArrow = (x, y, s = 1, color = C.ink) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 18 C 22 44, 58 40, 78 6" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round"/><path d="M60 2 L80 4 L76 24" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></g>`;
const bookmark = (x, y, color = C.ink) => `<path d="M${x} ${y} h46 v66 l-23 -18 l-23 18 Z" fill="${color}"/>`;

function chrome(n) {
  const num = n ? `<text x="${X}" y="${150}" font-family="Lora" font-size="92" fill="${C.ink}">${String(n).padStart(2, '0')}</text>` : '';
  return `${num}
    <text x="${W - X - 110}" y="128" text-anchor="end" font-family="Inter" font-size="32" fill="${C.inkSoft}">Последвай за още</text>
    ${curlArrow(W - X - 96, 96, 1)}
    ${brand(X, 1252, { size: 30 })}
    <rect x="${X}" y="1272" width="300" height="48" rx="24" fill="${C.rose}"/>
    <text x="${X + 150}" y="1305" text-anchor="middle" font-family="Inter" font-weight="600" font-size="26" fill="#FFFFFF">humanoetics.com</text>
    <text x="${W - X - 70}" y="1262" text-anchor="end" font-family="Inter" font-weight="500" font-size="24" letter-spacing="2" fill="${C.inkSoft}">ЗАПАЗИ ЗА</text>
    <text x="${W - X - 70}" y="1292" text-anchor="end" font-family="Inter" font-weight="500" font-size="24" letter-spacing="2" fill="${C.inkSoft}">ПОСЛЕ</text>
    ${bookmark(W - X - 46, 1238)}`;
}

function boxed(text, y) {
  const size = fitSize(text, { family: 'Inter', width: TW - 100, max: 40, min: 32, maxLines: 3 });
  const t = textBlock(text, { x: W / 2, y: y + 34, width: TW - 100, size, color: C.ink, lineHeight: 1.3, anchor: 'middle' });
  const h = t.height + 68;
  return { svg: `<rect x="${X}" y="${y}" width="${TW}" height="${h}" rx="24" fill="none" stroke="${C.ink}" stroke-width="4"/>${t.svg}`, h };
}

function pointSlide(n, [topic, thought, truth]) {
  let y = 250;
  const ts = fitSize(topic, { family: 'Lora', width: TW - 160, max: 60, min: 44, maxLines: 1 });
  const tw = textBlock(topic, { x: W / 2, y, width: TW - 120, size: ts, family: 'Lora', color: C.ink, anchor: 'middle' });
  const half = textWidth(topic, { family: 'Lora', size: ts }) / 2;
  const spark = `${sparkle(W / 2 - half - 36, y + ts * 0.5, 14)}${sparkle(W / 2 + half + 36, y + ts * 0.5, 14)}`;
  y += 130;
  const l1 = `<text x="${W / 2}" y="${y + 90}" text-anchor="middle" font-family="Lora" font-style="italic" font-weight="600" font-size="104" fill="${C.roseDeep}">Ти си мислиш</text>`;
  y += 140;
  const b1 = boxed(thought, y);
  y += b1.h + 90;
  const l2 = `<text x="${W / 2}" y="${y + 90}" text-anchor="middle" font-family="Lora" font-style="italic" font-weight="600" font-size="104" fill="${C.roseDeep}">Дизайнът казва</text>`;
  y += 140;
  const b2 = boxed(truth, y);
  y += b2.h;
  if (y > 1150) throw new Error(`Твърде дълго: ${topic} (${Math.round(y)})`);
  const swipe = n < TOTAL ? curlArrow(W - X - 90, Math.min(y + 50, 1140), 0.9) : '';
  return svgDoc(W, H, `${background(W, H, { seed: n, glowY: 0.4 })}${chrome(n)}${tw.svg}${spark}${l1}${b1.svg}${l2}${b2.svg}${swipe}`);
}

function cover() {
  const motif = bodygraphMotif({ cx: W / 2, cy: 960, scale: 0.42, opacity: 0.7, defined: ['ajna', 'throat', 'g', 'sacral', 'root'], channels: [['ajna', 'throat'], ['throat', 'g'], ['g', 'sacral'], ['sacral', 'root']] });
  return svgDoc(W, H, `${background(W, H, { seed: 1, glowY: 0.35 })}${chrome(0)}
    <text x="${W / 2}" y="320" text-anchor="middle" font-family="Inter" font-weight="600" font-size="30" letter-spacing="5" fill="${C.roseDeep}">HUMAN DESIGN</text>
    <text x="${W / 2}" y="470" text-anchor="middle" font-family="Lora" font-style="italic" font-weight="600" font-size="112" fill="${C.ink}">Ти си мислиш</text>
    <text x="${W / 2}" y="560" text-anchor="middle" font-family="Lora" font-size="56" fill="${C.inkFaint}">vs</text>
    <text x="${W / 2}" y="680" text-anchor="middle" font-family="Lora" font-style="italic" font-weight="600" font-size="112" fill="${C.ink}">Дизайнът казва</text>
    ${textBlock('8 неща, които приемаш за недостатък, а всъщност са твоят дизайн', { x: W / 2, y: 1150 - 30, width: TW - 80, size: 36, color: C.inkSoft, anchor: 'middle', lineHeight: 1.3 }).svg}
    ${motif}${curlArrow(W - X - 90, 1035, 0.9)}`);
}

function cta() {
  let y = 300;
  const t = textBlock('Искаш да видиш своя дизайн?', { x: W / 2, y, width: TW, size: 76, family: 'Lora', weight: 600, color: C.ink, anchor: 'middle', lineHeight: 1.1 });
  y += t.height + 60;
  const row = (label, text) => {
    const body = textBlock(text, { x: X + 40, y: y + 66, width: TW - 80, size: 36, color: C.inkSoft, lineHeight: 1.32 });
    const h = 66 + body.height + 34;
    const out = `<rect x="${X}" y="${y}" width="${TW}" height="${h}" rx="24" fill="none" stroke="${C.ink}" stroke-width="4"/>
      <text x="${X + 40}" y="${y + 54}" font-family="Lora" font-style="italic" font-weight="600" font-size="40" fill="${C.roseDeep}">${label}</text>${body.svg}`;
    y += h + 30;
    return out;
  };
  const r1 = row('Безплатно', 'Твоята карта (бодиграф), типът и стратегията ти – за 1 минута.');
  const r2 = row('Пълен анализ · 24 €', 'Подробен личен анализ на твоя дизайн, готов веднага като PDF.');
  y += 20;
  const site = `<rect x="${W / 2 - 300}" y="${y}" width="600" height="104" rx="52" fill="${C.rose}"/>
    <text x="${W / 2}" y="${y + 68}" text-anchor="middle" font-family="Inter" font-weight="600" font-size="48" fill="#FFFFFF">humanoetics.com</text>`;
  y += 150;
  const note = textBlock('Линкът е в профила · или напиши „КАРТА“ в коментарите', { x: W / 2, y, width: TW, size: 30, family: 'LoraItalic', color: C.roseDeep, anchor: 'middle' });
  return svgDoc(W, H, `${background(W, H, { seed: 4, glowY: 0.5 })}${chrome(0)}${t.svg}${r1}${r2}${site}${note.svg}`);
}

const files = [];
const save = (svg, i) => {
  const png = path.join(OUT, `contrast-${String(i).padStart(2, '0')}.png`);
  fs.writeFileSync(png, toPng(svg, W));
  const jpg = png.replace(/\.png$/, '.jpg');
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', png, '-q:v', '2', jpg]);
  fs.unlinkSync(png);
  files.push(jpg);
};
save(cover(), 1);
SLIDES.forEach((s, i) => save(pointSlide(i + 2, s), i + 2));
save(cta(), TOTAL);
console.log(`ok: ${files.length} слайда → ${OUT}`);
