// Публикува в Instagram всичко от schedule/*.json, на което му е дошло времето.
// Изпълнява се от GitHub Actions на всеки ~15 минути.
//
//   node scripts/publish.mjs            публикува (нужни: IG_TOKEN, MEDIA_BASE)
//   node scripts/publish.mjs --check    само проверява графика и файловете
//   node scripts/publish.mjs --verify   проба на ключа и GitHub Pages, без публикуване
//
// Instagram API (Unified login, системен ключ без срок): контейнер ->
// изчакване -> media_publish. Снимките и видеата трябва да са на публичен
// адрес (GitHub Pages).
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const API = process.env.IG_API || 'https://graph.facebook.com/v23.0';
const IG_USER_ID = process.env.IG_USER_ID || '17841466630713895'; // @humanoetics
const STATE = path.join(ROOT, 'state', 'published.json');
const LATE_LIMIT_H = 12; // по-стари пропуснати публикации не се пускат сами
const CHECK = process.argv.includes('--check');
const VERIFY = process.argv.includes('--verify') || process.env.VERIFY === 'true';

function loadSchedule() {
  const dir = path.join(ROOT, 'schedule');
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .flatMap((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')).map((it) => ({ ...it, file: f })));
}

// Проверка на графика: правила на Instagram и наличие на файловете.
function validate(items) {
  const errors = [];
  const ids = new Set();
  for (const it of items) {
    const where = `${it.file} → ${it.id}`;
    if (!it.id || ids.has(it.id)) errors.push(`${where}: липсващ или повторен id`);
    ids.add(it.id);
    if (Number.isNaN(Date.parse(it.at)) || !/[+-]\d\d:\d\d$|Z$/.test(it.at)) errors.push(`${where}: невалидна дата (трябва с часова зона): ${it.at}`);
    if (!['image', 'carousel', 'reel', 'story'].includes(it.type)) errors.push(`${where}: непознат тип ${it.type}`);
    const media = [...(it.media || []), ...(it.cover ? [it.cover] : [])];
    if (!it.media?.length) errors.push(`${where}: няма медия`);
    for (const m of media) {
      if (!fs.existsSync(path.join(ROOT, 'media', m))) errors.push(`${where}: липсва файл media/${m}`);
      if (!/\.(jpe?g|mp4|mov)$/i.test(m)) errors.push(`${where}: позволени са само JPEG и MP4: ${m}`);
    }
    if (it.type === 'carousel' && (it.media.length < 2 || it.media.length > 10)) errors.push(`${where}: каруселът е 2–10 слайда`);
    if (it.type !== 'carousel' && it.media?.length > 1) errors.push(`${where}: само един файл за ${it.type}`);
    if (it.type === 'reel' && !/\.(mp4|mov)$/i.test(it.media[0])) errors.push(`${where}: рийлът трябва да е видео`);
    if (it.caption) {
      if ([...it.caption].length > 2200) errors.push(`${where}: текстът е над 2200 знака`);
      if ((it.caption.match(/#[^\s#]+/g) || []).length > 30) errors.push(`${where}: над 30 хаштага`);
    }
    if (it.type === 'story' && it.caption) errors.push(`${where}: сторитата нямат текст под тях`);
  }
  return errors;
}

const TOKEN = process.env.IG_TOKEN;
const MEDIA_BASE = (process.env.MEDIA_BASE || '').replace(/\/$/, '');
const url = (m) => `${MEDIA_BASE}/media/${m.split('/').map(encodeURIComponent).join('/')}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(method, p, params = {}) {
  const body = new URLSearchParams({ ...params, access_token: TOKEN });
  const res = method === 'GET' ? await fetch(`${API}${p}?${body}`) : await fetch(`${API}${p}`, { method: 'POST', body });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) {
    const e = json.error || {};
    throw new Error(`${method} ${p}: ${e.message || res.status} (code ${e.code ?? '-'}, subcode ${e.error_subcode ?? '-'})`);
  }
  return json;
}

// Чака контейнерът да е готов (видеото се обработва до няколко минути).
async function waitReady(id, label) {
  for (let i = 0; i < 60; i++) {
    const { status_code: s, status } = await api('GET', `/${id}`, { fields: 'status_code,status' });
    if (s === 'FINISHED') return;
    if (s === 'ERROR' || s === 'EXPIRED') throw new Error(`${label}: контейнерът е ${s} (${status || 'без подробности'})`);
    await sleep(i < 6 ? 5000 : 10000);
  }
  throw new Error(`${label}: обработката не завърши навреме`);
}

// Instagram тегли файла сам - проверяваме предварително, че е достъпен.
async function assertPublic(m) {
  const res = await fetch(url(m), { method: 'HEAD' });
  if (!res.ok) throw new Error(`Файлът не е публичен (${res.status}): ${url(m)} – GitHub Pages включен ли е?`);
}

async function publish(userId, it) {
  for (const m of [...it.media, ...(it.cover ? [it.cover] : [])]) await assertPublic(m);
  let creation;
  if (it.type === 'carousel') {
    const children = [];
    for (const m of it.media) {
      const video = /\.(mp4|mov)$/i.test(m);
      const c = await api('POST', `/${userId}/media`, video ? { media_type: 'VIDEO', video_url: url(m), is_carousel_item: 'true' } : { image_url: url(m), is_carousel_item: 'true' });
      children.push(c.id);
    }
    for (const c of children) await waitReady(c, it.id);
    creation = (await api('POST', `/${userId}/media`, { media_type: 'CAROUSEL', children: children.join(','), caption: it.caption || '' })).id;
  } else if (it.type === 'reel') {
    const params = { media_type: 'REELS', video_url: url(it.media[0]), caption: it.caption || '', share_to_feed: 'true' };
    if (it.cover) params.cover_url = url(it.cover);
    creation = (await api('POST', `/${userId}/media`, params)).id;
  } else if (it.type === 'story') {
    const video = /\.(mp4|mov)$/i.test(it.media[0]);
    creation = (await api('POST', `/${userId}/media`, video ? { media_type: 'STORIES', video_url: url(it.media[0]) } : { media_type: 'STORIES', image_url: url(it.media[0]) })).id;
  } else {
    creation = (await api('POST', `/${userId}/media`, { image_url: url(it.media[0]), caption: it.caption || '' })).id;
  }
  await waitReady(creation, it.id);
  const { id } = await api('POST', `/${userId}/media_publish`, { creation_id: creation });
  const info = await api('GET', `/${id}`, { fields: 'permalink' }).catch(() => ({}));
  return { mediaId: id, permalink: info.permalink || null };
}

async function main() {
  const items = loadSchedule();
  const errors = validate(items);
  if (errors.length) {
    console.error('Грешки в графика:\n- ' + errors.join('\n- '));
    process.exit(1);
  }
  const state = JSON.parse(fs.readFileSync(STATE, 'utf8'));
  const done = new Set(state.map((s) => s.id));
  const now = Date.now();
  const pending = items.filter((it) => !done.has(it.id));
  console.log(`График: ${items.length} публикации, ${pending.length} предстоят.`);
  if (CHECK) {
    for (const it of pending) console.log(`  ${it.at}  ${it.type.padEnd(8)} ${it.id}`);
    return;
  }
  if (!TOKEN) throw new Error('Липсва IG_TOKEN (Settings → Secrets → Actions).');
  if (!MEDIA_BASE) throw new Error('Липсва MEDIA_BASE.');

  if (VERIFY) {
    // Проба без публикуване: ключ, профил, лимит и достъп до файловете.
    const me = await api('GET', `/${IG_USER_ID}`, { fields: 'username,media_count' });
    const lim = await api('GET', `/${IG_USER_ID}/content_publishing_limit`, { fields: 'quota_usage,config' });
    console.log(`Ключът работи. Профил: @${me.username}, публикации: ${me.media_count}.`);
    console.log(`Лимит: ${JSON.stringify(lim.data?.[0] || lim)}`);
    // Правата на ключа и Facebook страниците, до които има достъп.
    const perms = await api('GET', '/me/permissions').catch((e) => ({ error: e.message }));
    console.log(`Права: ${perms.data ? perms.data.filter((p) => p.status === 'granted').map((p) => p.permission).join(', ') : perms.error}`);
    const pages = await api('GET', '/me/accounts', { fields: 'id,name,tasks' }).catch((e) => ({ error: e.message }));
    console.log(`Страници: ${pages.data ? pages.data.map((p) => `${p.name} (${p.id}; ${(p.tasks || []).join('/')})`).join(', ') || 'няма' : pages.error}`);
    const sample = pending[0] || items[0];
    if (sample) {
      await assertPublic(sample.media[0]);
      console.log(`Файловете са публични: ${url(sample.media[0])}`);
    }
    return;
  }

  const due = pending.filter((it) => Date.parse(it.at) <= now);
  if (!due.length) {
    const next = pending.sort((a, b) => Date.parse(a.at) - Date.parse(b.at))[0];
    console.log(next ? `Нищо за публикуване. Следващо: ${next.at} (${next.id})` : 'Нищо за публикуване.');
    return;
  }
  const me = await api('GET', `/${IG_USER_ID}`, { fields: 'username' });
  console.log(`Профил: @${me.username}`);

  let failed = 0;
  for (const it of due.sort((a, b) => Date.parse(a.at) - Date.parse(b.at))) {
    const lateH = (now - Date.parse(it.at)) / 36e5;
    if (lateH > LATE_LIMIT_H) {
      console.log(`Пропуснато (закъсняло с ${lateH.toFixed(1)} ч.): ${it.id}`);
      state.push({ id: it.id, at: it.at, skipped: 'late', when: new Date().toISOString() });
      continue;
    }
    try {
      const r = await publish(IG_USER_ID, it);
      console.log(`Публикувано: ${it.id} → ${r.permalink || r.mediaId}`);
      state.push({ id: it.id, at: it.at, ...r, when: new Date().toISOString() });
    } catch (e) {
      failed++;
      console.error(`Грешка при ${it.id}: ${e.message}`);
    }
    fs.writeFileSync(STATE, JSON.stringify(state, null, 2) + '\n');
  }
  fs.writeFileSync(STATE, JSON.stringify(state, null, 2) + '\n');
  if (failed) process.exit(1);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
