// Дневни сторита (3 на ден):
//   сутрин  – „Денят днес“: Слънцето в портал/зодия, Луната, числото на деня + бодиграф
//   обяд    – досегашните (портали за опознаване, куизове), преместени в 13:13
//   вечер   – тяло, сезон, нумерология, астрология (или отговорът на куиза)
//   node generator/daily.js 2026-11-13 2026-11-22
require('./theme');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const SHOP = process.env.SHOP_DIR || path.join(__dirname, '..', '..', 'human-design-shop');
const R = path.join(SHOP, 'src', 'social') + '/';
const T = require(R + 'templates');
const L = require(R + 'library');
const { C, esc, textBlock, fitSize, background, brand, svgDoc, toPng, pill } = require(R + 'render');
const { listGates } = require(path.join(SHOP, 'src', 'gatesContent'));
const HD = require(path.join(SHOP, 'node_modules', 'free-human-design'));
const Astronomy = require(path.join(SHOP, 'node_modules', 'astronomy-engine'));

const ROOT = path.join(__dirname, '..');
const SET = '2026-11-daily';
const OUT = path.join(ROOT, 'media', SET);
const W = 1080;
const H = 1920;
const X = 110;
const TW = W - 2 * X;
const TZ = 'Europe/Sofia';
fs.mkdirSync(OUT, { recursive: true });

const SIGN_BG = { Aries: 'Овен', Taurus: 'Телец', Gemini: 'Близнаци', Cancer: 'Рак', Leo: 'Лъв', Virgo: 'Дева', Libra: 'Везни', Scorpio: 'Скорпион', Sagittarius: 'Стрелец', Capricorn: 'Козирог', Aquarius: 'Водолей', Pisces: 'Риби' };
const DAY_NUM = {
  1: 'начало и първа стъпка', 2: 'партньорство и търпение', 3: 'изразяване и общуване', 4: 'ред, работа и основи',
  5: 'промяна и свобода', 6: 'грижа, дом и близки', 7: 'размисъл и тишина', 8: 'сила, пари и резултати',
  9: 'завършване и пускане', 11: 'интуиция и вдъхновение', 22: 'големи планове, които се строят',
};

function jpg(svg, name) {
  const tmp = path.join(OUT, name.replace(/\.jpg$/, '.png'));
  fs.writeFileSync(tmp, toPng(svg, W));
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', tmp, '-q:v', '2', path.join(OUT, name)]);
  fs.unlinkSync(tmp);
  return `${SET}/${name}`;
}

function moonPhaseBg(deg) {
  if (deg < 10 || deg > 350) return 'новолуние';
  if (deg < 80) return 'расте';
  if (deg < 100) return 'първа четвърт';
  if (deg < 170) return 'расте';
  if (deg < 190) return 'пълнолуние';
  if (deg < 260) return 'намалява';
  if (deg < 280) return 'последна четвърт';
  return 'намалява';
}
function dayNumber(iso) {
  let n = iso.replace(/-/g, '').split('').reduce((s, d) => s + Number(d), 0);
  while (n > 9 && n !== 11 && n !== 22) n = String(n).split('').reduce((s, d) => s + Number(d), 0);
  return n;
}
// Небето в 10:00 българско време на дадената дата.
function sky(iso) {
  const at = new Date(`${iso}T08:00:00Z`);
  const act = HD.computeActivations({ birthUtc: at }).personality;
  const sun = act.find((a) => a.body === 'sun');
  const earth = act.find((a) => a.body === 'earth');
  const moon = act.find((a) => a.body === 'moon');
  return {
    sun, earth, moon,
    sunSign: SIGN_BG[HD.signOf(sun.longitude).sign],
    moonSign: SIGN_BG[HD.signOf(moon.longitude).sign],
    phase: moonPhaseBg(Astronomy.MoonPhase(at)),
    num: dayNumber(iso),
  };
}
const dateLabel = (iso) => {
  const s = new Date(`${iso}T10:00:00Z`).toLocaleDateString('bg-BG', { weekday: 'long', day: 'numeric', month: 'long', timeZone: TZ });
  return s.charAt(0).toUpperCase() + s.slice(1);
};

function footer(text = 'humanoetics.com') {
  return pill(text, { x: W / 2, y: 1500, size: 34, padX: 44, padY: 22, fill: C.rose }).svg;
}

