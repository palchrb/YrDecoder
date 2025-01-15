// script.js

document.getElementById('decodeButton').addEventListener('click', () => {
  const messageInput1 = document.getElementById('messageInput1').value;
  const messageInput2 = document.getElementById('messageInput2').value;
  const rawMessage = messageInput1 + messageInput2;

  const weatherData = decodeMessage(rawMessage);
  displayWeatherData(weatherData);
});

function decodeMessage(message) {
  const hours = message.split(';');
  const decodedData = [];

  hours.forEach(hour => {
    if (hour.length < 10) return; // Skip invalid entries

    const time = parseInt(hour[0], 36).toString().padStart(2, '0') + ':00';
    const temp = parseInt(hour.slice(1, 3), 36);
    const wind = parseInt(hour[3], 36);
    const gust = parseInt(hour[4], 36);
    const cloud = parseInt(hour[5], 10) * 10; // Skydekke i prosent
    const precip = parseInt(hour[6], 10); // Nedbør i mm
    const dirIndex = hour.slice(7); // Vindretning som bokstavkode

    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const windDirection = directions[parseInt(dirIndex, 36) % directions.length];

    decodedData.push({ time, temp, precip, wind, gust, cloud, windDirection });
  });

  return decodedData;
}

function displayWeatherData(data) {
  const tableBody = document.getElementById('weatherTable').querySelector('tbody');
  tableBody.innerHTML = '';

  data.forEach(row => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${row.time}</td>
      <td>${row.temp}&deg;C</td>
      <td>${row.precip} mm</td>
      <td>${row.wind} (${row.gust}) m/s</td>
      <td>${row.cloud}%</td>
      <td>${row.windDirection}</td>
    `;

    tableBody.appendChild(tr);
  });
}
