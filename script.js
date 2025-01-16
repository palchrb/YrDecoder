// Updated decoder for the new compressed format
function decodeMessage(encodedMessage) {
    try {
        if (!encodedMessage || encodedMessage.trim() === "") {
            throw new Error("No message provided");
        }

        const entries = encodedMessage.split(';').filter(Boolean);
        console.log("Entries to decode:", entries);

        const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

        const base36ToInt = (value) => parseInt(value, 36);

        // First entry is the city name (up to 15 characters, URL encoded)
        const cityNameEncoded = entries.shift();
        const cityName = decodeURIComponent(cityNameEncoded);

        // Second entry is the date
        const dateCode = entries.shift();
        const year = Math.floor(base36ToInt(dateCode) / 10000) + 2000;
        const month = Math.floor((base36ToInt(dateCode) % 10000) / 100);
        const day = base36ToInt(dateCode) % 100;
        const decodedDate = `${day.toString().padStart(2, "0")}.${month.toString().padStart(2, "0")}.${year}`;

        const weatherData = entries.map((entry) => {
            if (entry.length !== 10) {
                throw new Error(`Invalid entry length for: ${entry}`);
            }

            const timeBase36 = entry.slice(0, 1);
            const time = parseInt(timeBase36, 36);

            const tempBase36 = entry.slice(1, 3);
            const temp = base36ToInt(tempBase36) - 50;

            const windBase36 = entry.slice(3, 4);
            const wind = base36ToInt(windBase36);

            const gustBase36 = entry.slice(4, 6);
            const gust = base36ToInt(gustBase36);

            const cloudBase36 = entry.slice(6, 7);
            const cloud = base36ToInt(cloudBase36) * 5; // Adjusted to 5% intervals

            const precipBase36 = entry.slice(7, 9); // Two-character precipitation encoding
            const precip = base36ToInt(precipBase36) / 10; // Adjusted to include one decimal point

            const directionBase36 = entry.slice(9, 10);
            const direction = directions[base36ToInt(directionBase36) % 8];

            return {
                time: `${time}:00`,
                temp: `${temp}°C`,
                precip: precip === 0 ? "" : `${precip.toFixed(1)} mm`, // Leave empty if precipitation is 0.0
                wind: `${wind} m/s (${gust} m/s)`,
                direction: direction,
                cloud: `${cloud}%`,
            };
        });

        return { cityName, date: decodedDate, data: weatherData };
    } catch (error) {
        console.error("Error decoding message:", error);
        throw new Error("Failed to decode the message. Please check the input.");
    }
}

// Event listener for decode button
document.getElementById("decodeButton").addEventListener("click", () => {
    const part1 = document.getElementById("encodedMessage").value.trim();
    const part2 = document.getElementById("encodedMessagePart2").value.trim();

    const fullMessage = `${part1}${part2}`;
    console.log("Full message to decode:", fullMessage);

    try {
        const decoded = decodeMessage(fullMessage);

        // Update city and date in the table
        document.getElementById("weatherDate").textContent = `Sted: ${decoded.cityName}, Dato: ${decoded.date}`;

        // Update weather data in the table
        const tableBody = document.getElementById("weatherTable").querySelector("tbody");
        tableBody.innerHTML = "";

        decoded.data.forEach((data) => {
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
