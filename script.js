window.forecastChart = null;
let currentCity = "";
let currentCoords = null;

const inputBox=document.querySelector('.input-box');
const searchBtn=document.getElementById('searchBtn');
const weatherImg=document.querySelector('.weather-image');
const temperature=document.querySelector('.tempnum');
const description=document.querySelector('.description');
const humidity=document.querySelector('.humid-per');
const windSpeed=document.querySelector('.wind-speed');
const cloudiness=document.querySelector('.cloudiness');
const visibility=document.querySelector('.visibility');
const sunrise=document.querySelector('.sunrise');
const sunset=document.querySelector('.sunset');
const place=document.querySelector('.place');
const day=document.querySelector('.day');
const date=document.querySelector('.date');

const now=new Date();
const optionsDay = { weekday: 'long' };
const dayData = now.toLocaleDateString('en-US', optionsDay);
const optionsDate = { day: 'numeric', month: 'long', year: 'numeric' };
const dateData = now.toLocaleDateString('en-US', optionsDate);
day.innerHTML=dayData;
date.innerHTML=dateData;



async function fetchForecast(city) {
  const api_key ="5152fc69d256d6a7976680f91d5b2ba9";
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${api_key}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}


async function renderForecastChart(city) {
    
  document.querySelector(".graph").innerHTML = '<canvas id="forecastChart"></canvas>';
  const data = await fetchForecast(city);

  const seenDates = new Set();
  const dailyData = data.list.filter(item => {
    const dateStr = item.dt_txt.split(" ")[0];
    if (!seenDates.has(dateStr)) {
      seenDates.add(dateStr);
      return true;
    }
    return false;
  });

  const labels = dailyData.map(item => {
    const date = new Date(item.dt_txt);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  });

  const temps = dailyData.map(item => Math.round(item.main.temp - 273.15));

  if (window.forecastChart instanceof Chart) {
    window.forecastChart.destroy();
  }

  const ctx = document.getElementById('forecastChart').getContext('2d');

  const isDark = document.body.classList.contains('dark');
  const fontColor = isDark ? '#ffffff' : '#000000';
  const gridColor = isDark ? '#555555' : '#cccccc';
  const lineColor = isDark ? '#66b2ff' : '#0077ff';

  window.forecastChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Temperature (°C)',
        data: temps,
        borderColor: lineColor,
        backgroundColor: isDark ? 'rgba(102, 178, 255, 0.2)' : 'rgba(0, 119, 255, 0.2)',
        fill: true,
        tension: 0.3,
        pointRadius: 5,
        pointBackgroundColor: lineColor
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: fontColor
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: fontColor
          },
          grid: {
            color: gridColor
          }
        },
        y: {
          ticks: {
            color: fontColor
          },
          grid: {
            color: gridColor
          }
        }
      }
    }
  });
}



async function checkWeather(city){
    currentCity = city;
    currentCoords = null;

    const api_key = "5152fc69d256d6a7976680f91d5b2ba9";
    const url=`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api_key}`;

    const weather_data=await fetch(`${url}`).then(response=>response.json());

        console.log(weather_data);
        if (weather_data.cod === '404') {
        temperature.innerHTML = "-";
        description.innerHTML = "";
        humidity.innerHTML = "-";
        windSpeed.innerHTML = "-";
        cloudiness.innerHTML = "-";
        visibility.innerHTML = "-";
        sunrise.innerHTML = "-";
        sunset.innerHTML = "-";
        place.innerHTML = "Location Not Found";
        weatherImg.src = "assets/404.png";

        if (window.forecastChart instanceof Chart) {
            window.forecastChart.destroy();
        }

        document.querySelector(".graph").innerHTML = "<div style='padding: 20px; font-size: 18px;'>No forecast available.</div>";

        return;
    }

    temperature.innerHTML=`${Math.round(weather_data.main.temp-273.15)}`;
    description.innerHTML=`${weather_data.weather[0].description}`;
    humidity.innerHTML=`${weather_data.main.humidity} %`;
    windSpeed.innerHTML=`${weather_data.wind.speed} km/hr`;
    cloudiness.innerHTML=`${weather_data.clouds.all} %`;
    visibility.innerHTML=`${weather_data.visibility} m`;
    const sunriseDate=new Date(weather_data.sys.sunrise *1000);
    const sunriseTime = sunriseDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    sunrise.innerHTML=sunriseTime;
    const sunsetDate=new Date(weather_data.sys.sunset *1000);
    const sunsetTime = sunsetDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    sunset.innerHTML=sunsetTime;

    place.innerHTML=`${weather_data.name}, ${weather_data.sys.country}`;

    switch(weather_data.weather[0].main){
        case 'Clouds': weatherImg.src = "assets/cloud.png";
        break;
        case 'Clear': weatherImg.src = "assets/clear.png";
        break;
        case 'Rain': weatherImg.src = "assets/rain.png";
        break;
        case 'Mist': weatherImg.src = "assets/mist.png";
        break;
        case 'Snow': weatherImg.src = "assets/snow.png";
        break;


    }

    
renderForecastChart(city);
}






