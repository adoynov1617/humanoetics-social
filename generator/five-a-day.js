// По 5 сторита на ден (6 в дните с вечерна тема):
//   08:43  „Денят днес“ – Слънцето, Луната, числото на деня + бодиграф
//   11:13  „Опознай порталите“ (до 22.11 този слот е 09:13 от 2026-11-w2-3)
//   13:43  „Ти си мислиш / Дизайнът казва“
//   16:43  Въпрос А/Б/В – отговорите идват в личните съобщения
//   18:43  вечерна тема (само където има – от daily.js)
//   21:13  Отговорът на въпроса + сайтът
// Сайтът е на всяко стори. Стикери (линк, анкета) не стават през API.
//   node generator/five-a-day.js 2026-11-20 2026-11-29
require('./theme');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const SHOP = process.env.SHOP_DIR || path.join(__dirname, '..', '..', 'human-design-shop');
const R = path.join(SHOP, 'src', 'social') + '/';
const T = require(R + 'templates');
const L = require(R + 'library');
const { toPng } = require(R + 'render');
const daily = require('./daily');
const contrast = require('./contrast-stories');

const ROOT = path.join(__dirname, '..');
const SET = '2026-11-5aday';
const OUT = path.join(ROOT, 'media', SET);
fs.mkdirSync(OUT, { recursive: true });
const SITE = 'humanoetics.com';

function jpg(svg, name) {
  const tmp = path.join(OUT, name.replace(/\.jpg$/, '.png'));
  fs.writeFileSync(tmp, toPng(svg, 1080));
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', tmp, '-q:v', '2', path.join(OUT, name)]);
  fs.unlinkSync(tmp);
  return `${SET}/${name}`;
}

// Още „Ти си мислиш / Дизайнът казва“ (първите 5 са в contrast-stories.js).
const CONTRAST = [
  ...contrast.STORIES,
  ['adzhna', 'Отворена Аджна', { defined: [] }, '„Никога не съм сигурна в мнението си.“', 'Умът ти вижда нещата от много страни. Това е гъвкавост, не слабост.'],
  ['sarce', 'Отворено Сърце', { defined: [] }, '„Трябва да заслужа почивката си.“', 'Нямаш какво да доказваш. Почивката не се заслужава. Тя ти се полага.'],
  ['prozhektor', 'Прожектор', { defined: ['ajna', 'throat'] }, '„Другите издържат повече от мен.“', 'Не си създадена за осем часа поточна работа. Силата ти е в погледа, не в издръжливостта.'],
  ['emocionalen', 'Емоционален авторитет', { defined: ['solarplexus'] }, '„Не мога да реша веднага.“', 'И не трябва. Яснотата ти идва с времето. Преспи решението.'],
  ['liniya-2', 'Профил с линия 2', { defined: ['g'] }, '„Искам просто да ме оставят на мира.“', 'Втората линия има нужда от време насаме. Там зрее талантът, за който после те търсят.'],
];

