// Если уже залогинен — редирект
if (getToken()) window.location.href = '/';

async function handleLogin() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const btn = document.getElementById('loginBtn');

  if (!email || !password) {
    showAlert('alertError', 'Заполните все поля');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Вход...';

  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });

  if (data.error) {
    showAlert('alertError', data.error);
    btn.disabled = false;
    btn.textContent = 'Войти →';
    return;
  }

  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));

  showAlert('alertSuccess', 'Успешно! Перенаправляем...', 'success');

  setTimeout(() => {
    window.location.href = data.user.role === 'admin' ? '/admin' : '/';
  }, 800);
}

// Enter для отправки
document.addEventListener('keydown', e => {
  if (e.key === 'Enter') handleLogin();
});