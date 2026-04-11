async function loadPopularCars() {
  const grid = document.getElementById('popularCars');
  try {
    const cars = await apiFetch('/cars');
    const top = cars.slice(0, 3);
    grid.innerHTML = top.map(carCardHTML).join('');
  } catch (e) {
    grid.innerHTML = '<p style="color:var(--text-secondary)">Не удалось загрузить авто</p>';
  }
}

function searchCars() {
  const category = document.getElementById('searchCategory')?.value || '';
  const transmission = document.getElementById('searchTransmission')?.value || '';
  const maxPrice = document.getElementById('searchMaxPrice')?.value || '';
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (transmission) params.set('transmission', transmission);
  if (maxPrice) params.set('maxPrice', maxPrice);
  window.location.href = 'cars.html?' + params.toString();
}

loadPopularCars();