searchBtn.addEventListener('click',()=>{
    checkWeather(inputBox.value);
});

const toggleTheme = document.getElementById('toggleTheme');

if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
  toggleTheme.checked = true;
} else {
  document.body.classList.remove('dark');
  toggleTheme.checked = false;
}

toggleTheme.addEventListener('change', () => {
  if (toggleTheme.checked) {
    document.body.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.body.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }

  
  if (currentCity) {
    renderForecastChart(currentCity);
  } else if (currentCoords) {
    renderForecastChartByCoords(currentCoords.lat, currentCoords.lon);
  } else {
    renderForecastChart("Mumbai"); 
  }
});




async function checkWeatherByCoords(lat, lon) {
    currentCoords = { lat, lon };
    currentCity = "";

  const api_key = "5152fc69d256d6a7976680f91d5b2ba9";
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}`;

  const weather_data = await fetch(url).then(response => response.json());
  console.log(weather_data);

  if (weather_data.cod === '404') {
    temperature.innerHTML = "-";
    description.innerHTML = "";
    humidity.innerHTML = "-";
    windSpeed.innerHTML = "-";
    cloudiness.innerHTML = "-";
    visibility.innerHTML = "-";
    sunrise.innerHTML = "-";
    sunset.innerHTML = "-";
    place.innerHTML = "Location Not Found";
    weatherImg.src = "assets/404.png";
    document.querySelector(".graph").innerHTML = "<div style='padding: 20px; font-size: 18px;'>No forecast available.</div>";
    return;
  }

  temperature.innerHTML = `${Math.round(weather_data.main.temp - 273.15)}`;
  description.innerHTML = `${weather_data.weather[0].description}`;
  humidity.innerHTML = `${weather_data.main.humidity} %`;
  windSpeed.innerHTML = `${weather_data.wind.speed} km/hr`;
  cloudiness.innerHTML = `${weather_data.clouds.all} %`;
  visibility.innerHTML = `${weather_data.visibility} m`;
  const sunriseDate = new Date(weather_data.sys.sunrise * 1000);
  const sunriseTime = sunriseDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  sunrise.innerHTML = sunriseTime;
  const sunsetDate = new Date(weather_data.sys.sunset * 1000);
  const sunsetTime = sunsetDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  sunset.innerHTML = sunsetTime;

  place.innerHTML = `${weather_data.name}, ${weather_data.sys.country}`;

  switch(weather_data.weather[0].main){
    case 'Clouds': weatherImg.src = "assets/cloud.png"; break;
    case 'Clear': weatherImg.src = "assets/clear.png"; break;
    case 'Rain': weatherImg.src = "assets/rain.png"; break;
    case 'Mist': weatherImg.src = "assets/mist.png"; break;
    case 'Snow': weatherImg.src = "assets/snow.png"; break;
  }
}


async function renderForecastChartByCoords(lat, lon) {
  document.querySelector(".graph").innerHTML = '<canvas id="forecastChart"></canvas>';
  const api_key = "5152fc69d256d6a7976680f91d5b2ba9";
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api_key}`;
  const response = await fetch(url);
  const data = await response.json();
    
  const seenDates = new Set();
  const dailyData = data.list.filter(item => {
    const dateStr = item.dt_txt.split(" ")[0];
    if (!seenDates.has(dateStr)) {
      seenDates.add(dateStr);
      return true;
    }
    return false;
  });

  const labels = dailyData.map(item => {
    const date = new Date(item.dt_txt);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  });

  const temps = dailyData.map(item => Math.round(item.main.temp - 273.15));

  if (window.forecastChart instanceof Chart) {
    window.forecastChart.destroy();
  }

  const ctx = document.getElementById('forecastChart').getContext('2d');
  const isDark = document.body.classList.contains('dark');
  const fontColor = isDark ? '#ffffff' : '#000000';
  const gridColor = isDark ? '#555555' : '#cccccc';
  const lineColor = isDark ? '#66b2ff' : '#0077ff';

  window.forecastChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Temperature (°C)',
        data: temps,
        borderColor: lineColor,
        backgroundColor: isDark ? 'rgba(102, 178, 255, 0.2)' : 'rgba(0, 119, 255, 0.2)',
        fill: true,
        tension: 0.3,
        pointRadius: 5,
        pointBackgroundColor: lineColor
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: fontColor } }
      },
      scales: {
        x: { ticks: { color: fontColor }, grid: { color: gridColor } },
        y: { ticks: { color: fontColor }, grid: { color: gridColor } }
      }
    }
  });
}

window.addEventListener('load', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        await checkWeatherByCoords(lat, lon);
        await renderForecastChartByCoords(lat, lon);
      },
      (error) => {
        console.error(error);
        checkWeather("Mumbai");
        renderForecastChart("Mumbai");
      }
    );
  } else {
    checkWeather("Mumbai");
    renderForecastChart("Mumbai");
  }
});
