if (!getToken()) window.location.href = '/login';

const user = getUser();

function initProfile() {
  if (!user) return;
  document.getElementById('profileName').textContent = user.name;
  document.getElementById('profileEmail').textContent = user.email;
  document.getElementById('profileAvatar').textContent = user.name[0].toUpperCase();
  document.getElementById('settingsName').value = user.name;
  document.getElementById('settingsEmail').value = user.email;
}

function showPanel(name, el) {
  document.querySelectorAll('.profile-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.profile-nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('panel-' + name).classList.add('active');
  el.classList.add('active');
}

async function loadBookings() {
  const list = document.getElementById('bookingsList');
  const data = await apiFetch('/bookings/my');

  if (!data.length) {
    list.innerHTML = `
      <div style="text-align:center;padding:60px 20px;color:var(--text-secondary);">
        <div style="font-size:48px;margin-bottom:16px;">📋</div>
        <p>У вас пока нет бронирований</p>
        <a href="/cars" class="btn btn-primary" style="margin-top:16px;">Выбрать авто</a>
      </div>
    `;
    return;
  }

  const statusMap = {
    'pending': ['🟡', 'Ожидает'],
    'confirmed': ['🟢', 'Подтверждено'],
    'cancelled': ['🔴', 'Отменено'],
    'completed': ['⚪', 'Завершено']
  };

  list.innerHTML = data.map(b => {
    const [icon, label] = statusMap[b.status] || ['⚪', b.status];
    return `
      <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:20px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;gap:16px;">
        <div style="font-size:36px;">${carEmoji(b.category || 'Седан')}</div>
        <div style="flex:1;">
          <div style="font-weight:700;font-size:16px;">${b.brand} ${b.model}</div>
          <div style="color:var(--text-secondary);font-size:13px;margin-top:4px;">
            📅 ${b.start_date} — ${b.end_date}
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-weight:700;font-size:16px;color:var(--primary);">${formatPrice(b.total_price)}</div>
          <div style="font-size:13px;margin-top:4px;">${icon} ${label}</div>
          ${b.status === 'pending' ? `<button class="btn btn-sm" style="margin-top:8px;background:var(--danger);color:#fff;" onclick="cancelBooking(${b.id})">Отменить</button>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

async function cancelBooking(id) {
  if (!confirm('Отменить бронирование?')) return;
  const data = await apiFetch('/bookings/' + id + '/cancel', { method: 'PUT' });
  if (data.message) loadBookings();
}

function saveSettings() {
  const name = document.getElementById('settingsName').value.trim();
  const phone = document.getElementById('settingsPhone').value.trim();
  if (!name) return;

  const updated = { ...user, name, phone };
  localStorage.setItem('user', JSON.stringify(updated));
  document.getElementById('profileName').textContent = name;
  document.getElementById('profileAvatar').textContent = name[0].toUpperCase();

  showAlert('settingsSuccess', 'Сохранено!', 'success');
}

initProfile();
loadBookings();