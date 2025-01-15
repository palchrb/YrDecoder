function decodeMessage(encodedMessage) {
    try {
        if (!encodedMessage || encodedMessage.trim() === "") {
            throw new Error("No message provided");
        }

        const entries = encodedMessage.split(';').filter(Boolean);
        console.log("Entries to decode:", entries);

        return entries.map((entry) => {
            // Format validation: TTWWGGCCPPDD (10 characters)
            if (entry.length !== 10) {
                throw new Error(`Invalid entry length for: ${entry}`);
            }

            const timeBase36 = entry[0];
            const time = parseInt(timeBase36, 36);

            const tempSign = entry[1] === '-' ? -1 : 1;
            const temp = tempSign * parseInt(entry.slice(tempSign === -1 ? 2 : 1, tempSign === -1 ? 3 : 2), 10);

            const windSpeed = parseInt(entry.slice(2, 4), 36);
            const gustSpeed = parseInt(entry.slice(4, 6), 36);

            const cloudCover = parseInt(entry[6], 10) * 10;
            const precipitation = parseInt(entry.slice(7, 9), 36);
            const windDirection = entry.slice(9);

            return {
                time: `${time}:00`,
                temp,
                precip: `${precipitation} mm`,
                wind: `${windSpeed} (${gustSpeed})`,
                direction: windDirection,
                cloud: `${cloudCover}%`,
            };
        });
    } catch (error) {
        console.error("Error decoding message:", error);
        throw new Error("Failed to decode the message. Please check the input.");
    }
}
