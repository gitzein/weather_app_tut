const WEATHER_API_key = "";
export const setLocationObject = (locationObj, coordsObj) => {
  const { lat, lon, name, unit } = coordsObj;
  locationObj.setLat(lat);
  locationObj.setLon(lon);
  locationObj.setName(name);
  if (unit) {
    locationObj.setUnit(unit);
  }
};

export const getHomeLocation = () => {
  return localStorage.getItem("defaultWeatherLocation");
};

export const getWeatherFromCoords = async (locationObj) => {
  const lat = locationObj.getLat();
  const lon = locationObj.getLon();
  const unit = locationObj.getUnit();
  const imperialUnit = "&temperature_unit=fahrenheit&wind_speed_unit=mph";
  let url = "";
  if (unit === "Imperial") {
    url = `https://api.open-meteo.com/v1/gfs?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min${imperialUnit}&timezone=auto`;
  } else {
    url = `https://api.open-meteo.com/v1/gfs?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
  }
  try {
    const weatherStream = await fetch(url);
    const weatherJson = await weatherStream.json();
    return weatherJson;
  } catch (err) {
    console.error(err);
  }
};

export const getCoordsFromApi = async (entryText, units) => {
  const regex = /^\d+$/g;
  const flag = regex.test(entryText) ? "zip" : "q";
  const url = `https://api.openweathermap.org/data/2.5/weather?${flag}=${entryText}&units=${units}&appid=${WEATHER_API_key}`;
  const encodeUrl = encodeURI(url);
  try {
    const dataStream = await fetch(encodeUrl);
    const jsonData = await dataStream.json();
    return jsonData;
  } catch (err) {
    console.error(err.stack);
  }
};

export const cleanText = (text) => {
  const regex = / {2,}/g;
  const entryText = text.replaceAll(regex, " ").trim();
  return entryText;
};
