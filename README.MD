 
Стек
Next.js 14 (App Router)
React 18, TypeScript 5
Tailwind CSS 4, tw-animate-css
Radix UI + кастомные UI-компоненты (папка `components/ui/`)
 Иконки: lucide-react, bootstrap-icons
 Prisma (локальная dev БД `prisma/dev.db`)
NextAuth (подключено в зависимостях, можно включить при необходимости)


 старт

1 Установите зависимости:
    pnpm: `pnpm install`
    npm: `npm install`
2 Запуск разработки:
    pnpm: `pnpm dev`
    npm: `npm run dev`

 Структура
 `app/` — маршруты (App Router), страницы и layout
 `components/` — UI и секции (вкл. вкладки `tabs/`)
 `hooks/` — React-хуки
 `lib/` — утилиты
 `prisma/` — локальная база `dev.db`
 `public/` — статические ресурсы
 `styles/` — глобальные стили
