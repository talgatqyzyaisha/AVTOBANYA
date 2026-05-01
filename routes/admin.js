const express = require('express');
const router = express.Router();
const db = require('../backend/database');
const { adminMiddleware } = require('../backend/middleware');

// Статистика
router.get('/stats', adminMiddleware, (req, res) => {
  const totalCars = db.prepare('SELECT COUNT(*) as count FROM cars').get();
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = "user"').get();
  const totalBookings = db.prepare('SELECT COUNT(*) as count FROM bookings').get();
  const totalRevenue = db.prepare(`
    SELECT SUM(total_price) as sum FROM bookings WHERE status = 'confirmed'
  `).get();
  const pendingBookings = db.prepare(`
    SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'
  `).get();

  res.json({
    totalCars: totalCars.count,
    totalUsers: totalUsers.count,
    totalBookings: totalBookings.count,
    totalRevenue: totalRevenue.sum || 0,
    pendingBookings: pendingBookings.count
  });
});

// Все пользователи
router.get('/users', adminMiddleware, (req, res) => {
  const users = db.prepare('SELECT id, name, email, phone, role, created_at FROM users').all();
  res.json(users);
});

// Удалить пользователя
router.delete('/users/:id', adminMiddleware, (req, res) => {
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ message: 'Пользователь удалён' });
});

module.exports = router;