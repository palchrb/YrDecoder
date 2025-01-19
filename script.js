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

// Event listener for weather decoder
const decodeButton = document.getElementById("decodeButton");
if (decodeButton) {
    decodeButton.addEventListener("click", () => {
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
}

// Dekode skreddata
// Funksjon for å dekode meldingen
function decodeAvalancheMessage(encodedMessage) {
    try {
        if (!encodedMessage || encodedMessage.trim() === "") {
            throw new Error("Ingen melding oppgitt.");
        }

        const [codePart, vurderingPart] = encodedMessage.split(";"); // Split koden og vurderingen
        if (!codePart) throw new Error("Ingen kodet melding funnet.");

        const dangerLevels = codePart.slice(0, 3).split("").map(d => decodeBase36(d));
        const avalancheProblems = [];
        const problemData = codePart.slice(3);

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

        return { dangerLevels, avalancheProblems, vurdering: vurderingPart || "Ingen vurdering tilgjengelig." };
    } catch (error) {
        console.error("Feil under dekoding:", error);
        throw new Error("Feil under dekoding av melding.");
    }
}
// Funksjon for å dekode Base36-verdi
function decodeBase36(value) {
    return parseInt(value, 36);
}

// Funksjon for å dekode himmelretninger fra en streng som "11110000"
function decodeDirections(base36String) {
    if (!/^[0-9a-z]{1,2}$/.test(base36String)) {
        console.error(`Ugyldig Base36-verdi for retninger: ${base36String}`);
        return "Ukjent retning";
    }

    const binaryString = parseInt(base36String, 36).toString(2).padStart(8, "0");
    const directionsMap = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return binaryString
        .split("")
        .map((bit, index) => (bit === "1" ? directionsMap[index] : null))
        .filter(Boolean)
        .join(", ");
}

// Dekodingsfunksjoner for skreddata
function decodeAvalancheProblemType(code) {
    const mapping = {
        "0": "Ikke gitt",
        "1": "Nysnø (løssnøskred)",
        "2": "Våt snø (løssnøskred)",
        "3": "Nysnø (flakskred)",
        "4": "Fokksnø (flakskred)",
        "5": "Vedvarende svakt lag (flakskred)",
        "6": "Våt snø (flakskred)",
        "7": "Glideskred"
    };
    return mapping[code] || "Ukjent skredtype";
}

function decodeAvalCause(code) {
    const mapping = {
        "0": "Ikke gitt",
        "1": "Nedføyket svakt lag med nysnø",
        "2": "Nedsnødd eller nedføyket overflaterim",
        "3": "Nedsnødd eller nedføyket kantkornet snø",
        "4": "Dårlig binding mellom glatt skare og overliggende snø",
        "5": "Dårlig binding mellom lag i fokksnøen",
        "6": "Kantkornet snø ved bakken",
        "7": "Kantkornet snø over skarelag",
        "8": "Kantkornet snø under skarelag",
        "9": "Vann ved bakken/smelting fra bakken",
        "a": "Opphopning av vann i/over lag i snødekket",
        "b": "Ubunden snø"
    };
    return mapping[code] || "Ukjent årsak";
}

function decodeAvalPropagation(code) {
    const mapping = {
        "0": "Ikke gitt",
        "1": "Få bratte heng",
        "2": "Noen bratte heng",
        "3": "Mange bratte heng"
    };
    return mapping[code] || "Ukjent spredning";
}

function decodeAvalTriggerSensitivity(code) {
    const mapping = {
        "0": "Ikke gitt",
        "1": "Svært vanskelig å løse ut",
        "2": "Vanskelig å løse ut",
        "3": "Lett å løse ut",
        "4": "Svært lett å løse ut",
        "5": "Naturlig"
    };
    return mapping[code] || "Ukjent sensitivitet";
}

function decodeDestructiveSize(code) {
    const mapping = {
        "0": "Ikke gitt",
        "1": "1 - Små",
        "2": "2 - Middels",
        "3": "3 - Store",
        "4": "4 - Svært store",
        "5": "5 - Ekstremt store",
        "6": "Ukjent størrelse"
    };
    return mapping[code] || "Ukjent størrelse";
}

// Funksjon for å generere SVG-grafikk for himmelretninger
function generateDirectionGraphic(directions) {
    const directionsMap = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const highlightedDirections = directions.split(", "); // Forventet format: "N, NE, S"

    // SVG-innhold
    let svg = `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<circle cx="50" cy="50" r="48" stroke="black" fill="white" stroke-width="2"/>`;

    const angleStep = 360 / directionsMap.length;
    directionsMap.forEach((dir, index) => {
        const startAngle = (angleStep * index - 112.5) * (Math.PI / 180); // Startvinkelen for sektoren
        const endAngle = (angleStep * (index + 1) - 112.5) * (Math.PI / 180); // Sluttvinkelen for sektoren

        const x1 = 50 + 48 * Math.cos(startAngle);
        const y1 = 50 + 48 * Math.sin(startAngle);
        const x2 = 50 + 48 * Math.cos(endAngle);
        const y2 = 50 + 48 * Math.sin(endAngle);

        const isHighlighted = highlightedDirections.includes(dir);

        // Tegn kakestykke
        svg += `
            <path d="M50,50 L${x1},${y1} A48,48 0 0,1 ${x2},${y2} Z" 
                  fill="${isHighlighted ? "red" : "none"}" 
                  stroke="black" 
                  stroke-width="1"/>
        `;
    });

    svg += `</svg>`;
    return svg;
}




// Oppdater event listener for skreddekoder
document.getElementById("decodeAvalancheButton").addEventListener("click", () => {
    const encodedMessage = document.getElementById("encodedAvalancheMessage").value.trim();

    try {
        const decoded = decodeAvalancheMessage(encodedMessage);

        // Oppdater faregrader
        document.getElementById("dangerLevels").textContent = `Faregrader: ${decoded.dangerLevels.join(", ")}`;

        // Oppdater skredproblemer i tabellen
        const tableBody = document.getElementById("avalancheTableBody");
        tableBody.innerHTML = "";

        decoded.avalancheProblems.forEach(problem => {
            const row = document.createElement("tr");

            Object.keys(problem).forEach(key => {
                const cell = document.createElement("td");
                if (key === "directions") {
                    // Legg til SVG for retninger
                    cell.innerHTML = generateDirectionGraphic(problem[key]);
                } else {
                    cell.textContent = problem[key];
                }
                row.appendChild(cell);
            });

            tableBody.appendChild(row);
        });
    } catch (error) {
        alert(error.message);
    }
});

