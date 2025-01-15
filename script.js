// script.js

document.addEventListener("DOMContentLoaded", () => {
    const encodedMessage = document.getElementById("encodedMessage");
    const encodedMessagePart2 = document.getElementById("encodedMessagePart2");
    const decodeButton = document.getElementById("decodeButton");
    const weatherTableBody = document.getElementById("weatherTable").querySelector("tbody");

    decodeButton.addEventListener("click", () => {
        const part1 = encodedMessage.value.trim();
        const part2 = encodedMessagePart2.value.trim();
        const fullMessage = part1 + part2;

        // Clear existing rows in the table
        weatherTableBody.innerHTML = "";

        if (fullMessage.length === 0) {
            alert("Please paste a valid encoded message.");
            return;
        }

        const decodedData = decodeWeatherMessage(fullMessage);
        if (!decodedData || decodedData.length === 0) {
            alert("Failed to decode the message. Please check the input.");
            return;
        }

        decodedData.forEach((entry) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${entry.time}</td>
                <td>${entry.temp}</td>
                <td>${entry.precip}</td>
                <td>${entry.wind} (${entry.gust})</td>
                <td>${entry.direction}</td>
                <td>${entry.cloud}</td>
            `;
            weatherTableBody.appendChild(row);
        });
    });
});

function decodeWeatherMessage(encodedMessage) {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const decodedData = [];

    const segments = encodedMessage.split(";");

    segments.forEach((segment) => {
        if (segment.length === 10) {
            const time = parseInt(segment.substring(0, 1), 36) + ":00";
            const temp = parseInt(segment.substring(1, 3), 36) - 50;
            const precip = parseInt(segment.substring(3, 4), 36);
            const wind = parseInt(segment.substring(4, 6), 36);
            const gust = parseInt(segment.substring(6, 8), 36);
            const cloud = parseInt(segment.substring(8, 9), 36) * 10;
            const direction = directions[parseInt(segment.substring(9), 10) % 8];

            decodedData.push({
                time,
                temp,
                precip,
                wind,
                gust,
                cloud,
                direction,
            });
        }
    });

    return decodedData;
}
