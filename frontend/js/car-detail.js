async function loadCarDetail() {
  const id = getParam('id');
  const content = document.getElementById('carDetailContent');

  if (!id) {
    content.innerHTML = '<p>Машина не найдена</p>';
    return;
  }

  try {
    const car = await apiFetch('/cars/' + id);
    
    const imagePath = car.image ? `../img/${car.image}` : `../img/default.png` ;

    content.innerHTML = `
      <div class="container" style="padding:40px 20px;">
        <a href="/cars" style="color:var(--primary);text-decoration:none;font-size:14px;">← Назад в каталог</a>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:32px;">
          
          <!-- ЛЕВАЯ КОЛОНКА С ФОТО -->
          <div>
            <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;height:400px;display:flex;align-items:center;justify-content:center;">
              <img src="${imagePath}" alt="${car.brand}" 
                   style="width:100%; height:100%; object-fit:cover;" 
                   onerror="this.src='../img/default.png'">
            </div>
          </div>

          <!-- ПРАВАЯ КОЛОНКА С ИНФО -->
          <div>
            <div style="font-size:13px;color:var(--primary);font-weight:600;margin-bottom:8px;">${car.category}</div>
            <h1 style="font-size:32px;font-weight:800;margin-bottom:8px;">${car.brand} ${car.model}</h1>
            <div style="color:var(--text-secondary);margin-bottom:24px;">${car.year} год</div>

            <p style="color:var(--text-secondary);margin-bottom:24px;line-height:1.6;">${car.description || 'Отличный автомобиль для любых поездок.'}</p>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:32px;">
              <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:16px;">
                <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">КПП</div>
                <div style="font-weight:600;">⚙️ ${car.transmission}</div>
              </div>
              <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:16px;">
                <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">Топливо</div>
                <div style="font-weight:600;">⛽ ${car.fuel}</div>
              </div>
              <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:16px;">
                <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">Мест</div>
                <div style="font-weight:600;">💺 ${car.seats}</div>
              </div>
              <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:16px;">
                <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">Доступность</div>
                <div style="font-weight:600;">${car.available ? '✅ Доступна' : '❌ Занята'}</div>
              </div>
            </div>

            <div style="display:flex;align-items:center;gap:20px;padding:20px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);">
              <div>
                <div style="font-size:28px;font-weight:800;color:var(--primary);">${formatPrice(car.price_per_day)}</div>
                <div style="font-size:13px;color:var(--text-secondary);">в день</div>
              </div>
              <button class="btn btn-primary" style="flex:1;justify-content:center;" onclick="goBook(${car.id})">
                Забронировать →
              </button>
            </div>
          </div>

        </div>
      </div>
    `;
  } catch (e) {
    content.innerHTML = '<p style="padding:40px;color:var(--text-secondary);">Ошибка загрузки</p>';
  }
}

function goBook(carId) {
  if (!getToken()) {
    window.location.href = '/login';
    return;
  }
  window.location.href = '/booking?id=' + carId;
}

loadCarDetail();