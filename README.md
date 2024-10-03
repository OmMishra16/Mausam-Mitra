# Mausam Mitra

## Weather at Your Fingertips

Mausam Mitra helps you stay prepared for any weather, whether it's for daily plans or long trips.

## Solving User Needs

In today's fast-paced world, staying informed about weather conditions is crucial for planning daily activities, travel, and more. Mausam Mitra addresses this need by offering:

1. **Instant Weather Updates**: Get real-time weather information for any location worldwide.
2. **Comprehensive Data**: View current conditions, forecasts, and additional weather metrics all in one place.
3. **Favorite Locations**: Save and quickly access weather information for your frequently visited places.
4. **Visual Representations**: Understand weather trends easily with charts and icons.
5. **Weather Impact Insights**: Receive practical advice based on current weather conditions.
6. **Dark Mode**: Comfortable viewing in low-light conditions with a dark theme option.

## Project Overview

Mausam Mitra is a web-based application built using HTML, CSS, and JavaScript. It leverages the power of modern web technologies to deliver a smooth and responsive user experience.

### Key Features

1. **Current Weather Display**: 
   - Location name
   - Current temperature and "feels like" temperature
   - Weather description with an appropriate emoji
   - Additional metrics: wind speed, humidity, UV index
   - Sunrise and sunset times

2. **7-Day Forecast**: 
   - Daily temperature predictions
   - Weather condition icons

3. **Temperature Trend Chart**: 
   - Visual representation of temperature changes over the week

4. **Favorite Cities**: 
   - Add/remove cities to/from your favorites list
   - Quick access to weather information for saved locations

5. **City Search with Autocomplete**: 
   - Easy location search with suggestions as you type

6. **Weather Impact Assessment**: 
   - Personalized messages about how the current weather might affect daily activities

7. **Theme Toggle**: 
   - Switch between light and dark modes for comfortable viewing

### Technical Implementation

1. **API Integration**: 
   The app uses the WeatherAPI service for fetching weather data. The API key and endpoints are defined in the JavaScript file:

   ```javascript
   const API_KEY = 'f92c5f39587846cd93380735240310'; 
   const WEATHER_API_URL = 'https://api.weatherapi.com/v1/forecast.json';
   const AUTOCOMPLETE_API_URL = 'https://api.weatherapi.com/v1/search.json';
   ```

2. **Dynamic Content Updates**: 
   The app dynamically updates the DOM to display weather information. For example, the current weather update function:

   ```javascript
   function updateCurrentWeather(data) {
       const currentWeather = data.current;
       document.getElementById('location').textContent = `${data.location.name}, ${data.location.country}`;
       document.getElementById('temperature').textContent = `${Math.round(currentWeather.temp_c)}°C`;
       document.getElementById('feels-like').textContent = `Feels like: ${Math.round(currentWeather.feelslike_c)}°C`;
       document.getElementById('description').textContent = currentWeather.condition.text;
       document.getElementById('weather-icon').textContent = getWeatherEmoji(currentWeather.condition.code);
       document.getElementById('wind-speed').textContent = `${currentWeather.wind_kph} km/h`;
       document.getElementById('humidity').textContent = `${currentWeather.humidity}%`;
       document.getElementById('uv-index').textContent = currentWeather.uv;
       
       // Remove AQI display as it's not reliable
       document.getElementById('air-quality').parentElement.style.display = 'none';
       
       // Fix sunrise and sunset time display
       document.getElementById('sunrise-time').textContent = formatTime(data.forecast.forecastday[0].astro.sunrise);
       document.getElementById('sunset-time').textContent = formatTime(data.forecast.forecastday[0].astro.sunset);

       updateWeatherImpact(currentWeather);
       updateFavoriteButton(data.location.name);
   }
   ```

