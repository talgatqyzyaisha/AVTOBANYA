require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const root = process.cwd();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. Роуты API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cars', require('./routes/cars'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/admin', require('./routes/admin'));

// 2. Статика
app.use(express.static(path.join(root, 'frontend')));

// 3. Главная
app.get('/', (req, res) => {
  res.sendFile(path.join(root, 'frontend/pages/index.html'));
});

// 4. Максимально простой обработчик БЕЗ звездочки, который не уронит сервер
app.use((req, res, next) => {
  // Если это API, просто выходим
  if (req.path.startsWith('/api')) {
    return next();
  }

  // Для всего остального пытаемся найти HTML файл
  const requestedPath = req.path.slice(1) || 'index';
  const filePath = path.join(root, 'frontend/pages', requestedPath + '.html');

  res.sendFile(filePath, (err) => {
    if (err) {
      // Если файла нет, кидаем на главную
      res.sendFile(path.join(root, 'frontend/pages/index.html'));
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});