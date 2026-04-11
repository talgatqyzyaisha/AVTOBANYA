# 🚗 АВТО ПРОКАТ — Инструкция по запуску

## Требования
- Node.js версии 18 или выше → https://nodejs.org

## Запуск

1. Распакуй архив

2. Открой терминал и перейди в папку backend:
   cd backend

3. Установи зависимости:
   npm install

4. Запусти сервер:
   node server.js

5. Открой браузер и перейди по адресу:
   http://localhost:3000

## Тестовые аккаунты

Админ:
  Email:    admin@avto.kz
  Пароль:   admin123

## Возможные ошибки

Ошибка: "Cannot find module"
  → Убедись что ты в папке backend и выполнил npm install

Ошибка: "Port 3000 is already in use"
  → Измени PORT в файле .env на другой, например PORT=3001