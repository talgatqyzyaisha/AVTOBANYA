const API = 'http://localhost:3000/api';

function getToken() {
  return localStorage.getItem('token');
}


function getUser() {
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

function formatPrice(price) {
  return Number(price).toLocaleString('ru-RU') + ' ₸';
}

async function apiFetch(url, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(API + url, { ...options, headers });
  return res.json();
}

function renderNavbar() {
  const nav = document.getElementById('navActions');
  if (!nav) return;
  const user = getUser();
  if (user) {
    nav.innerHTML = `
      <a href="profile.html" class="btn btn-outline btn-sm">👤 ${user.name}</a>
      ${user.role === 'admin' ? '<a href="admin.html" class="btn btn-primary btn-sm">⚙️ Админ</a>' : ''}
    `;
  } else {
    nav.innerHTML = `
      <a href="login.html" class="btn btn-outline btn-sm">Войти</a>
      <a href="register.html" class="btn btn-primary btn-sm">Регистрация</a>
    `;
  }
}

function carEmoji(category) {
  const map = { 'Седан': '🚗', 'Внедорожник': '🚙', 'Кроссовер': '🚗', 'Хэтчбек': '🚘', 'Минивэн': '🚐' };
  return map[category] || '🚗';
}

function carCardHTML(car) {
  return `
    <div class="car-card" onclick="window.location='car-detail.html?id=${car.id}'" style="cursor:pointer;">
      <div class="car-card-img">${carEmoji(car.category)}</div>
      <div class="car-card-body">
        <div class="car-card-title">${car.brand} ${car.model}</div>
        <div class="car-card-year">${car.year} • ${car.category}</div>
        <div class="car-card-specs">
          <span>⚙️ ${car.transmission}</span>
          <span>⛽ ${car.fuel}</span>
          <span>💺 ${car.seats} мест</span>
        </div>
        <div class="car-card-footer">
          <div class="car-card-price">${formatPrice(car.price_per_day)}<span>/день</span></div>
          <button class="btn btn-primary btn-sm">Забронировать</button>
        </div>
      </div>
    </div>
  `;
}

function showAlert(id, msg, type = 'error') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.className = `alert alert-${type}`;
  el.style.display = 'block';
  if (type === 'success') setTimeout(() => { el.style.display = 'none'; }, 3000);
}

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

renderNavbar();