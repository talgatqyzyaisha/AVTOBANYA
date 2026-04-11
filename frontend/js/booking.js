if (!getToken()) window.location.href = 'login.html';

let currentCar = null;

async function loadCar() {
  const id = getParam('id');
  if (!id) { window.location.href = 'cars.html'; return; }

  currentCar = await apiFetch('/cars/' + id);

  document.getElementById('summaryCarName').textContent = `${currentCar.brand} ${currentCar.model}`;
  document.getElementById('summaryCarCat').textContent = `${currentCar.year} • ${currentCar.category}`;
  document.getElementById('summaryCarEmoji').textContent = carEmoji(currentCar.category);
  document.getElementById('summaryDayPrice').textContent = formatPrice(currentCar.price_per_day);

  // Минимальная дата — сегодня
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('startDate').min = today;
  document.getElementById('endDate').min = today;

  // Предзаполнить имя и телефон из профиля
  const user = getUser();
  if (user) {
    document.getElementById('fullName').value = user.name || '';
  }
}

function calcTotal() {
  const start = document.getElementById('startDate').value;
  const end = document.getElementById('endDate').value;

  if (!start || !end || !currentCar) {
    document.getElementById('summaryDays').textContent = '—';
    document.getElementById('summaryTotal').textContent = '0 ₸';
    return;
  }

  const days = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));

  if (days <= 0) {
    showAlert('alertError', 'Дата окончания должна быть позже даты начала');
    document.getElementById('summaryDays').textContent = '—';
    document.getElementById('summaryTotal').textContent = '0 ₸';
    return;
  }

  document.getElementById('alertError').style.display = 'none';
  document.getElementById('summaryDays').textContent = days + ' дн.';
  document.getElementById('summaryTotal').textContent = formatPrice(days * currentCar.price_per_day);
}

async function handleBooking() {
  const start = document.getElementById('startDate').value;
  const end = document.getElementById('endDate').value;

  if (!start || !end) {
    showAlert('alertError', 'Выберите даты аренды');
    return;
  }

  const days = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
  if (days <= 0) {
    showAlert('alertError', 'Некорректные даты');
    return;
  }

  const data = await apiFetch('/bookings', {
    method: 'POST',
    body: JSON.stringify({ car_id: currentCar.id, start_date: start, end_date: end })
  });

  if (data.error) {
    showAlert('alertError', data.error);
    return;
  }

  // Шаги
  document.getElementById('step2').classList.add('active');
  document.getElementById('step3').classList.add('active');

  showAlert('alertError', '', 'error');
  document.querySelector('.booking-layout').innerHTML = `
    <div style="text-align:center;padding:60px 20px;grid-column:1/-1;">
      <div style="font-size:72px;margin-bottom:24px;">🎉</div>
      <h2 style="font-size:28px;font-weight:800;margin-bottom:12px;">Бронирование оформлено!</h2>
      <p style="color:var(--text-secondary);margin-bottom:8px;">
        ${currentCar.brand} ${currentCar.model} забронирован с ${start} по ${end}
      </p>
      <p style="font-size:20px;font-weight:700;color:var(--primary);margin-bottom:32px;">
        Итого: ${formatPrice(data.total_price)}
      </p>
      <div style="display:flex;gap:12px;justify-content:center;">
        <a href="profile.html" class="btn btn-primary">Мои бронирования</a>
        <a href="cars.html" class="btn btn-outline">В каталог</a>
      </div>
    </div>
  `;
}

loadCar();