3. **Chart Implementation**: 
   The temperature trend chart is created using Chart.js library:

   ```javascript
   function updateChart(data) {
       const ctx = document.getElementById('temperatureChart').getContext('2d');
       const labels = data.forecast.forecastday.map(day => {
           const date = new Date(day.date);
           return date.toLocaleDateString('en-US', { weekday: 'short' });
       });
       const temperatures = data.forecast.forecastday.map(day => day.day.avgtemp_c);

       if (chartInstance) {
           chartInstance.destroy();
       }

       const isDarkTheme = document.body.classList.contains('dark-theme');
       const textColor = isDarkTheme ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';
       const gridColor = isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

       const gradient = ctx.createLinearGradient(0, 0, 0, 400);
       gradient.addColorStop(0, isDarkTheme ? 'rgba(52, 152, 219, 0.6)' : 'rgba(52, 152, 219, 0.2)');
       gradient.addColorStop(1, isDarkTheme ? 'rgba(52, 152, 219, 0.1)' : 'rgba(52, 152, 219, 0.05)');

       chartInstance = new Chart(ctx, {
           type: 'line',
           data: {
               labels: labels,
               datasets: [{
                   label: 'Temperature (°C)',
                   data: temperatures,
                   borderColor: 'rgb(52, 152, 219)',
                   backgroundColor: gradient,
                   tension: 0.4,
                   fill: true,
                   pointBackgroundColor: 'rgb(52, 152, 219)',
                   pointBorderColor: isDarkTheme ? '#fff' : '#000',
                   pointBorderWidth: 2,
                   pointRadius: 5,
                   pointHoverRadius: 7
               }]
           },
           options: {
               responsive: true,
               plugins: {
                   legend: {
                       display: false
                   },
                   tooltip: {
                       mode: 'index',
                       intersect: false,
                       backgroundColor: isDarkTheme ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                       titleColor: isDarkTheme ? '#fff' : '#000',
                       bodyColor: isDarkTheme ? '#fff' : '#000',
                       borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                       borderWidth: 1,
                       cornerRadius: 5,
                       padding: 10
                   }
               },
               scales: {
                   y: {
                       beginAtZero: false,
                       grid: {
                           color: gridColor,
                           drawBorder: false
                       },
                       ticks: {
                           color: textColor,
                           font: {
                               size: 12,
                               weight: 'bold'
                           }
                       }
                   },
                   x: {
                       grid: {
                           display: false
                       },
                       ticks: {
                           color: textColor,
                           font: {
                               size: 12,
                               weight: 'bold'
                           }
                       }
                   }
               }
           }
       });
   }
   ```

4. **Responsive Design**: 
   The CSS is structured to provide a responsive layout that adapts to different screen sizes:

   ```css
   @media (max-width: 768px) {
       .container {
           padding: 10px;
       }

       header {
           flex-direction: column;
           align-items: stretch;
       }

       .logo {
           margin-bottom: 20px;
       }

       .search-container {
           width: 100%;
       }

       .weather-info {
           flex-direction: column;
           text-align: center;
       }

       .weather-details {
           text-align: center;
           margin-top: 20px;
       }

       .additional-info {
           flex-wrap: wrap;
       }

       .info-item {
           width: 50%;
           margin-bottom: 15px;
       }
   }
   ```

5. **Local Storage**: 
   Favorite cities are stored in the browser's local storage for persistence:

   ```javascript
   function getFavoriteCities() {
       return JSON.parse(localStorage.getItem('favoriteCities')) || [];
   }

   function saveFavoriteCities(cities) {
       localStorage.setItem('favoriteCities', JSON.stringify(cities));
   }

   function updateFavoriteButton(cityName) {
       // Implementation details...
   }
   ```

## Getting Started

To run Mausam Mitra locally:

1. Clone the repository
2. Open `index.html` in a web browser
3. Ensure you have an active internet connection for API calls and external resources

Note: You'll need to provide your own API key from WeatherAPI to fetch weather data.

## Contributing

Contributions to Mausam Mitra are welcome! Please feel free to submit a Pull Request.


We hope Mausam Mitra becomes your go-to weather companion, providing you with the information you need to plan your day with confidence. Enjoy using Mausam Mitra!
