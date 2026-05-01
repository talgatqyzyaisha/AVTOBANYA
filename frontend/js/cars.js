let allCars = [];

async function loadCars() {
  const grid = document.getElementById('carsGrid');
  try {
    allCars = await apiFetch('/cars');

    // Применить параметры из URL если есть
    const params = new URLSearchParams(window.location.search);
    if (params.get('category')) {
      const checkboxes = document.querySelectorAll('input[type=checkbox]');
      checkboxes.forEach(cb => { if (cb.value === params.get('category')) cb.checked = true; });
    }
    if (params.get('maxPrice')) {
      document.getElementById('maxPrice').value = params.get('maxPrice');
    }

    applyFilters();
  } catch (e) {
    grid.innerHTML = '<p style="color:var(--text-secondary)">Ошибка загрузки</p>';
  }
}

function applyFilters() {
  const grid = document.getElementById('carsGrid');
  const countEl = document.getElementById('carsCount');

  const categories = [...document.querySelectorAll('.filter-options input[value="Седан"], .filter-options input[value="Внедорожник"], .filter-options input[value="Кроссовер"]')]
    .filter(cb => cb.checked).map(cb => cb.value);

  const transmissions = [...document.querySelectorAll('.filter-options input[value="Автомат"], .filter-options input[value="Механика"]')]
    .filter(cb => cb.checked).map(cb => cb.value);

  const fuels = [...document.querySelectorAll('.filter-options input[value="Бензин"], .filter-options input[value="Дизель"], .filter-options input[value="Электро"]')]
    .filter(cb => cb.checked).map(cb => cb.value);

  const minPrice = parseFloat(document.getElementById('minPrice')?.value) || 0;
  const maxPrice = parseFloat(document.getElementById('maxPrice')?.value) || Infinity;
  const sort = document.getElementById('sortSelect')?.value || 'default';

  let filtered = allCars.filter(car => {
    if (categories.length && !categories.includes(car.category)) return false;
    if (transmissions.length && !transmissions.includes(car.transmission)) return false;
    if (fuels.length && !fuels.includes(car.fuel)) return false;
    if (car.price_per_day < minPrice || car.price_per_day > maxPrice) return false;
    return true;
  });

  if (sort === 'price_asc') filtered.sort((a, b) => a.price_per_day - b.price_per_day);
  else if (sort === 'price_desc') filtered.sort((a, b) => b.price_per_day - a.price_per_day);
  else if (sort === 'year_desc') filtered.sort((a, b) => b.year - a.year);

  countEl.textContent = filtered.length;
  grid.innerHTML = filtered.length ? filtered.map(carCardHTML).join('') : '<p style="color:var(--text-secondary);padding:40px 0;">Ничего не найдено</p>';
}

function resetFilters() {
  document.querySelectorAll('.filter-options input[type=checkbox]').forEach(cb => cb.checked = false);
  document.getElementById('minPrice').value = '';
  document.getElementById('maxPrice').value = '';
  document.getElementById('sortSelect').value = 'default';
  applyFilters();
}

function carCardHTML(car) {
  if (!car) return '';

  const imagePath = car.image ? `../img/${car.image}` : "../img/default.png";

  return `
    <div class="car-card">
      <div class="car-card-img">
        <img src="${imagePath}" alt="${car.brand} ${car.model}" onerror="this.src='../img/default.png'">
      </div>
      <div class="car-card-info">
        <h3 class="car-title">${car.brand} ${car.model}</h3>
        <div class="car-subtitle">${car.year} • ${car.category}</div>
        
        <div class="car-features">
          <div class="feature">⚙️ ${car.transmission}</div>
          <div class="feature">⛽ ${car.fuel}</div>
          <div class="feature">👥 ${car.seats} мест</div>
        </div>

        <div class="car-footer">
          <div class="car-price">
            <span class="price-value">${car.price_per_day} ₸</span>
            <span class="price-period">/ день</span>
          </div>
          <a href="/car-detail?id=${car.id}" class="btn btn-primary">Забронировать</a>
        </div>
      </div>
    </div>
  `;
}

loadCars();