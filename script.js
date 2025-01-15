function decodeMessage(encodedMessage) {
    try {
        if (!encodedMessage || encodedMessage.trim() === "") {
            throw new Error("No message provided.");
        }

        const entries = encodedMessage.split(";").filter(Boolean);
        console.log("Entries to decode:", entries);

        return entries.map((entry) => {
            if (entry.length !== 9) {
                throw new Error(`Invalid entry length for: ${entry}`);
            }

            const timeBase36 = entry[0]; // Tid (time)
            const time = `${parseInt(timeBase36, 36)}:00`;

            const tempBase36 = entry.slice(1, 3); // Temperatur
            const temp = parseInt(tempBase36, 36) - 50;

            const windBase36 = entry[3]; // Vindstyrke
            const wind = parseInt(windBase36, 36);

            const gustBase36 = entry.slice(4, 6); // Vindkast
            const gust = parseInt(gustBase36, 36);

            const cloud = parseInt(entry[6], 10) * 10; // Skydekke (0-90%)

            const precip = parseInt(entry[7], 10); // Nedbør i mm

            const directionIndex = parseInt(entry[8], 10); // Vindretning (0-7)
            const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
            const direction = directions[directionIndex] || "Unknown";

            return {
                time,
                temp: `${temp}°C`,
                precip: `${precip} mm`,
                wind: `${wind} (${gust}) m/s`,
                direction,
                cloud: `${cloud}%`,
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
