function decodeMessage(encodedMessage) {
    try {
        if (!encodedMessage || encodedMessage.trim() === "") {
            throw new Error("No message provided");
        }

        const entries = encodedMessage.split(';').filter(Boolean);
        console.log("Entries to decode:", entries);

        return entries.map((entry) => {
            console.log(`Decoding entry: ${entry}`);
            if (entry.length < 7 || entry.length > 9) {
                throw new Error(`Invalid entry length for: ${entry}`);
            }

            // Time decoding
            const timeBase36 = entry[0];
            const time = parseInt(timeBase36, 36);
            console.log(`Time: ${time}:00`);

            // Temperature decoding
            const tempSign = entry[1] === '-' ? -1 : 1;
            const tempEndIndex = tempSign === -1 ? 3 : 2;
            const temp = tempSign * parseInt(entry.slice(tempSign === -1 ? 2 : 1, tempEndIndex), 10);
            console.log(`Temperature: ${temp}°C`);

            // Wind speed decoding
            const windStart = tempEndIndex;
            const windEnd = windStart + 2;
            const windSpeed = parseInt(entry.slice(windStart, windEnd), 36);
            console.log(`Wind speed: ${windSpeed}`);

            // Gust decoding
            const gustStart = windEnd;
            const gustEnd = gustStart + 2;
            const gustSpeed = parseInt(entry.slice(gustStart, gustEnd), 36);
            console.log(`Gust speed: ${gustSpeed}`);

            // Cloud cover decoding
            const cloudStart = gustEnd;
            const cloudCover = parseInt(entry[cloudStart], 10) * 10;
            console.log(`Cloud cover: ${cloudCover}%`);

            // Wind direction decoding
            const directionStart = cloudStart + 1;
            const windDirection = entry.slice(directionStart);
            console.log(`Wind direction: ${windDirection}`);

            return {
                time: `${time}:00`,
                temp: `${temp}°C`,
                wind: `${windSpeed} (${gustSpeed}) m/s`,
                cloud: `${cloudCover}%`,
                direction: windDirection,
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
