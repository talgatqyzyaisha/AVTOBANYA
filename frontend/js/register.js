if (getToken()) window.location.href = 'index.html';

function checkStrength(val) {
  const bar = document.getElementById('strengthBar');
  const text = document.getElementById('strengthText');
  if (!bar) return;
  if (val.length === 0) { bar.style.width = '0'; text.textContent = ''; return; }
  if (val.length < 4) {
    bar.style.width = '30%'; bar.style.background = 'var(--danger)'; text.textContent = 'Слабый';
  } else if (val.length < 7) {
    bar.style.width = '60%'; bar.style.background = 'var(--warning, orange)'; text.textContent = 'Средний';
  } else {
    bar.style.width = '100%'; bar.style.background = 'var(--success)'; text.textContent = 'Сильный';
  }
}

async function handleRegister() {
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirm = document.getElementById('confirmPassword').value;

  if (!name || !email || !password) {
    showAlert('alertError', 'Заполните обязательные поля');
    return;
  }

  if (password !== confirm) {
    showAlert('alertError', 'Пароли не совпадают');
    return;
  }

  if (password.length < 6) {
    showAlert('alertError', 'Пароль минимум 6 символов');
    return;
  }

  const data = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, phone, email, password })
  });

  if (data.error) {
    showAlert('alertError', data.error);
    return;
  }

  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));

  showAlert('alertSuccess', 'Аккаунт создан! Перенаправляем...', 'success');
  setTimeout(() => { window.location.href = 'index.html'; }, 800);
}