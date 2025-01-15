// Decode the weather message and render it in a table
function decodeMessage(encodedMessage) {
    try {
        const entries = encodedMessage.split(";").filter(entry => entry.trim() !== "");
        const data = entries.map(entry => {
            const time = parseInt(entry[0], 36); // TT (Base36 to hour)
            const temp = parseInt(entry.slice(1, 3), 36) - 50; // Temp in °C (-50 to allow for negative temperatures)
            const wind = parseInt(entry[3], 36); // WW (Base36 to wind speed)
            const gust = parseInt(entry[4], 36); // GG (Base36 to wind gust)
            const cloud = parseInt(entry[5], 10) * 10; // CC (Cloud cover percentage)
            const precip = parseInt(entry[6], 10); // P (Precipitation in mm)
            const direction = entry.slice(7); // DD (Direction, e.g., N, NE, E, etc.)

            if (isNaN(time) || isNaN(temp) || isNaN(wind) || isNaN(gust) || isNaN(cloud) || isNaN(precip)) {
                console.error("Failed to parse entry:", entry);
                throw new Error("Invalid message format");
            }

            return { time, temp, wind, gust, cloud, precip, direction };
        });
        return data;
    } catch (error) {
        console.error("Error decoding message:", error);
        return null;
    }
}

function renderTable(data) {
    const tableBody = document.querySelector("#weatherTable tbody");
    tableBody.innerHTML = ""; // Clear existing rows

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
        windCell.textContent = `${entry.wind} (${entry.gust}) m/s`;
        row.appendChild(windCell);

        const directionCell = document.createElement("td");
        directionCell.textContent = entry.direction;
        row.appendChild(directionCell);

        const cloudCell = document.createElement("td");
        cloudCell.textContent = `${entry.cloud}%`;
        row.appendChild(cloudCell);

        tableBody.appendChild(row);
    });
}

document.getElementById("decodeButton").addEventListener("click", () => {
    const part1 = document.getElementById("encodedMessage").value.trim();
    const part2 = document.getElementById("encodedMessagePart2").value.trim();
    const fullMessage = part1 + ";" + part2;

    console.log("Full message to decode:", fullMessage);

    const decodedData = decodeMessage(fullMessage);
    if (!decodedData) {
        alert("Failed to decode the message. Please check the input.");
        return;
    }

    renderTable(decodedData);
});
