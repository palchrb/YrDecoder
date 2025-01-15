// Fullstendig oppdatert script.js for bedre dekoding og feilhåndtering

function decodeMessage(encodedMessage) {
    try {
        if (!encodedMessage || encodedMessage.trim() === "") {
            throw new Error("No message provided.");
        }

        const entries = encodedMessage.split(';').filter(Boolean);
        console.log("Entries to decode:", entries);

        return entries.map((entry) => {
            if (entry.length < 8 || entry.length > 10) {
                throw new Error(`Invalid entry length for: ${entry}`);
            }

            const timeBase36 = entry[0];
            const time = parseInt(timeBase36, 36);

            // Extract and parse temperature
            const tempSign = entry[1] === '-' ? -1 : 1;
            const tempEndIndex = tempSign === -1 ? 3 : 2;
            const temp = tempSign * parseInt(entry.slice(tempSign === -1 ? 2 : 1, tempEndIndex), 10);

            // Extract and parse wind speed and gust
            const windSpeed = parseInt(entry.slice(tempEndIndex, tempEndIndex + 2), 36);
            const gustSpeed = parseInt(entry.slice(tempEndIndex + 2, tempEndIndex + 4), 36);

            // Extract cloud cover and precipitation
            const cloudCover = parseInt(entry[tempEndIndex + 4], 10) * 10;
            const precipitation = parseInt(entry[tempEndIndex + 5], 10);

            // Extract wind direction
            const windDirection = entry.slice(tempEndIndex + 6);

            return {
                time: `${time}:00`,
                temp: `${temp}°C`,
                precip: `${precipitation} mm`,
                wind: `${windSpeed} (${gustSpeed}) m/s`,
                direction: windDirection,
                cloud: `${cloudCover}%`,
            };
        });
    } catch (error) {
        console.error("Error decoding message:", error);
        throw new Error("Failed to decode the message. Please check the input.");
    }
}

document.getElementById("decodeButton").addEventListener("click", () => {
    const part1 = document.getElementById("encodedMessage").value.trim();
    const part2 = document.getElementById("encodedMessagePart2").value.trim();

    const fullMessage = `${part1};${part2}`;
    console.log("Full message to decode:", fullMessage);

    try {
        const decodedData = decodeMessage(fullMessage);

        const tableBody = document.getElementById("weatherTable").querySelector("tbody");
        tableBody.innerHTML = "";

        decodedData.forEach((data) => {
            const row = document.createElement("tr");

            Object.values(data).forEach((value) => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

            tableBody.appendChild(row);
        });
    } catch (error) {
        alert(error.message);
    }
});
