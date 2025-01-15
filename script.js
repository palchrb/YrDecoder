function decodeMessage(encodedMessage) {
    try {
        if (!encodedMessage || encodedMessage.trim() === "") {
            throw new Error("No message provided");
        }

        // Split the full message into entries
        const entries = encodedMessage.split(';').filter(Boolean);
        console.log("Entries to decode:", entries);

        return entries.map((entry) => {
            console.log(`Decoding entry: ${entry}`);

            // Extract time (first character, base36)
            const timeBase36 = entry[0];
            const time = parseInt(timeBase36, 36);

            // Extract temperature, accounting for sign
            const tempSign = entry[1] === '-' ? -1 : 1;
            const temp = tempSign * parseInt(entry.slice(tempSign === -1 ? 2 : 1, tempSign === -1 ? 3 : 2), 10);

            // Extract wind speed (2 characters, base36)
            const windSpeed = parseInt(entry.slice(tempSign === -1 ? 3 : 2, tempSign === -1 ? 5 : 4), 36);

            // Extract gust speed (2 characters, base36)
            const gustSpeed = parseInt(entry.slice(tempSign === -1 ? 5 : 4, tempSign === -1 ? 7 : 6), 36);

            // Extract cloud cover (1 character, multiplied by 10)
            const cloudCover = parseInt(entry[tempSign === -1 ? 7 : 6], 10) * 10;

            // Extract precipitation (1 character)
            const precipitation = parseInt(entry[tempSign === -1 ? 8 : 7], 10);

            // Extract wind direction (remaining characters)
            const windDirection = entry.slice(tempSign === -1 ? 9 : 8);

            return {
                time: `${time}:00`,
                temp: `${temp}°C`,
                precip: `${precipitation} mm`,
                wind: `${windSpeed} (${gustSpeed}) m/s`,
                direction: windDirection || "N/A",
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

    // Combine the two parts of the message directly
    const fullMessage = `${part1}${part2}`;
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
