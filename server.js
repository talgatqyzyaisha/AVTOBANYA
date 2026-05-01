require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const root = process.cwd();

// --- БАЗОВЫЕ НАСТРОЙКИ ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 1. API РОУТЫ (Самый высокий приоритет) ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cars', require('./routes/cars'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/admin', require('./routes/admin'));

// --- 2. ПРОМЕЖУТОЧНЫЙ ФИЛЬТР ДЛЯ API ---
// Если запрос пришел на /api, но не сработал в роутах выше, 
// мы НЕ пускаем его дальше к статике, а сразу отдаем ошибку 404.
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Метод API не найден' });
});

// --- 3. СТАТИЧЕСКИЕ ФАЙЛЫ ---
app.use('/js', express.static(path.join(root, 'frontend/js')));
app.use('/css', express.static(path.join(root, 'frontend/css')));
app.use('/img', express.static(path.join(root, 'frontend/img')));
app.use(express.static(path.join(root, 'frontend')));

// --- 4. ГЛАВНАЯ СТРАНИЦА ---
app.get('/', (req, res) => {
  res.sendFile(path.join(root, 'frontend/pages/index.html'));
});

// --- 5. ОБРАБОТКА ВСЕХ ОСТАЛЬНЫХ ПУТЕЙ (HTML-страницы) ---
app.use((req, res) => {
  // Убираем начальный слэш (например, из "/login" получаем "login")
  const requestedPath = req.path.slice(1) || 'index';
  
  // Путь к файлу в папке frontend/pages
  const filePath = path.join(root, 'frontend/pages', `${requestedPath}.html`);
  const indexInRoot = path.join(root, 'frontend/pages/index.html');

  res.sendFile(filePath, (err) => {
    if (err) {
      // Если такого HTML-файла нет, отправляем главную страницу
      res.sendFile(indexInRoot);
    }
  });
});

// --- ЗАПУСК ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});