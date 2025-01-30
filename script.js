// Oppdatert Base85 -> Yr ikonfilnavn mapping
const weatherIconMapping = [
    "01d", "01n", "01m", "02d", "02n", "02m", "03d", "03n", "03m", "04",
    "05d", "05n", "05m", "06d", "06n", "06m", "07d", "07n", "07m", "08d",
    "08n", "08m", "09", "10", "11", "12", "13", "14", "15", "20d", "20n",
    "20m", "21d", "21n", "21m", "22", "23", "24d", "24n", "24m", "25d",
    "25n", "25m", "26d", "26n", "26m", "27d", "27n", "27m", "28d", "28n",
    "28m", "29d", "29n", "29m", "30", "31", "32", "33", "34", "40d", "40n",
    "40m", "41d", "41n", "41m", "42d", "42n", "42m", "43d", "43n", "43m",
    "44d", "44n", "44m", "45d", "45n", "45m", "46", "47", "48", "49", "50"
];

// Base85 til indeks-konvertering
const base85Chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#$%&()*+-;<=>?@^_`{|}~";
const base85ToInt = (char) => base85Chars.indexOf(char);

// Dekoderværmelding og mapper til ikonfiler
function decodeMessage(encodedMessage) {
    try {
        if (!encodedMessage || encodedMessage.trim() === "") {
            throw new Error("No message provided");
        }

        const entries = encodedMessage.split(';').filter(Boolean);
        console.log("Entries to decode:", entries);

        const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
        const base36ToInt = (value) => parseInt(value, 36);

        // By og dato
        const cityNameEncoded = entries.shift();
        const cityName = decodeURIComponent(cityNameEncoded);

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

            const weatherSymbolBase85 = entry.slice(6, 7);
            const weatherSymbolIndex = base85ToInt(weatherSymbolBase85);

            let weatherIconFile = "01d"; // Default til "01d" hvis feil
            if (weatherSymbolIndex >= 0 && weatherSymbolIndex < weatherIconMapping.length) {
                weatherIconFile = weatherIconMapping[weatherSymbolIndex];
            } else {
                console.error(`Invalid Base85 weather index: ${weatherSymbolIndex}`);
            }

            const precipBase36 = entry.slice(7, 9);
            const precip = base36ToInt(precipBase36) / 10;

            const directionBase36 = entry.slice(9, 10);
            const direction = directions[base36ToInt(directionBase36) % 8];

            console.log(`Decoded: ${time}:00, Temp: ${temp}, Wind: ${wind}, Gust: ${gust}, Icon: ${weatherIconFile}`);

            return {
                time: `${time}:00`,
                temp: `${temp}`,
                precip: precip === 0 ? "" : `${precip.toFixed(1)}`,
                wind: `${wind} (${gust})`,
                direction: direction,
                icon: `svg/${weatherIconFile}.svg`
            };
        });

        return { cityName, date: decodedDate, data: weatherData };
    } catch (error) {
        console.error("Error decoding message:", error);
        throw new Error("Failed to decode the message. Please check the input.");
    }
}

// Event listener for PWA
const decodeButton = document.getElementById("decodeButton");
if (decodeButton) {
    decodeButton.addEventListener("click", () => {
        const part1 = document.getElementById("encodedMessage").value.trim();
        const part2 = document.getElementById("encodedMessagePart2").value.trim();

        const fullMessage = `${part1}${part2}`;
        console.log("Full message to decode:", fullMessage);

        try {
            const decoded = decodeMessage(fullMessage);

            document.getElementById("weatherDate").textContent = `Sted: ${decoded.cityName}, Dato: ${decoded.date}`;

            const tableBody = document.getElementById("weatherTable").querySelector("tbody");
            tableBody.innerHTML = "";

            decoded.data.forEach((data) => {
                const row = document.createElement("tr");

                const timeCell = document.createElement("td");
                timeCell.textContent = data.time;
                row.appendChild(timeCell);

                const iconCell = document.createElement("td");
                const iconImg = document.createElement("img");
                iconImg.src = data.icon;
                iconImg.alt = "Weather Icon";
                iconImg.style.width = "32px";
                iconImg.style.height = "32px";
                iconCell.appendChild(iconImg);
                row.appendChild(iconCell);
                
                const tempCell = document.createElement("td");
                tempCell.textContent = data.temp;
                row.appendChild(tempCell);

                const precipCell = document.createElement("td");
                precipCell.textContent = data.precip;
                row.appendChild(precipCell);

                const windCell = document.createElement("td");
                windCell.textContent = data.wind;
                row.appendChild(windCell);

                const directionCell = document.createElement("td");
                directionCell.textContent = data.direction;
                row.appendChild(directionCell);

                tableBody.appendChild(row);
            });
        } catch (error) {
            alert(error.message);
        }
    });
}

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("/service-worker.js")
            .then((registration) => {
                console.log("Service Worker registrert med omfang:", registration.scope);
            })
            .catch((error) => {
                console.error("Service Worker registrering feilet:", error);
            });
    });
}


