// Oppdatert dekodingslogikk for værmeldinger

document.getElementById("decodeBtn").addEventListener("click", function () {
  const part1 = document.getElementById("part1").value.trim();
  const part2 = document.getElementById("part2").value.trim();
  const fullMessage = part1 + part2;

  const decodedData = decodeWeatherMessage(fullMessage);
  if (decodedData) {
    displayDecodedData(decodedData);
  } else {
    alert("Feil: Kunne ikke dekode meldingen. Sjekk formatet.");
  }
});

function decodeWeatherMessage(message) {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

  try {
    const hours = message.split(";").map(entry => {
      const timeBase36 = entry[0];
      const time = parseInt(timeBase36, 36);
      const temp = parseInt(entry.slice(1, 3));
      const wind = parseInt(entry.slice(3, 5), 36);
      const gust = parseInt(entry.slice(5, 7), 36);
      const cloud = parseInt(entry[7]) * 10;
      const precip = parseInt(entry[8]);
      const dirCode = entry.slice(9);
      const direction = directions.find((_, idx) => idx === directions.indexOf(dirCode));

      return {
        time,
        temp,
        wind,
        gust,
        cloud,
        precip,
        direction,
      };
    });

    return hours;
  } catch (error) {
    console.error("Dekodingsfeil:", error);
    return null;
  }
}

function displayDecodedData(data) {
  const table = document.getElementById("decodedTable");

  // Tøm tidligere data
  table.innerHTML = "";

  // Legg til header
  const headerRow = document.createElement("tr");
  ["Tid", "Temp", "Nedbør", "Vind (kast)", "Skydekke"].forEach(header => {
    const th = document.createElement("th");
    th.textContent = header;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  // Legg til rader for data
  data.forEach(entry => {
    const row = document.createElement("tr");

    const timeCell = document.createElement("td");
    timeCell.textContent = `${entry.time}:00`;
    row.appendChild(timeCell);

    const tempCell = document.createElement("td");
    tempCell.textContent = `${entry.temp}°C`;
    row.appendChild(tempCell);

    const precipCell = document.createElement("td");
    precipCell.textContent = `${entry.precip} mm`;
    row.appendChild(precipCell);

    const windCell = document.createElement("td");
    windCell.textContent = `${entry.wind} (${entry.gust}) m/s ${entry.direction || ""}`;
    row.appendChild(windCell);

    const cloudCell = document.createElement("td");
    cloudCell.textContent = `${entry.cloud}%`;
    row.appendChild(cloudCell);

    table.appendChild(row);
  });
}
