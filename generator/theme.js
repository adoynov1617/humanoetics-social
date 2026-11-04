// Тема „лого“ за визиите в Instagram: хартия, какао, нюд, мед.
// Сменя цветовете и фона на генератора от сайта САМО в този процес,
// без промени по сайта. Трябва да се зареди преди templates/reel.
const fs = require('fs');
const path = require('path');
const R = require('path').join(process.env.SHOP_DIR || require('path').join(__dirname, '..', '..', 'human-design-shop'), 'src', 'social') + '/';
const render = require(R + 'render');

Object.assign(render.C, {
  cream: '#F7EBE1', sand: '#EFDCCD', blush: '#EBD6C9',
  ink: '#5A3C37', inkSoft: '#6F524C', inkFaint: '#957A70',
  rose: '#8A5C58', roseDeep: '#7A4C49', roseLight: '#D8B9A9',
  gold: '#B88A62', goldDeep: '#8C6A4E', goldLight: '#E8D2BC',
  border: '#E3CDBE', plum: '#4E3532', plumSoft: '#5E4440',
});
const C = render.C;

render.background = function (w, h, { dark = false, seed = 1, glowY = 0.4 } = {}) {
  if (dark) {
    return `<rect width="${w}" height="${h}" fill="#4E3532"/>
    <defs><radialGradient id="glow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#B88A62" stop-opacity="0.22"/><stop offset="100%" stop-color="#B88A62" stop-opacity="0"/></radialGradient></defs>
    <circle cx="${w * 0.82}" cy="${h * glowY}" r="${w * 0.55}" fill="url(#glow)"/>`;
  }
  return `<rect width="${w}" height="${h}" fill="#F2E1D4"/>
  <defs><radialGradient id="glow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#F9EEE5" stop-opacity="0.9"/><stop offset="100%" stop-color="#F9EEE5" stop-opacity="0"/></radialGradient></defs>
  <circle cx="${w * 0.3}" cy="${h * glowY}" r="${w * 0.7}" fill="url(#glow)"/>`;
};

// Логото горе: малкият символ от логото + „Humanoetics“.
// Логото горе: символът от логото (векторен, без фон) + „Humanoetics“.
function symbolSvg(x, y, size, stroke, fill) {
  const k = size / 64;
  return `<g transform="translate(${x} ${y}) scale(${k})" fill="${fill}" stroke="${stroke}" stroke-width="2.4" stroke-linejoin="round">
    <path d="M32 7 L38 17 L26 17 Z"/><line x1="32" y1="17" x2="32" y2="55" stroke-width="2"/>
    <path d="M32 18 C 20 28, 15 40, 17 46 M32 18 C 44 28, 49 40, 47 46" fill="none" stroke-width="1.8"/>
    <rect x="28" y="19" width="8" height="8"/><path d="M32 29 L36.5 33.5 L32 38 L27.5 33.5 Z"/>
    <rect x="28" y="40" width="8" height="7"/><rect x="28" y="49" width="8" height="7"/>
    <path d="M14 38 L23 43.5 L14 49 Z"/><path d="M50 38 L41 43.5 L50 49 Z"/></g>`;
}
render.brand = function (x, y, { dark = false, size = 34 } = {}) {
  const s = size * 1.5;
  return `${symbolSvg(x - 6, y - s * 0.8, s, dark ? C.goldLight : C.roseDeep, dark ? 'rgba(232,210,188,0.18)' : '#EAD6C7')}
  <text x="${x + s + 4}" y="${y}" font-family="Lora" font-style="italic" font-size="${size}" fill="${dark ? C.goldLight : C.roseDeep}">Humanoetics</text>`;
};
render.symbolSvg = symbolSvg;

module.exports = render;

// Вместо четирилъчева звездичка – малък ромб (центърът G от бодиграфа).
render.sparkle = function (cx, cy, r, color = C.gold) {
  const d = r * 0.7;
  return `<polygon points="${cx},${cy - d} ${cx + d},${cy} ${cx},${cy + d} ${cx - d},${cy}" fill="${color}"/>`;
};
