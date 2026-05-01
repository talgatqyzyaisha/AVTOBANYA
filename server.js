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

// 2. Статика (твои строки)
app.use('/js', express.static(path.join(root, 'frontend/js')));
app.use('/css', express.static(path.join(root, 'frontend/css')));
app.use('/img', express.static(path.join(root, 'frontend/img')));
app.use(express.static(path.join(root, 'frontend')));

// 3. Главная
app.get('/', (req, res) => {
  res.sendFile(path.join(root, 'frontend/pages/index.html'));
});

// 4. Тот самый блок, где была ошибка в скобках
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }

  const requestedPath = req.path.slice(1) || 'index';
  const filePath = path.join(root, 'frontend/pages', `${requestedPath}.html`);
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