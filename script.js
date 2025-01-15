function decodeMessage(encodedMessage) {
    try {
        if (!encodedMessage || encodedMessage.trim() === "") {
            throw new Error("No message provided");
        }

        const entries = encodedMessage.split(';').filter(Boolean);
        console.log("Entries to decode:", entries);

        return entries.map((entry) => {
            if (entry.length < 7 || entry.length > 9) {
                throw new Error(`Invalid entry length for: ${entry}`);
            }

            const timeBase36 = entry[0];
            const time = parseInt(timeBase36, 36);

            const tempSign = entry[1] === '-' ? -1 : 1;
            const temp = tempSign * parseInt(entry.slice(tempSign === -1 ? 2 : 1, tempSign === -1 ? 3 : 2), 10);

            const windSpeed = parseInt(entry.slice(tempSign === -1 ? 3 : 2, tempSign === -1 ? 5 : 4), 36);
            const gustSpeed = parseInt(entry.slice(tempSign === -1 ? 5 : 4, tempSign === -1 ? 7 : 6), 36);

            const cloudCover = parseInt(entry[tempSign === -1 ? 7 : 6], 10) * 10;
            const windDirection = entry.slice(tempSign === -1 ? 8 : 7);

            return {
                time: `${time}:00`,
                temp,
                wind: `${windSpeed} (${gustSpeed})`,
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

    const fullMessage = `${part1}${part2 ? ';' + part2 : ''}`;
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
