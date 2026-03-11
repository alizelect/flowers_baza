# Flowers Baza

Vue 3 SPA для отображения и редактирования прайса букетов с хранением в JSON.

## Требования

- Node.js 18+
- Chrome/Edge для прямой записи в JSON через File System Access API

## Установка

```bash
npm install
```

## Одноразовый импорт из Excel

```bash
npm run import:excel -- "C:/Users/user/Downloads/ЦЕНЫ МОНИКИ 11.2024.xlsx" "data/flowers.json"
```

Если путь не указан, используются значения по умолчанию.

## Запуск

```bash
npm run dev
```

## Публикация на GitHub Pages

В проекте уже есть workflow для автодеплоя на GitHub Pages.

1. Загрузите репозиторий на GitHub.
2. Убедитесь, что основная ветка называется `main`.
3. На GitHub откройте `Settings -> Pages`.
4. В разделе `Build and deployment` выберите `Source: GitHub Actions`.
5. Сделайте push в `main` - после этого GitHub сам соберет и опубликует сайт.

Адрес будет таким:

```text
https://<ваш-login>.github.io/<имя-репозитория>/
```

## Пароль редактирования

По умолчанию: `flowers123`.

Переопределение:

```bash
VITE_EDITOR_PASSWORD=your_password npm run dev
```

## Поведение сохранения

- Приложение открывает выбранный `flowers.json` и автосохраняет изменения.
- Handle файла сохраняется в IndexedDB.
- Если API недоступен, включается fallback в `localStorage`.
