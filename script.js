function decodeMessage(encodedMessage) {
    try {
        if (!encodedMessage || encodedMessage.trim() === "") {
            throw new Error("No message provided");
        }

        const entries = encodedMessage.split(';').filter(Boolean);
        console.log("Entries to decode:", entries);

        return entries.map((entry) => {
            // Valider minimum og maksimum lengde
            if (entry.length < 8 || entry.length > 12) {
                throw new Error(`Invalid entry length for: ${entry}`);
            }

            // Dekoder tid (base36 til desimal)
            const timeBase36 = entry[0];
            const time = parseInt(timeBase36, 36);

            // Dekoder temperatur
            const tempSign = entry[1] === '-' ? -1 : 1; // Minus eller pluss
            const tempEndIndex = tempSign === -1 ? 3 : 2;
            const temp = tempSign * parseInt(entry.slice(1, tempEndIndex), 10);

            // Dekoder vindstyrke og vindkast (base36)
            const windSpeed = parseInt(entry.slice(tempEndIndex, tempEndIndex + 2), 36);
            const gustSpeed = parseInt(entry.slice(tempEndIndex + 2, tempEndIndex + 4), 36);

            // Dekoder skydekke
            const cloudCover = parseInt(entry[tempEndIndex + 4], 10) * 10;

            // Dekoder vindretning
            const windDirection = entry.slice(tempEndIndex + 5);

            // Returner objekt for hver time
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
        throw new Error("Failed to decode the message. Please check the input format.");
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
