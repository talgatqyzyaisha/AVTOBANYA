require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const root = process.cwd(); // Тот самый корень проекта

app.use(cors());
app.use(express.json());

// 1. Статические файлы (строго по путям)
app.use('/js', express.static(path.join(root, 'frontend/js')));
app.use('/css', express.static(path.join(root, 'frontend/css')));
app.use('/img', express.static(path.join(root, 'frontend/img')));
app.use(express.static(path.join(root, 'frontend')));

// 2. Твои роуты API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cars', require('./routes/cars'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/admin', require('./routes/admin'));

// 3. Главная страница
app.get('/', (req, res) => {
  res.sendFile(path.join(root, 'frontend/pages/index.html'));
});

// 4. Обработка остальных путей (чтобы не было Cannot GET)
app.use((req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(root, 'frontend/pages/index.html'));
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});