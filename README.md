# Humanoetics · Instagram

Автоматично публикуване в Instagram за [@humanoetics](https://www.instagram.com/humanoetics/).

- `schedule/*.json` – графикът: кога, какво (`carousel`, `image`, `reel`, `story`), кои файлове и какъв текст.
- `media/` – визиите (JPEG) и рийлчетата (MP4). Instagram ги тегли от GitHub Pages.
- `state/published.json` – кое вече е публикувано (записва се автоматично).
- `scripts/publish.mjs` – публикуването през Instagram API.
- `generator/` – как се правят визиите (нужен е `human-design-shop` до това хранилище).

GitHub Actions проверява графика на всеки 15 минути и публикува каквото е наред. Публикация, закъсняла с повече от 12 часа, се пропуска.

## Настройка (еднократно)

1. **Settings → Pages**: Source „Deploy from a branch“, клон `main`, папка `/ (root)`.
2. **Settings → Secrets and variables → Actions → New repository secret**:
   - `IG_TOKEN` – системният ключ от Meta for Developers (Instagram API → Unified login). Не изтича.

## Ограничения на Instagram API

Не могат да се слагат музика, стикери (анкета, линк, въпрос), отметки на хора и продукти. Снимките са само JPEG. До 50 публикации за 24 часа.

## Ръчно пускане

**Actions → Публикуване в Instagram → Run workflow** публикува веднага всичко, на което му е дошло времето.
