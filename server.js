require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const root = process.cwd();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. Твои роуты (БЕЗ ИЗМЕНЕНИЙ)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cars', require('./routes/cars'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/admin', require('./routes/admin'));

// 2. Твоя статика (БЕЗ ИЗМЕНЕНИЙ, КАК ТЫ ХОТЕЛА)
app.use('/js', express.static(path.join(root, 'frontend/js')));
app.use('/css', express.static(path.join(root, 'frontend/css')));
app.use('/img', express.static(path.join(root, 'frontend/img')));
app.use(express.static(path.join(root, 'frontend')));

// 3. Главная страница (БЕЗ ИЗМЕНЕНИЙ)
app.get('/', (req, res) => {
  res.sendFile(path.join(root, 'frontend/pages/index.html'));
});

// 4. ТВОЙ БЛОК (ТОЛЬКО ИСПРАВИЛИ RETURN НА NEXT)
app.use((req, res, next) => {
  // Исправление здесь: если это API, мы просим сервер идти ДАЛЬШЕ к роутам
  if (req.path.startsWith('/api')) {
    return next(); 
  }

  const requestedPath = req.path.slice(1) || 'index';
  const filePath = path.join(root, 'frontend/pages', requestedPath + '.html');
  const indexInRoot = path.join(root, 'frontend/pages/index.html');

  res.sendFile(filePath, (err) => {
    if (err) {
      res.sendFile(indexInRoot);
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});