const adminUser = getUser();
if (!adminUser || adminUser.role !== 'admin') window.location.href = '/';

function showAdminPanel(name, el) {
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.admin-nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('panel-' + name).classList.add('active');
  el.classList.add('active');
}

async function loadStats() {
  const data = await apiFetch('/admin/stats');
  document.getElementById('statCars').textContent = data.totalCars;
  document.getElementById('statUsers').textContent = data.totalUsers;
  document.getElementById('statBookings').textContent = data.totalBookings;
  document.getElementById('statRevenue').textContent = formatPrice(data.totalRevenue);
  document.getElementById('pendingBadge').textContent = data.pendingBookings;
}

async function loadBookings() {
  const data = await apiFetch('/bookings/all');
  const tbody = document.getElementById('bookingsTableBody');
  const statusMap = {
    'pending': '<span style="color:orange;">🟡 Ожидает</span>',
    'confirmed': '<span style="color:var(--success);">🟢 Подтверждено</span>',
    'cancelled': '<span style="color:var(--danger);">🔴 Отменено</span>',
    'completed': '<span style="color:var(--text-muted);">⚪ Завершено</span>'
  };

  tbody.innerHTML = data.map(b => `
    <tr>
      <td>#${b.id}</td>
      <td>${b.user_name}<br><small style="color:var(--text-muted)">${b.user_email}</small></td>
      <td>${b.brand} ${b.model}</td>
      <td>${b.start_date}<br>→ ${b.end_date}</td>
      <td style="font-weight:600;color:var(--primary);">${formatPrice(b.total_price)}</td>
      <td>${statusMap[b.status] || b.status}</td>
      <td>
        <select style="padding:4px 8px;border-radius:6px;border:1px solid var(--border);background:var(--bg-card);color:var(--text);font-size:12px;" onchange="updateStatus(${b.id}, this.value)">
          <option value="pending" ${b.status==='pending'?'selected':''}>Ожидает</option>
          <option value="confirmed" ${b.status==='confirmed'?'selected':''}>Подтвердить</option>
          <option value="completed" ${b.status==='completed'?'selected':''}>Завершить</option>
          <option value="cancelled" ${b.status==='cancelled'?'selected':''}>Отменить</option>
        </select>
      </td>
    </tr>
  `).join('');
}

async function updateStatus(id, status) {
  await apiFetch('/bookings/' + id + '/status', {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
  loadStats();
  loadBookings();
}

async function loadCarsTable() {
  const data = await apiFetch('/cars');
  const tbody = document.getElementById('carsTableBody');
  tbody.innerHTML = data.map(car => `
    <tr>
      <td>${carEmoji(car.category)} <strong>${car.brand} ${car.model}</strong><br><small style="color:var(--text-muted)">${car.year}</small></td>
      <td>${car.category}</td>
      <td style="font-weight:600;color:var(--primary);">${formatPrice(car.price_per_day)}</td>
      <td>${car.transmission}</td>
      <td>${car.available ? '<span style="color:var(--success)">✅ Доступна</span>' : '<span style="color:var(--danger)">❌ Занята</span>'}</td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="toggleAvailable(${car.id}, ${car.available})">
          ${car.available ? 'Снять' : 'Вернуть'}
        </button>
        <button class="btn btn-sm" style="background:var(--danger);color:#fff;margin-left:4px;" onclick="deleteCar(${car.id})">Удалить</button>
      </td>
    </tr>
  `).join('');
}

async function toggleAvailable(id, current) {
  const car = await apiFetch('/cars/' + id);
  await apiFetch('/cars/' + id, {
    method: 'PUT',
    body: JSON.stringify({ ...car, available: current ? 0 : 1 })
  });
  loadCarsTable();
}

async function deleteCar(id) {
  if (!confirm('Удалить этот автомобиль?')) return;
  await apiFetch('/cars/' + id, { method: 'DELETE' });
  loadCarsTable();
}

async function loadUsers() {
  const data = await apiFetch('/admin/users');
  const tbody = document.getElementById('usersTableBody');
  tbody.innerHTML = data.map(u => `
    <tr>
      <td><strong>${u.name}</strong></td>
      <td>${u.email}</td>
      <td>${u.phone || '—'}</td>
      <td>${u.role === 'admin' ? '👑 Админ' : '👤 Пользователь'}</td>
      <td>${new Date(u.created_at).toLocaleDateString('ru-RU')}</td>
      <td>
        ${u.role !== 'admin' ? `<button class="btn btn-sm" style="background:var(--danger);color:#fff;" onclick="deleteUser(${u.id})">Удалить</button>` : '—'}
      </td>
    </tr>
  `).join('');
}

async function deleteUser(id) {
  if (!confirm('Удалить пользователя?')) return;
  await apiFetch('/admin/users/' + id, { method: 'DELETE' });
  loadUsers();
  loadStats();
}

function showAddCarModal() {
  const modal = document.getElementById('carModal');
  modal.style.display = 'flex';
}

function closeCarModal() {
  document.getElementById('carModal').style.display = 'none';
}

async function addCar() {
  const data = await apiFetch('/cars', {
    method: 'POST',
    body: JSON.stringify({
      brand: document.getElementById('carBrand').value,
      model: document.getElementById('carModel').value,
      year: parseInt(document.getElementById('carYear').value),
      price_per_day: parseFloat(document.getElementById('carPrice').value),
      category: document.getElementById('carCategory').value,
      transmission: document.getElementById('carTransmission').value,
      fuel: document.getElementById('carFuel').value,
      seats: parseInt(document.getElementById('carSeats').value),
      description: document.getElementById('carDesc').value,
      image: ''
    })
  });

  if (data.id) {
    closeCarModal();
    loadCarsTable();
    loadStats();
  }
}

// Загрузить всё при старте
loadStats();
loadBookings();
loadCarsTable();
loadUsers();