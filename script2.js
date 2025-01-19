// Dekode skreddata
function decodeAvalancheMessage(encodedMessage) {
    try {
        if (!encodedMessage || encodedMessage.trim() === "") {
            throw new Error("Ingen melding oppgitt.");
        }

        console.log("Full encoded message:", encodedMessage);

        const [codePart, vurderingPart] = encodedMessage.split(";"); // Split koden og vurderingen
        if (!codePart) throw new Error("Ingen kodet melding funnet.");

        console.log("Code part:", codePart);
        console.log("Vurdering part:", vurderingPart || "Ingen vurdering tilgjengelig.");

        const dangerLevels = codePart.slice(0, 3).split("").map(d => decodeBase36(d));
        console.log("Decoded danger levels:", dangerLevels);

        const avalancheProblems = [];
        const problemData = codePart.slice(3);

        console.log("Problem data segment:", problemData);

        for (let i = 0; i < problemData.length; i += 9) {
            const segment = problemData.slice(i, i + 9);
            if (segment.length < 9) {
                console.warn("Incomplete segment detected:", segment);
                continue;
            }

            console.log("Processing segment:", segment);

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

        console.log("Decoded avalanche problems:", avalancheProblems);

        return { dangerLevels, avalancheProblems, vurdering: vurderingPart || "Ingen vurdering tilgjengelig." };
    } catch (error) {
        console.error("Feil under dekoding:", error);
        throw new Error("Feil under dekoding av melding.");
    }
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


// Funksjon for å dekode Base36-verdi
function decodeBase36(value) {
    console.log("Decoding Base36 value:", value);
    return parseInt(value, 36);
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
// Sørg for at koden kjører etter at DOM-en er lastet
// Event listener for skreddekoder
document.addEventListener("DOMContentLoaded", () => {
    console.log("Avalanche decoder loaded.");

    document.getElementById("decodeAvalancheButton").addEventListener("click", () => {
        const encodedMessage1 = document.getElementById("encodedAvalancheMessage1").value.trim();
        const encodedMessage2 = document.getElementById("encodedAvalancheMessage2").value.trim();

        console.log("Encoded Message Part 1:", encodedMessage1);
        console.log("Encoded Message Part 2:", encodedMessage2);

        const fullMessage = `${encodedMessage1}${encodedMessage2}`;
        console.log("Full Encoded Message:", fullMessage);

        try {
            const decoded = decodeAvalancheMessage(fullMessage);

            document.getElementById("dangerLevels").textContent = `Faregrader: ${decoded.dangerLevels.join(", ")}`;
            document.getElementById("vurdering").textContent = `Vurdering: ${decoded.vurdering}`;

            const tableBody = document.getElementById("avalancheTable").querySelector("tbody");
            tableBody.innerHTML = "";

            decoded.avalancheProblems.forEach(problem => {
                const row = document.createElement("tr");

                Object.values(problem).forEach(value => {
                    const cell = document.createElement("td");
                    if (value.includes("N") || value.includes("S")) {
                        cell.innerHTML = generateDirectionGraphic(value);
                    } else {
                        cell.textContent = value;
                    }
                    row.appendChild(cell);
                });

                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error("Error decoding avalanche message:", error);
            alert(error.message);
        }
    });
});
