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
                temp: `${temp}`,
                precip: precip === 0 ? "" : `${precip.toFixed(1)}`, // Leave empty if precipitation is 0.0
                wind: `${wind} (${gust})`,
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

// Dekode skreddata
function decodeAvalancheMessage(encodedMessage) {
    try {
        if (!encodedMessage || encodedMessage.trim() === "") {
            throw new Error("Ingen melding oppgitt.");
        }

        const dangerLevels = encodedMessage.slice(0, 3).split("").map(d => decodeBase36(d));
        const avalancheProblems = [];
        const problemData = encodedMessage.slice(3);

        for (let i = 0; i < problemData.length; i += 9) {
            const segment = problemData.slice(i, i + 9);
            if (segment.length < 9) continue;

            const type = segment[0];
            const cause = segment[1];
            const propagation = segment[2];
            const sensitivity = segment[3];
            const destructiveSize = segment[4];
            const heightCode = segment[5];
            const heightQualifier = segment[6] === "1" ? "Over" : "Opptil";
            const directionsCode = segment.slice(7, 9);

            const height = decodeBase36(heightCode) * 100;
            const directions = decodeDirections(directionsCode);

            avalancheProblems.push({
                type: decodeAvalancheProblemType(type),
                cause: decodeAvalCause(cause),
                propagation: decodeAvalPropagation(propagation),
                sensitivity: decodeAvalTriggerSensitivity(sensitivity),
                destructiveSize: decodeDestructiveSize(destructiveSize),
                height: `${heightQualifier} ${height} moh`,
                directions: directions,
            });
        }

        return { dangerLevels, avalancheProblems };
    } catch (error) {
        console.error("Feil under dekoding:", error);
        throw new Error("Feil under dekoding av melding.");
    }
}

// Event listener for skreddekoder
document.getElementById("decodeAvalancheButton").addEventListener("click", () => {
    const encodedMessage = document.getElementById("encodedAvalancheMessage").value.trim();

    try {
        const decoded = decodeAvalancheMessage(encodedMessage);

        // Oppdater faregrader
        document.getElementById("dangerLevels").textContent = `Faregrader: ${decoded.dangerLevels.join(", ")}`;

        // Oppdater skredproblemer i tabellen
        const tableBody = document.getElementById("avalancheTable").querySelector("tbody");
        tableBody.innerHTML = "";

        decoded.avalancheProblems.forEach(problem => {
            const row = document.createElement("tr");

            Object.values(problem).forEach(value => {
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

