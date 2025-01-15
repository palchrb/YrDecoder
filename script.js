function decodeWeather() {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const base36ToDecimal = (value) => parseInt(value, 36);

  const part1 = document.getElementById("messagePart1").value.trim();
  const part2 = document.getElementById("messagePart2").value.trim();
  const fullMessage = part1 + ";" + part2;

  const rows = fullMessage.split(";").map((chunk) => {
    const time = parseInt(chunk[0], 36); // Time in decimal
    const temp = parseInt(chunk.slice(1, 3)); // Temperature
    const wind = base36ToDecimal(chunk[3]); // Wind
    const gust = base36ToDecimal(chunk[4]); // Gust
    const cloud = parseInt(chunk[5]); // Cloud cover
    const precip = parseInt(chunk[6]); // Precipitation
    const dir = directions.find((_, index) => chunk.endsWith(directions[index]));

    return { time, temp, wind, gust, cloud, precip, dir };
  });

  // Render data in the table
  const tableBody = document.getElementById("decodedTable").querySelector("tbody");
  tableBody.innerHTML = ""; // Clear previous results

  rows.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.time}:00</td>
      <td>${row.temp}°C</td>
      <td>${row.precip} mm</td>
      <td>${row.wind} m/s (${row.gust} m/s)</td>
      <td>${row.cloud * 10}%</td>
    `;
    tableBody.appendChild(tr);
  });
}
