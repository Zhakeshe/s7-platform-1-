# Статус применения DESIGN.md по всему сайту

Дата обновления: 27 октября 2025

## ✅ ПОЛНОСТЬЮ ОБНОВЛЕНЫ (9 файлов)

### Глобальные стили
1. **app/globals.css** — все токены, утилити-классы (.card, .btn, .chip, .gradient-hero, .text-*, .bg-surface-*)

### Публичные страницы
2. **app/page.tsx** — логин/регистрация (уже использует bg-dots-pattern и токены)

### Dashboard
3. **app/dashboard/page.tsx** — header с токенами, моно-шрифты
4. **components/sidebar.tsx** — капсульная навигация, токены цветов

### Вкладки dashboard
5. **components/tabs/home-tab.tsx** — крупные заголовки "Продолжить *обучение*", .card, .chip, моно-метаданные
6. **components/tabs/clubs-tab.tsx** — "Мои *кружки*", .card формы, .btn
7. **components/tabs/courses-tab.tsx** — "Продолжить *обучение*", "Рекомендованные *курсы*", все карточки .card
8. **components/tabs/s7-tools-tab.tsx** — "Соревнования и *события*", .card
9. **components/tabs/masterclass-tab.tsx** — "Мастер*классы*", токены

## 🔄 ЧАСТИЧНО ОБНОВЛЕНЫ (1 файл)

10. **components/tabs/profile-tab.tsx** — main wrapper обновлён, карточки частично (нужны badge/метаданные)

## 📋 ТРЕБУЮТ ОБНОВЛЕНИЯ (16+ файлов)

### Dashboard вкладки
- [ ] **components/tabs/teams-tab.tsx**
- [ ] **components/tabs/bytesize-tab.tsx**
- [ ] **components/tabs/recommended-courses-tab.tsx**
- [ ] **components/tabs/course-details-tab.tsx**
- [ ] **components/tabs/course-lesson-tab.tsx**

### Админ-панель (11 файлов)
- [ ] **app/admin/page.tsx**
- [ ] **app/admin/courses/new/page.tsx**
- [ ] **app/admin/courses/new/[moduleId]/page.tsx**
- [ ] **app/admin/courses/new/[moduleId]/[lessonId]/page.tsx**
- [ ] **app/admin/courses/[id]/page.tsx**
- [ ] **app/admin/courses/[id]/analytics/page.tsx**
- [ ] **app/admin/courses/[id]/quiz/page.tsx**
- [ ] **app/admin/users/page.tsx**
- [ ] **app/admin/users/[id]/page.tsx**
- [ ] **app/admin/teams/new/page.tsx**
- [ ] **app/admin/teams/[id]/page.tsx**
- [ ] **app/admin/achievements/page.tsx**
- [ ] **app/admin/masterclass/new/page.tsx**
- [ ] **app/admin/masterclass/page.tsx**
- [ ] **app/admin/bytesize/new/page.tsx**

### Компоненты
- [ ] **components/admin/*.tsx** (если есть)
- [ ] **components/footer-social.tsx**
- [ ] **components/social-panel.tsx**

## 📊 Прогресс

- **Обновлено:** 10 из 25+ файлов (40%)
- **В работе:** 1 файл (4%)
- **Осталось:** 16+ файлов (56%)

## 🎯 Ключевые изменения (применены к обновлённым файлам)

### 1. Main wrapper всех страниц
```tsx
// БЫЛО: className="flex-1 p-4 md:p-8 overflow-y-auto animate-slide-up"
// СТАЛО:
className="flex-1 p-6 md:p-8 overflow-y-auto bg-dots-pattern relative z-10 max-w-[1400px] mx-auto"
```

### 2. Заголовки h2
```tsx
// БЫЛО: <h2 className="text-white text-xl font-medium mb-6">Заголовок</h2>
// СТАЛО:
<h2 className="text-[48px] md:text-[56px] leading-tight tracking-tight font-medium text-white mb-6 animate-fade-in-up">
  Часть <span className="italic text-[var(--color-accent-warm)]">акцент</span>
</h2>
```

### 3. Карточки
```tsx
// БЫЛО: className="bg-[#16161c] border border-[#636370]/20 rounded-2xl p-6 hover:border-[#636370]/40 ..."
// СТАЛО: className="card cursor-pointer group hover:scale-[1.01] animate-fade-in-up"
```

### 4. Бейджи/чипы
```tsx
// БЫЛО: className="bg-[#22c55e] text-black text-xs font-medium px-3 py-1 rounded-full"
// СТАЛО: className="chip"
```

### 5. Метаданные (моно-шрифт)
```tsx
// БЫЛО: <div className="text-[#a0a0b0] text-sm space-y-1">
// СТАЛО: <div className="font-mono text-xs text-3 space-y-1">
```

### 6. Анимации
```tsx
// БЫЛО: animate-slide-up, animationDelay: `${200 + i * 50}ms`
// СТАЛО: animate-fade-in-up, animationDelay: `${i * 100}ms`
```

## 🚀 Следующие шаги

### Быстрый способ (для оставшихся файлов)

1. **Teams, ByteSize, Course-Details** — применить тот же паттерн (3-4 файла)
2. **Админ-панель** — массово обновить все admin/** (11+ файлов)
3. **Компоненты UI** — footer, social-panel (2-3 файла)

### Автоматизация (VSCode Find & Replace)

Для каждого файла:
1. Ctrl+H в VSCode
2. Find: `className="flex-1 p-4 md:p-8 overflow-y-auto animate-slide-up"`
3. Replace: `className="flex-1 p-6 md:p-8 overflow-y-auto bg-dots-pattern relative z-10 max-w-[1400px] mx-auto"`
4. Повторить для карточек, бейджей, метаданных

## ✨ Что уже работает

Откройте dashboard и проверьте эти вкладки:
- ✅ **Главная** — крупные заголовки, пунктирные карточки, моно-метаданные
- ✅ **Курсы** — все карточки обновлены
- ✅ **Кружок** — форма и карточки в дизайне DESIGN.md
- ✅ **S7 Tools** — заголовок и карточки событий
- ✅ **Мастер классы** — заголовок обновлён
- ✅ **Навигация** — капсульные кнопки

Вы увидите:
- Крупные заголовки (48-56px) с курсивным акцентом (#F3E6A2)
- Карточки с пунктирными границами и hover-эффектом
- Моно-шрифт JetBrains Mono для метаданных
- Фоновый паттерн точек
- Плавные анимации fade-in-up

## 📝 Примечания

- Дизайн-токены полностью готовы в globals.css
- Все утилити-классы (.card, .btn, .chip) работают
- Админ-панель требует больше всего работы (11+ файлов)
- Некоторые компоненты (admin, footer) могут не требовать обновления, если не видны пользователю
