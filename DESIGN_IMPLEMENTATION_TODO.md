# План внедрения дизайна DESIGN.md по всему сайту

## ✅ Выполнено

1. **app/globals.css** - все дизайн-токены, утилити-классы (.card, .btn, .chip, .gradient-hero), анимации, фоновые паттерны
2. **components/tabs/home-tab.tsx** - крупные заголовки с курсивом, .card, .chip, моно-шрифты, bg-dots-pattern
3. **components/tabs/clubs-tab.tsx** - заголовки, .card, .btn, инпуты с токенами
4. **components/sidebar.tsx** - капсульные кнопки, токены цветов/границ, моно-подсказки
5. **app/dashboard/page.tsx** - header с токенами, моно-шрифты для даты
6. **components/tabs/courses-tab.tsx** - частично (заголовки, некоторые карточки)

## 🔄 В работе / Требуют обновления

### Приоритет 1 (основные вкладки)
- [ ] **components/tabs/courses-tab.tsx** - докончить карточки "Продолжить" и "Рекомендованные"
- [ ] **components/tabs/profile-tab.tsx** - заголовки, карточки профиля/достижений/команд
- [ ] **components/tabs/teams-tab.tsx** - заголовки, карточки команд, формы
- [ ] **components/tabs/course-details-tab.tsx** - детали курса
- [ ] **components/tabs/course-lesson-tab.tsx** - урок курса

### Приоритет 2 (дополнительные вкладки)
- [ ] **components/tabs/s7-tools-tab.tsx**
- [ ] **components/tabs/masterclass-tab.tsx**
- [ ] **components/tabs/bytesize-tab.tsx**
- [ ] **components/tabs/events-tab.tsx** (если есть)

### Приоритет 3 (админ-панель)
- [ ] **app/admin/page.tsx** - главная админки
- [ ] **app/admin/courses/** - все подстраницы курсов
- [ ] **app/admin/users/** - управление пользователями
- [ ] **app/admin/teams/** - управление командами
- [ ] **app/admin/achievements/** - награды
- [ ] **components/admin/*.tsx** - все компоненты админки

## Шаблон изменений (применить ко ВСЕМ страницам)

### 1. Обёртка main
```tsx
// БЫЛО:
<main className="flex-1 p-4 md:p-8 overflow-y-auto animate-slide-up">

// СТАЛО:
<main className="flex-1 p-6 md:p-8 overflow-y-auto bg-dots-pattern relative z-10 max-w-[1400px] mx-auto">
```

### 2. Заголовки h2
```tsx
// БЫЛО:
<h2 className="text-white text-xl font-medium mb-6">Заголовок</h2>

// СТАЛО:
<h2 className="text-[48px] md:text-[56px] leading-tight tracking-tight font-medium text-white mb-6 animate-fade-in-up">
  Часть <span className="italic text-[var(--color-accent-warm)]">акцент</span>
</h2>
```

### 3. Карточки
```tsx
// БЫЛО:
<div className="bg-[#16161c] border border-[#636370]/20 rounded-2xl p-6 hover:border-[#636370]/40 ...">

// СТАЛО:
<div className="card cursor-pointer group hover:scale-[1.01] animate-fade-in-up">
```

### 4. Бейджи/чипы
```tsx
// БЫЛО:
<span className="bg-[#22c55e] text-black text-xs font-medium px-3 py-1 rounded-full">

// СТАЛО:
<span className="chip">
```

### 5. Метаданные (моно-шрифт)
```tsx
// БЫЛО:
<div className="text-[#a0a0b0] text-sm space-y-1">
  <div>Автор: {author}</div>
</div>

// СТАЛО:
<div className="font-mono text-xs text-3 space-y-1">
  <div>автор: {author}</div>
</div>
```

### 6. Кнопки
```tsx
// БЫЛО:
<button className="rounded-full bg-[#00a3ff] hover:bg-[#0088cc] text-black px-5 py-2">

// СТАЛО:
<button className="btn bg-[#00a3ff] hover:bg-[#0088cc] text-black">
```

### 7. Инпуты
```tsx
// БЫЛО:
<input className="bg-[#16161c] border border-[#636370]/20 rounded-lg px-3 py-2" />

// СТАЛО:
<input className="bg-surface-2 border border-1 rounded-[var(--radius-md)] px-3 py-2 text-white outline-none focus:border-[var(--color-border-hover-1)] transition-colors" />
```

### 8. Анимации
```tsx
// БЫЛО:
className="... animate-slide-up"
style={{ animationDelay: `${200 + i * 50}ms` }}

// СТАЛО:
className="... animate-fade-in-up"
style={{ animationDelay: `${i * 100}ms` }}
```

## Цветовая замена (find & replace)

- `#16161c` → `bg-surface-1` или `var(--color-surface-1)`
- `#0f0f14` → `bg-surface-2` или `var(--color-surface-2)`
- `#636370]/20` → `border-1` или `var(--color-border-1)`
- `#a0a0b0` → `text-3` или `var(--color-text-3)`
- `#2a2a35` → `var(--color-border-2)`

## Приоритет реализации

1. Докончить основные вкладки (courses, profile, teams, course-details, course-lesson)
2. Обновить админ-панель и все её подстраницы
3. Дополнительные вкладки (s7-tools, masterclass, bytesize)
4. Все UI-компоненты (кнопки, инпуты, если еще не обновлены)
