require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

const root = process.cwd(); 

// Статические файлы (теперь ищем от корня проекта AVTO)
app.use(express.static(path.join(root, 'frontend')));
app.use('/js', express.static(path.join(root, 'frontend/js')));
app.use('/css', express.static(path.join(root, 'frontend/css')));
app.use('/img', express.static(path.join(root, 'frontend/img')));

// Роуты API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cars', require('./routes/cars'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/admin', require('./routes/admin'));

// Главная страница
app.get('/', (req, res) => {
  res.sendFile(path.join(root, 'frontend/pages/index.html'));
});

// Чтобы не было "Cannot GET" при перезагрузке страниц (например, /cars)
app.get('*', (req, res, next) => {
  if (!req.path.startsWith('/api')) {
    return res.sendFile(path.join(root, 'frontend/pages/index.html'));
  }
  next();
});
// --------------------------------

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен: http://localhost:${PORT}`);
});