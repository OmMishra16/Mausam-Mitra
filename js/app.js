const API_KEY = 'f92c5f39587846cd93380735240310'; 
const WEATHER_API_URL = 'https://api.weatherapi.com/v1/forecast.json';
const AUTOCOMPLETE_API_URL = 'https://api.weatherapi.com/v1/search.json';

let chartInstance = null;

async function getWeatherData(query) {
    const url = `${WEATHER_API_URL}?key=${API_KEY}&q=${query}&days=7&aqi=no&alerts=no`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized: Please check your API key');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
}

async function getLocationSuggestions(query) {
    const url = `${AUTOCOMPLETE_API_URL}?key=${API_KEY}&q=${query}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching location suggestions:', error);
        return [];
    }
}



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
    

    document.getElementById('air-quality').parentElement.style.display = 'none';
    
 
    document.getElementById('sunrise-time').textContent = formatTime(data.forecast.forecastday[0].astro.sunrise);
    document.getElementById('sunset-time').textContent = formatTime(data.forecast.forecastday[0].astro.sunset);

    updateWeatherImpact(currentWeather);
    updateFavoriteButton(data.location.name);
}

function formatTime(timeString) {
    const [time, period] = timeString.split(' ');
    return `${time} ${period}`;
}

function updateWeatherImpact(weather) {
    const impactElement = document.getElementById('weather-impact');
    let impactMessage = '';
    let impactIcon = '';
    let impactClass = '';

    if (weather.temp_c > 30) {
        impactMessage = 'High temperatures may cause discomfort. Stay hydrated and seek shade.';
        impactIcon = '🌡️';
        impactClass = 'impact-hot';
    } else if (weather.temp_c < 5) {
        impactMessage = 'Cold temperatures. Bundle up and be cautious of icy conditions.';
        impactIcon = '❄️';
        impactClass = 'impact-cold';
    } else if (weather.wind_kph > 40) {
        impactMessage = 'Strong winds may affect outdoor activities. Take care when outside.';
        impactIcon = '💨';
        impactClass = 'impact-windy';
    } else if (weather.humidity > 80) {
        impactMessage = 'High humidity may cause discomfort. Stay cool and hydrated.';
        impactIcon = '💧';
        impactClass = 'impact-humid';
    } else if (weather.uv > 7) {
        impactMessage = 'High UV index. Protect your skin when outdoors.';
        impactIcon = '🥵';
        impactClass = 'impact-uv';
    } else {
        impactMessage = 'Weather conditions are generally favorable.';
        impactIcon = '😌';
        impactClass = 'impact-favorable';
    }

    impactElement.innerHTML = `
        <div class="impact-icon">${impactIcon}</div>
        <div class="impact-content">
            <h3>Weather Impact:</h3>
            <p>${impactMessage}</p>
        </div>
    `;
    impactElement.className = `weather-impact ${impactClass}`;
}


function updateForecast(data) {
    const forecastContainer = document.getElementById('forecast-cards');
    forecastContainer.innerHTML = '';
    
    data.forecast.forecastday.forEach(day => {
        const date = new Date(day.date);
        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <div class="date">${date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
            <div class="icon">${getWeatherEmoji(day.day.condition.code)}</div>
            <div class="temp">${Math.round(day.day.avgtemp_c)}°C</div>
        `;
        forecastContainer.appendChild(card);
    });
}

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

function getWeatherEmoji(conditionCode) {
    if (conditionCode === 1000) return '☀️'; // Sunny
    if (conditionCode >= 1003 && conditionCode <= 1009) return '☁️'; 
    if (conditionCode >= 1030 && conditionCode <= 1063) return '🌧️'; 
    if (conditionCode >= 1066 && conditionCode <= 1117) return '❄️'; 
    if (conditionCode >= 1135 && conditionCode <= 1147) return '🌫️'; 
    if (conditionCode >= 1150 && conditionCode <= 1201) return '🌧️'; 
    if (conditionCode >= 1204 && conditionCode <= 1237) return '🌨️'; 
    if (conditionCode >= 1240 && conditionCode <= 1246) return '🌧️'; 
    if (conditionCode >= 1249 && conditionCode <= 1264) return '🌨️'; 
    if (conditionCode >= 1273 && conditionCode <= 1282) return '⛈️'; 
    return '🌈'; 
}

