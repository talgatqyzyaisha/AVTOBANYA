const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'db', 'avto.sqlite'));

// Включаем внешние ключи
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Создание таблиц
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS cars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    price_per_day REAL NOT NULL,
    category TEXT NOT NULL,
    transmission TEXT NOT NULL,
    fuel TEXT NOT NULL,
    seats INTEGER NOT NULL,
    image TEXT,
    description TEXT,
    available INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    car_id INTEGER NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    total_price REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (car_id) REFERENCES cars(id)
  );
`);

// Добавляем тестовые машины если таблица пустая
const carsCount = db.prepare('SELECT COUNT(*) as count FROM cars').get();
if (carsCount.count === 0) {
  const insert = db.prepare(`
    INSERT INTO cars (brand, model, year, price_per_day, category, transmission, fuel, seats, image, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insert.run('Toyota', 'Camry', 2022, 15000, 'Седан', 'Автомат', 'Бензин', 5, 'camry.jpg', 'Комфортный седан бизнес-класса');
  insert.run('BMW', 'X5', 2023, 35000, 'Внедорожник', 'Автомат', 'Бензин', 5, 'bmw_x5.jpg', 'Премиальный внедорожник');
  insert.run('Hyundai', 'Elantra', 2021, 10000, 'Седан', 'Автомат', 'Бензин', 5, 'elantra.jpg', 'Экономичный и надёжный седан');
  insert.run('Mercedes', 'GLE', 2023, 40000, 'Внедорожник', 'Автомат', 'Бензин', 5, 'gle.jpg', 'Роскошный внедорожник');
  insert.run('Kia', 'Sportage', 2022, 18000, 'Кроссовер', 'Автомат', 'Бензин', 5, 'sportage.jpg', 'Стильный городской кроссовер');
  insert.run('Lada', 'Vesta', 2021, 6000, 'Седан', 'Механика', 'Бензин', 5, 'vesta.jpg', 'Бюджетный и практичный вариант');
}

// Добавляем админа если нет
const bcrypt = require('bcryptjs');
const adminExists = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get();
if (adminExists.count === 0) {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.prepare(`
    INSERT INTO users (name, email, password, role)
    VALUES ('Admin', 'admin@avto.kz', ?, 'admin')
  `).run(hashedPassword);
}

console.log('✅ База данных готова!');

module.exports = db;