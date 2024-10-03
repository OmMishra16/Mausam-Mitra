function initChart(forecastData) {
    const ctx = document.getElementById('temperatureChart').getContext('2d');
    const labels = forecastData.daily.slice(0, 7).map(day => {
        const date = new Date(day.dt * 1000);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    });

    const temperatures = forecastData.daily.slice(0, 7).map(day => day.temp.day);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatures,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                fill: false
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '7-Day Temperature Forecast'
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    }
                }
            }
        }
    });
}