async function searchWeather(query) {
    try {
        const weatherData = await getWeatherData(query);
        if (!weatherData || !weatherData.current) {
            throw new Error('Invalid weather data received');
        }
        
        updateCurrentWeather(weatherData);
        updateForecast(weatherData);
        updateChart(weatherData);
    } catch (error) {
        console.error('Error in searchWeather():', error);
        displayError(error);
    }
}

function displayError(error) {
    let errorMessage = 'Unable to fetch weather data. ';
    if (error.message.includes('Unauthorized')) {
        errorMessage += 'Please check your API key.';
    } else if (error.message.includes('geolocation')) {
        errorMessage += 'Please enable location services and refresh the page.';
    } else {
        errorMessage += 'Please try again later.';
    }
    document.getElementById('location').textContent = errorMessage;
    document.getElementById('current-weather').style.display = 'none';
    document.getElementById('forecast').style.display = 'none';
    document.getElementById('charts').style.display = 'none';
}

async function updateLocationSuggestions(query) {
    const suggestions = await getLocationSuggestions(query);
    const suggestionsList = document.getElementById('city-suggestions-list');
    suggestionsList.innerHTML = '';
    suggestions.forEach(suggestion => {
        const li = document.createElement('li');
        li.textContent = `${suggestion.name}, ${suggestion.region}, ${suggestion.country}`;
        li.addEventListener('click', () => {
            document.getElementById('city-search').value = li.textContent;
            suggestionsList.style.display = 'none';
            searchWeather(li.textContent);
        });
        suggestionsList.appendChild(li);
    });
    suggestionsList.style.display = suggestions.length > 0 ? 'block' : 'none';
}

function getFavoriteCities() {
    return JSON.parse(localStorage.getItem('favoriteCities')) || [];
}

function saveFavoriteCities(cities) {
    localStorage.setItem('favoriteCities', JSON.stringify(cities));
}

function updateFavoriteButton(cityName) {
    const favoriteButton = document.getElementById('favorite-button');
    const favoriteCities = getFavoriteCities();
    
    if (favoriteCities.includes(cityName)) {
        favoriteButton.textContent = '★';
        favoriteButton.classList.add('favorited');
    } else {
        favoriteButton.textContent = '☆';
        favoriteButton.classList.remove('favorited');
    }
}

function toggleFavorite() {
    const cityName = document.getElementById('location').textContent.split(',')[0];
    let favoriteCities = getFavoriteCities();
    
    if (favoriteCities.includes(cityName)) {
        favoriteCities = favoriteCities.filter(city => city !== cityName);
    } else {
        favoriteCities.push(cityName);
    }
    
    saveFavoriteCities(favoriteCities);
    updateFavoriteButton(cityName);
    updateFavoriteCitiesList();
}

function updateFavoriteCitiesList() {
    const favoritesList = document.getElementById('favorite-cities-list');
    const favoriteCities = getFavoriteCities();
    
    favoritesList.innerHTML = '';
    
    if (favoriteCities.length === 0) {
        favoritesList.innerHTML = '<li class="no-favorites">No favorite cities added yet</li>';
    } else {
        favoriteCities.forEach(city => {
            const li = document.createElement('li');
            li.textContent = city;
            li.addEventListener('click', () => searchWeather(city));
            favoritesList.appendChild(li);
        });
    }
}

function init() {
    const searchButton = document.getElementById('search-button');
    const citySearch = document.getElementById('city-search');
    const favoriteButton = document.getElementById('favorite-button');

    searchButton.addEventListener('click', () => {
        const query = citySearch.value.trim();
        if (query) {
            searchWeather(query);
        }
    });

    citySearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = citySearch.value.trim();
            if (query) {
                searchWeather(query);
            }
        }
    });

    citySearch.addEventListener('input', async (e) => {
        const query = e.target.value.trim();
        if (query.length >= 3) {
            await updateLocationSuggestions(query);
        }
    });

    document.getElementById('city-search').addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (query.length > 2) {
            updateLocationSuggestions(query);
        } else {
            document.getElementById('city-suggestions-list').style.display = 'none';
        }
    });

    favoriteButton.addEventListener('click', toggleFavorite);


    searchWeather('Bangalore');
    updateFavoriteCitiesList();
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const themeIcon = document.querySelector('#theme-toggle i');
    if (document.body.classList.contains('dark-theme')) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }

    const lastSearchedCity = document.getElementById('location').textContent.split(',')[0];
    searchWeather(lastSearchedCity);
}

document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

init();