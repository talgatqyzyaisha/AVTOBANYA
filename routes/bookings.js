const express = require('express');
const router = express.Router();
const db = require('../database');
const { authMiddleware, adminMiddleware } = require('../middleware');

// Мои бронирования
router.get('/my', authMiddleware, (req, res) => {
  const bookings = db.prepare(`
    SELECT b.*, c.brand, c.model, c.image, c.price_per_day
    FROM bookings b
    JOIN cars c ON b.car_id = c.id
    WHERE b.user_id = ?
    ORDER BY b.created_at DESC
  `).all(req.user.id);
  res.json(bookings);
});

// Все бронирования (админ)
router.get('/all', adminMiddleware, (req, res) => {
  const bookings = db.prepare(`
    SELECT b.*, c.brand, c.model, u.name as user_name, u.email as user_email
    FROM bookings b
    JOIN cars c ON b.car_id = c.id
    JOIN users u ON b.user_id = u.id
    ORDER BY b.created_at DESC
  `).all();
  res.json(bookings);
});

// Создать бронирование
router.post('/', authMiddleware, (req, res) => {
  const { car_id, start_date, end_date } = req.body;

  const car = db.prepare('SELECT * FROM cars WHERE id = ? AND available = 1').get(car_id);
  if (!car) return res.status(400).json({ error: 'Машина недоступна' });

  // Проверка пересечения дат
  const conflict = db.prepare(`
    SELECT * FROM bookings
    WHERE car_id = ? AND status != 'cancelled'
    AND NOT (end_date < ? OR start_date > ?)
  `).get(car_id, start_date, end_date);
  if (conflict) return res.status(400).json({ error: 'Машина уже забронирована на эти даты' });

  const days = Math.ceil((new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24));
  const total_price = days * car.price_per_day;

  const result = db.prepare(`
    INSERT INTO bookings (user_id, car_id, start_date, end_date, total_price)
    VALUES (?, ?, ?, ?, ?)
  `).run(req.user.id, car_id, start_date, end_date, total_price);

  res.json({ id: result.lastInsertRowid, total_price, message: 'Бронирование создано!' });
});

// Отменить бронирование
router.put('/:id/cancel', authMiddleware, (req, res) => {
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!booking) return res.status(404).json({ error: 'Бронирование не найдено' });

  db.prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?").run(req.params.id);
  res.json({ message: 'Бронирование отменено' });
});

// Изменить статус (админ)
router.put('/:id/status', adminMiddleware, (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ message: 'Статус обновлён' });
});

module.exports = router;