function decodeMessage(encodedMessage) {
    try {
        if (!encodedMessage || encodedMessage.trim() === "") {
            throw new Error("No message provided");
        }

        const entries = encodedMessage.split(';').filter(Boolean);
        console.log("Entries to decode:", entries);

        return entries.map((entry) => {
            if (entry.length !== 10) {
                throw new Error(`Invalid entry length for: ${entry}`);
            }

            const timeBase36 = entry[0];
            const time = parseInt(timeBase36, 36);

            const temp = parseInt(entry.slice(1, 3), 10);
            const windSpeed = parseInt(entry.slice(3, 5), 36);
            const gustSpeed = parseInt(entry.slice(5, 7), 36);
            const cloudCover = parseInt(entry[7], 10) * 10;
            const precipitation = parseInt(entry[8], 10);
            const windDirection = entry.slice(9);

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
        console.error("Error decoding message:", error.message);
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
