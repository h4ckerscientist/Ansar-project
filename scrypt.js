window.onload = function() {
    getLocation();
  };


  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          // Получаем город через обратный геокодинг
          const city = await getCityName(latitude, longitude);
          document.getElementById('city').textContent = city;
          
          // Получаем погоду
          getWeather(latitude, longitude, city);
          
          // Устанавливаем время
          updateTime();
        },
        (error) => {
          console.error("Ошибка геолокации:", error);
          getLocationByIP();
        }
      );
    } else {
      getLocationByIP();
    }
  }
  
  async function getCityName(lat, lon) {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const data = await response.json();
      return data.address.city || data.address.town || data.address.village || data.address.county;
    } catch (error) {
      console.error("Ошибка получения города:", error);
      return "Неизвестный город";
    }
  }
  
  async function getLocationByIP() {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      document.getElementById('city').textContent = data.city || "Неизвестный город";
      getWeather(data.latitude, data.longitude, data.city);
      updateTime();
    } catch (error) {
      console.error("Ошибка получения местоположения по IP:", error);
    }
  }

  async function getWeather(lat, lon, city) {
    const apiKey = '83fa5e074c657e1ed5b4ef64214e442f'; 
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ru`);
      const data = await response.json();
      
      const weatherInfo = `
        ${data.main.temp}°C 
      `;
      document.getElementById('weather').innerHTML = weatherInfo;
    } catch (error) {
      console.error("Ошибка получения погоды:", error);
      document.getElementById('weather').textContent = "Погода недоступна";
    }
  }

  function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
    
    document.getElementById('time').textContent = timeString;
    
    // Обновляем время каждую секунду
    setTimeout(updateTime, 1000);
  }


 function toggleFavorite(el) {
  const card = el.closest('.activity-card');
  const title = card.querySelector('h3').innerText;

  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

  const icon = el.querySelector('img');

  if (favorites.includes(title)) {
    favorites = favorites.filter(item => item !== title);
    icon.src = 'icons/star-outline.png';
  } else {
    favorites.push(title);
    icon.src = 'icons/star-filled.png';
  }

  localStorage.setItem('favorites', JSON.stringify(favorites));
}


// Сохранение активности в истории
function logActivity(title) {
  let history = JSON.parse(localStorage.getItem('history')) || [];
  history.push(`${title} — ${new Date().toLocaleString()}`);
  localStorage.setItem('history', JSON.stringify(history));
}

const histList = document.getElementById('historyList');
const history = JSON.parse(localStorage.getItem('history')) || [];

function renderHistory() {
  histList.innerHTML = '';
  history.slice().reverse().forEach((item, index) => {
    const li = document.createElement('li');
    li.style.display = 'flex';
    li.style.justifyContent = 'space-between';
    li.style.alignItems = 'center';
    li.style.marginBottom = '8px';

    const span = document.createElement('span');
    span.textContent = item;

    const delBtn = document.createElement('button');
    delBtn.textContent = '❌';
    delBtn.style.marginLeft = '10px';
    delBtn.style.border = 'none';
    delBtn.style.background = 'transparent';
    delBtn.style.cursor = 'pointer';
    delBtn.title = 'Удалить';

    delBtn.onclick = () => {
      history.splice(history.length - 1 - index, 1); // удалить нужный элемент
      localStorage.setItem('history', JSON.stringify(history));
      renderHistory();
    };

    li.appendChild(span);
    li.appendChild(delBtn);
    histList.appendChild(li);
  });
}

function clearHistory() {
  if (confirm('Очистить всю историю активностей?')) {
    localStorage.removeItem('history');
    history.length = 0;
    renderHistory();
  }
}

// рендер при загрузке
renderHistory();