// Въпроси с отговор вечерта. Отговорите на хората идват в личните съобщения.
const QUIZ = [
  { title: 'Колко типа има в Human Design?', options: ['3', '5', '9'], answer: 'Б · 5 типа', lines: ['Генератор и Манифестиращ генератор', 'Прожектор и Манифестор', 'Рефлектор, най-редкият'] },
  { title: 'Кой тип е най-рядък?', options: ['Манифестор', 'Рефлектор', 'Прожектор'], answer: 'Б · Рефлекторът', lines: ['Около 1 на 100 души', 'Всичките му центрове са отворени', 'Решава с лунния цикъл, за около месец'] },
  { title: 'Колко центъра има в бодиграфа?', options: ['7', '9', '12'], answer: 'Б · 9 центъра', lines: ['Не 7, като чакрите', 'Оцветените са постоянни', 'Белите поемат от другите'] },
  { title: 'Кой авторитет е най-чест?', options: ['Сакрален', 'Емоционален', 'Далачен'], answer: 'Б · Емоционалният', lines: ['Около половината хора го имат', 'Яснотата идва с времето', 'Правилото е „преспи го“'] },
  { title: 'Каква е стратегията на Прожектора?', options: ['Да информира', 'Да изчаква покана', 'Да отговаря'], answer: 'Б · Да изчаква покана', lines: ['Само за големите неща', 'Работа, връзка, дом', 'В ежедневието решава свободно'] },
  { title: 'Колко време преди раждането се смята Дизайнът?', options: ['9 дни', '40 дни', 'Около 88 дни'], answer: 'В · Около 88 дни', lines: ['Това е червената част в картата', 'Вродените, телесни черти', 'Черното е моментът на раждане'] },
  { title: 'Кой център дава работна енергия?', options: ['Гърлото', 'Сакралът', 'Главата'], answer: 'Б · Сакралът', lines: ['Дефиниран е при Генераторите и МГ', 'Отговаря с „ъхъ“ или „ъ-ъ“', 'Отвореният Сакрал не знае кога да спре'] },
  { title: 'Кое чувство е сигнал за Манифестора?', options: ['Горчивина', 'Гняв', 'Фрустрация'], answer: 'Б · Гневът', lines: ['Горчивината е на Прожектора', 'Фрустрацията е на Генератора', 'Лекът е да информираш преди действие'] },
  { title: 'Колко портала има в бодиграфа?', options: ['36', '64', '384'], answer: 'Б · 64 портала', lines: ['36 са каналите', '384 са линиите', 'Всеки портал е хексаграма от И Дзин'] },
  { title: 'Какво значи 4 в профил 4/6?', options: ['Опортюнист', 'Еретик', 'Изследовател'], answer: 'А · Опортюнист', lines: ['Възможностите идват през познати', 'Приятелството е основата', '6 е Ролевият модел'] },
];
const LETTERS = ['A', 'Б', 'В'];

// Портали за 11:13 от 23.11 (тези до 22.11 вече са в 2026-11-w2-3).
const GATES = [57, 27, 41, 63, 50, 7, 23, 47, 26, 54]; // с кратък текст, за да не застъпват бутона

const [from, to] = [process.argv[2] || '2026-11-20', process.argv[3] || '2026-11-29'];
const items = [];
const at = (iso, hm) => `${iso}T${hm}:00+02:00`;
let k = 0;
let gi = 0;
for (let d = new Date(`${from}T12:00:00Z`); d <= new Date(`${to}T12:00:00Z`); d = new Date(d.getTime() + 864e5), k++) {
  const iso = d.toISOString().slice(0, 10);
  const add = (slot, hm, svg) => items.push({ id: `${SET}-${iso}-${slot}`, at: at(iso, hm), type: 'story', media: [jpg(svg, `${iso}-${slot}.jpg`)] });

  add('1-den', '08:43', daily.morning(iso).svg);
  if (iso > '2026-11-22') {
    const n = GATES[gi++ % GATES.length];
    add(`2-portal-${n}`, '11:13', T.gateStory({ ...L.gateOfDay(n), footer: `Имаш ли го? ${SITE}` }).replace('ПОРТАЛЪТ НА ДЕНЯ', 'ОПОЗНАЙ ПОРТАЛИТЕ'));
  }
  const c = CONTRAST[k % CONTRAST.length];
  add(`3-misli-${c[0]}`, '13:43', contrast.story(c));
  const q = QUIZ[k % QUIZ.length];
  add('4-vapros', '16:43', T.quizStory({ eyebrow: 'Въпрос за деня', title: q.title, options: q.options.map((text, i) => ({ letter: LETTERS[i], text })), footer: 'Отговори ми с А, Б или В', seed: k + 3 }));
  let ev = daily.EVENING[iso];
  if (ev && ev.id === 'moon') ev = daily.moonStory(iso);
  if (ev && iso >= from) add(`5-vecher-${ev.id}`, '18:43', daily.listStory(ev));
  add('6-otgovor', '21:13', T.quizStory({ eyebrow: 'Отговорът', title: q.answer, options: q.lines.map((text, i) => ({ letter: String(i + 1), text })), footer: `Твоят дизайн · ${SITE}`, seed: k + 5 }));
}
const soon = Date.now() + 20 * 60e3;
for (let i = items.length - 1; i >= 0; i--) if (new Date(items[i].at) < soon) { fs.unlinkSync(path.join(ROOT, 'media', items[i].media[0])); items.splice(i, 1); }
fs.writeFileSync(path.join(ROOT, 'schedule', `${SET}.json`), JSON.stringify(items, null, 2) + '\n');
const perDay = items.reduce((m, i) => ((m[i.at.slice(0, 10)] = (m[i.at.slice(0, 10)] || 0) + 1), m), {});
console.log(`ok: ${items.length} сторита`, perDay);