// ---- Сутрин: „Денят днес“ ----
function morning(iso) {
  const s = sky(iso);
  const g = listGates()[s.sun.gate - 1];
  const ge = listGates()[s.earth.gate - 1];
  let y = 300;
  const eb = textBlock(dateLabel(iso).toUpperCase(), { x: W / 2, y, width: TW, size: 30, weight: 600, color: C.roseDeep, spacing: 4, anchor: 'middle' });
  y += 72;
  const title = `Слънцето е в портал ${g.number}`;
  const t = textBlock(title, { x: W / 2, y, width: TW, size: 84, family: 'Lora', weight: 600, color: C.ink, lineHeight: 1.08, anchor: 'middle' });
  y += t.height + 24;
  const k = textBlock(g.name, { x: W / 2, y, width: TW - 40, size: 42, family: 'LoraItalic', color: C.roseDeep, lineHeight: 1.3, anchor: 'middle', maxLines: 1 });
  y += k.height;
  // Бодиграфът: центърът на Слънцето (злато) и на Земята.
  const bgY = 965;
  // Центровете на Слънцето, Земята и Луната днес – картината се сменя всеки ден.
  const gm = listGates()[s.moon.gate - 1];
  const motif = T.bodygraphMotif({ cx: W / 2, cy: bgY, scale: 0.7, defined: [...new Set([g.centerKey, ge.centerKey, gm.centerKey])], channels: [] });
  const tag = pill(`Слънце ${g.number} · Земя ${ge.number} · Луна ${gm.number}`, { x: W / 2, y: bgY - 300, size: 28, padX: 30, padY: 16, fill: C.gold }).svg;
  // Три реда: Слънце, Луна, число на деня.
  const rows = [
    ['СЛЪНЦЕ', `в ${s.sunSign} · портал ${g.number}, линия ${s.sun.line}`],
    ['ЛУНА', `в ${s.moonSign} · ${s.phase} · портал ${s.moon.gate}`],
    ['ЧИСЛО НА ДЕНЯ', `${s.num} – ${DAY_NUM[s.num]}`],
  ];
  let ry = 1262;
  const rowsSvg = rows.map(([label, text]) => {
    const out = `<text x="${X}" y="${ry}" font-family="Inter" font-weight="600" font-size="26" letter-spacing="3" fill="${C.goldDeep}">${label}</text>
      <text x="${X}" y="${ry + 46}" font-family="Inter" font-weight="500" font-size="34" fill="${C.ink}">${esc(text)}</text>`;
    ry += 82;
    return out;
  }).join('');
  return {
    svg: svgDoc(W, H, `${background(W, H, { seed: Number(iso.slice(8)), glowY: 0.45 })}${brand(X, 230, { size: 36 })}${eb.svg}${t.svg}${k.svg}${motif}${tag}${rowsSvg}${footer('Виж своята карта · humanoetics.com')}`),
    meta: { sunGate: g.number, sunSign: s.sunSign, moonSign: s.moonSign, phase: s.phase, num: s.num, earthGate: ge.number },
  };
}

// ---- Вечер: списък с редове ----
function listStory({ eyebrow, title, sub, rows, dark = false, footerText = 'humanoetics.com', motif = null }) {
  let y = 300;
  const eb = textBlock(eyebrow.toUpperCase(), { x: W / 2, y, width: TW, size: 30, weight: 600, color: dark ? C.goldLight : C.roseDeep, spacing: 4, anchor: 'middle' });
  y += 72;
  const ts = fitSize(title, { family: 'Lora', weight: 600, width: TW, max: 76, min: 60, maxLines: 2 });
  const t = textBlock(title, { x: W / 2, y, width: TW, size: ts, family: 'Lora', weight: 600, color: dark ? '#FFF6EE' : C.ink, lineHeight: 1.08, anchor: 'middle' });
  y += t.height + 22;
  const s = sub ? textBlock(sub, { x: W / 2, y, width: TW - 40, size: 38, family: 'LoraItalic', color: dark ? C.goldLight : C.roseDeep, lineHeight: 1.3, anchor: 'middle' }) : { svg: '', height: 0 };
  y += s.height + 40;
  let rowsSvg = '';
  for (const [label, text] of rows) {
    const body = textBlock(text, { x: X + 32, y: y + 56, width: TW - 64, size: 31, color: dark ? '#F3E6DA' : C.inkSoft, lineHeight: 1.32 });
    const h = 56 + body.height + 24;
    rowsSvg += `<rect x="${X}" y="${y}" width="${TW}" height="${h}" rx="26" fill="${dark ? 'rgba(255,255,255,0.06)' : '#FFFFFF'}" stroke="${dark ? 'rgba(232,210,188,0.25)' : C.border}" stroke-width="2"/>
      <text x="${X + 32}" y="${y + 44}" font-family="Inter" font-weight="600" font-size="27" fill="${dark ? C.goldLight : C.goldDeep}">${esc(label)}</text>${body.svg}`;
    y += h + 14;
  }
  if (process.env.SIZES) console.log(Math.round(y), title);
  if (y > 1480) throw new Error(`Твърде много текст: ${title} (${Math.round(y)})`);
  const m = motif ? T.bodygraphMotif({ cx: W - 150, cy: 300, scale: 0.28, dark, opacity: 0.5, ...motif }) : '';
  return svgDoc(W, H, `${background(W, H, { dark, seed: 9, glowY: 0.3 })}${brand(X, 230, { dark, size: 36 })}${m}${eb.svg}${t.svg}${s.svg}${rowsSvg}${footer(footerText)}`);
}

