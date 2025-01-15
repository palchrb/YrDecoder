function decodeWeatherMessage(encodedMessage) {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

  // Funksjon for å dekode Base36 verdier
  const decodeBase36 = (value) => parseInt(value, 36);

  // Splitter meldingen inn i timer (separert med ";")
  const hours = encodedMessage.split(";");

  return hours.map((hourData, index) => {
    if (hourData.length < 10) {
      return {
        time: `${index}:00`,
        temp: "N/A",
        precip: "N/A",
        wind: "N/A",
        gust: "N/A",
        cloud: "N/A",
        direction: "N/A",
      };
    }

    try {
      const time = decodeBase36(hourData.slice(0, 1)); // Tid
      const temp = parseInt(hourData.slice(1, 3)); // Temperatur (-99 til +99)
      const wind = decodeBase36(hourData.slice(3, 5)); // Vindstyrke (m/s)
      const gust = decodeBase36(hourData.slice(5, 7)); // Vindkast (m/s)
      const cloud = parseInt(hourData.slice(7, 8)) * 10; // Skydekke (%)
      const precip = parseInt(hourData.slice(8, 9)); // Nedbør (mm)
      const direction = directions.find((_, i) => i === decodeBase36(hourData.slice(9))); // Vindretning

      // Hvis dataen ikke er komplett eller gyldig, returner tomme verdier
      if (isNaN(temp) || isNaN(wind) || isNaN(gust) || isNaN(cloud) || isNaN(precip) || !direction) {
        return {
          time: `${time}:00`,
          temp: "N/A",
          precip: "N/A",
          wind: "N/A",
          gust: "N/A",
          cloud: "N/A",
          direction: "N/A",
        };
      }

      return {
        time: `${time}:00`,
        temp: `${temp}°C`,
        precip: `${precip} mm`,
        wind: `${wind} m/s`,
        gust: `(${gust}) m/s`,
        cloud: `${cloud}%`,
        direction: direction || "N/A",
      };
    } catch (error) {
      console.error("Feil ved dekoding:", error);
      return {
        time: `${index}:00`,
        temp: "N/A",
        precip: "N/A",
        wind: "N/A",
        gust: "N/A",
        cloud: "N/A",
        direction: "N/A",
      };
    }
  });
}
