const express = require('express');
const router = express.Router();
const db = require('../backend/database');
const { authMiddleware, adminMiddleware } = require('../backend/middleware');

// Все машины с фильтрами
router.get('/', (req, res) => {
  const { category, transmission, fuel, minPrice, maxPrice } = req.query;

  let query = 'SELECT * FROM cars WHERE 1=1';
  const params = [];

  if (category) { query += ' AND category = ?'; params.push(category); }
  if (transmission) { query += ' AND transmission = ?'; params.push(transmission); }
  if (fuel) { query += ' AND fuel = ?'; params.push(fuel); }
  if (minPrice) { query += ' AND price_per_day >= ?'; params.push(minPrice); }
  if (maxPrice) { query += ' AND price_per_day <= ?'; params.push(maxPrice); }

  const cars = db.prepare(query).all(...params);
  res.json(cars);
});

// Одна машина
router.get('/:id', (req, res) => {
  const car = db.prepare('SELECT * FROM cars WHERE id = ?').get(req.params.id);
  if (!car) return res.status(404).json({ error: 'Машина не найдена' });
  res.json(car);
});

// Добавить машину (админ)
router.post('/', adminMiddleware, (req, res) => {
  const { brand, model, year, price_per_day, category, transmission, fuel, seats, image, description } = req.body;
  const result = db.prepare(`
    INSERT INTO cars (brand, model, year, price_per_day, category, transmission, fuel, seats, image, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(brand, model, year, price_per_day, category, transmission, fuel, seats, image, description);
  res.json({ id: result.lastInsertRowid, message: 'Машина добавлена' });
});

// Обновить машину (админ)
router.put('/:id', adminMiddleware, (req, res) => {
  const { brand, model, year, price_per_day, category, transmission, fuel, seats, image, description, available } = req.body;
  db.prepare(`
    UPDATE cars SET brand=?, model=?, year=?, price_per_day=?, category=?, transmission=?, fuel=?, seats=?, image=?, description=?, available=?
    WHERE id=?
  `).run(brand, model, year, price_per_day, category, transmission, fuel, seats, image, description, available, req.params.id);
  res.json({ message: 'Машина обновлена' });
});

// Удалить машину (админ)
router.delete('/:id', adminMiddleware, (req, res) => {
  db.prepare('DELETE FROM cars WHERE id = ?').run(req.params.id);
  res.json({ message: 'Машина удалена' });
});

module.exports = router;