const EVENING = {
  '2026-11-13': { id: 'movement', eyebrow: 'Тяло и движение', title: 'Каква тренировка ти пасва', sub: 'Според типа в Human Design', rows: [
    ['Генератор', 'Дълго и равномерно, с нещо, което обичаш. Спри, когато тялото каже „стига“.'],
    ['Манифестиращ генератор', 'Разнообразие и интервали. Смени спорта, щом ти доскучае.'],
    ['Прожектор', 'Кратко и с почивка: йога, пилатес, разходки. Без сравнение с другите.'],
    ['Манифестор', 'На изблици, когато дойде импулсът – сам/а или по свой план.'],
    ['Рефлектор', 'Различно всеки ден – най-добре сред природата и в добра компания.'],
  ] },
  '2026-11-15': { id: 'autumn-plate', eyebrow: 'Сезонът', title: 'Есенна чиния', sub: 'Ноември е време за бавни, топли храни.', rows: [
    ['Тиква', 'Печена с канела или като крем супа – най-есенният вкус.'],
    ['Нар', 'В салата, с кисело мляко или просто с лъжица.'],
    ['Орехи', 'Шепа като следобедна закуска вместо нещо сладко.'],
    ['Ябълки и дюли', 'Печени във фурната – десерт, който ухае на дом.'],
    ['Бавно', 'Хапни без телефон и забележи как се чувстваш след това. Тялото подсказва повече, отколкото мислиш.'],
  ] },
  '2026-11-16': { id: 'sleep', eyebrow: 'Почивка', title: 'Как да спиш според типа', sub: 'Сънят е част от дизайна ти.', dark: true, rows: [
    ['Генератор и МГ', 'Лягай уморен/а. Ако вечер не можеш да заспиш, денят не е изразходвал енергията ти.'],
    ['Прожектор', 'Лягай, преди да си изтощен/а. Половин час в леглото преди сън помага много.'],
    ['Манифестор', 'Отпусни се легнал/а, преди да ти се доспи – тялото има нужда да се успокои първо.'],
    ['Рефлектор', 'Спи сам/а поне понякога, за да „изчистиш“ чуждата енергия от деня.'],
  ] },
  '2026-11-18': { id: 'personal-day', eyebrow: 'Нумерология', title: 'Изчисли личния си ден', sub: 'Пример с рождена дата 17.04', rows: [
    ['1 · Лична година', 'Ден и месец на раждане + текущата година: 1+7+0+4 + 2+0+2+6 = 22 → 2+2 = 4'],
    ['2 · Личен месец', 'Добави месеца – ноември е 11 → 1+1 = 2. Така 4 + 2 = 6.'],
    ['3 · Личен ден', 'Добави деня – 18 → 1+8 = 9. Така 6 + 9 = 15 → 1+5 = 6.'],
    ['Твой ред', 'Направи същото с твоята дата. Числото 6 значи грижа, дом и близки – а твоето?'],
  ] },
  '2026-11-19': { id: 'evening-question', eyebrow: 'Въпрос за вечерта', title: 'Кое днес ти даде енергия?', sub: 'Слънцето е в портал 14 – енергията за работа, която обичаш.', motif: { defined: ['sacral'], channels: [] }, rows: [
    ['Запиши си', 'Три неща, които днес правеше с желание – и едно, което направи „защото трябва“.'],
    ['Генератори и МГ', 'Отговорът е в тялото: при кое имаше „ъхъ“ и при кое – тежест?'],
    ['Всички останали', 'Кое те остави спокоен/спокойна, а кое – изцеден/а?'],
  ] },
  '2026-11-20': { id: 'sagittarius', eyebrow: 'Астрология', title: 'Слънцето влиза в Стрелец', sub: 'На 22 ноември – след месец в Скорпион.', rows: [
    ['Скорпион', 'Дълбочина, интензитет, промяна отвътре.'],
    ['Стрелец', 'Смисъл, свобода, пътувания, учене.'],
    ['В Human Design', 'На същия ден Слънцето минава от портал 14 в портал 34 – Мощта.'],
    ['Как да го използваш', 'Добро време за нов план, курс или пътуване, на което тялото казва „да“.'],
  ] },
  '2026-11-21': { id: 'moon', eyebrow: 'Луната днес', title: '', sub: '', rows: [] }, // попълва се от небето
  '2026-11-22': { id: 'sunday', eyebrow: 'Неделя', title: 'Неделен ритуал според типа', sub: 'Почивката също е различна.', dark: true, rows: [
    ['Генератор', 'Нещо с ръцете – готвене, градина, ремонт. Почивка е да правиш това, което обичаш.'],
    ['Манифестиращ генератор', 'Две-три малки неща без план. Ако едно ти омръзне, мини на следващото.'],
    ['Прожектор', 'Истинска почивка без чувство за вина. Ти пазиш енергията за седмицата.'],
    ['Манифестор', 'Време насаме, без да отчиташ на никого какво правиш.'],
    ['Рефлектор', 'Ново място – парк, улица, кафене. Средата ще ти каже как си.'],
  ] },
};

function moonStory(iso) {
  const s = sky(iso);
  const g = listGates()[s.moon.gate - 1];
  return {
    id: 'moon', eyebrow: 'Луната днес', title: `Луната е в ${s.moonSign}`, sub: `${s.phase.charAt(0).toUpperCase() + s.phase.slice(1)} · портал ${g.number}, ${g.name}`,
    motif: { defined: [g.centerKey], channels: [] },
    rows: [
      ['В Human Design', 'Луната показва какво те движи. Тя минава през всички 64 портала за около 28 дни.'],
      ['Рефлектори', 'Вие усещате лунния цикъл най-силно – затова големите ви решения искат около месец.'],
      ['Тази вечер', `Темата е „${g.keyword.toLowerCase()}“. Забележи къде я усещаш днес.`],
    ],
  };
}

const [from, to] = [process.argv[2] || '2026-11-13', process.argv[3] || '2026-11-22'];
const items = [];
for (let d = new Date(`${from}T12:00:00Z`); d <= new Date(`${to}T12:00:00Z`); d = new Date(d.getTime() + 864e5)) {
  const iso = d.toISOString().slice(0, 10);
  const m = morning(iso);
  items.push({ id: `${SET}-${iso}-morning`, at: `${iso}T08:43:00+02:00`, type: 'story', media: [jpg(m.svg, `${iso}-1-morning.jpg`)], note: JSON.stringify(m.meta) });
  let ev = EVENING[iso];
  if (ev && ev.id === 'moon') ev = moonStory(iso);
  if (ev) items.push({ id: `${SET}-${iso}-evening-${ev.id}`, at: `${iso}T18:43:00+02:00`, type: 'story', media: [jpg(listStory(ev), `${iso}-3-evening-${ev.id}.jpg`)] });
}
// Обедните сторита „Порталът на деня“ стават „Опознай порталите“ – „денят“ вече е Слънцето.
for (const n of [59, 53, 34, 45, 48, 28, 62, 35]) {
  const svg = T.gateStory({ ...L.gateOfDay(n), footer: 'Имаш ли го в картата си?' }).replace('ПОРТАЛЪТ НА ДЕНЯ', 'ОПОЗНАЙ ПОРТАЛИТЕ');
  jpg(svg, `midday-gate-${n}.jpg`);
}
fs.writeFileSync(path.join(ROOT, 'drafts', `${SET}.json`), JSON.stringify(items, null, 2) + '\n');
console.log(`ok: ${items.length} сторита (сутрин + вечер), 8 обедни портала`);
