import { wmoDesc } from "./wmoDesc.js";
const weatherLookup = wmoDesc;

export const setPlaceholderText = () => {
  const input = document.getElementById("searchBar__text");
  window.innerWidth < 400
    ? (input.placeholder = "City, State, Country")
    : (input.placeholder = "City, State, Country, or Zip Code");
};

export const addSpinner = (element) => {
  animateButton(element);
  setTimeout(animateButton, 1000, element);
};

const animateButton = (element) => {
  element.classList.toggle("none");
  element.nextElementSibling.classList.toggle("block");
  element.nextElementSibling.classList.toggle("none");
};

export const displayError = (headerMsg, srMsg) => {
  updateWeatherLocationHeader(headerMsg);
  updateScreenReaderConfirmation(srMsg);
};

export const displayApiError = (statusCode) => {
  const properMsg = toProperCase(statusCode.message);
  updateWeatherLocationHeader(properMsg);
  updateScreenReaderConfirmation(`${statusCode}. Please try again.`);
};

const toProperCase = (text) => {
  const words = text.split(" ");
  const properWords = words.map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
  return properWords.join(" ");
};

const updateWeatherLocationHeader = (message) => {
  const h2 = document.getElementById("currentForecast__location");
  if (message.indexOf("Lat:") !== -1 && message.indexOf("Lon:") !== -1) {
    const msgArray = message.split(" ");
    const mapArray = msgArray.map((msg) => {
      return msg.replace(":", ": ");
    });
    const lat =
      mapArray[0].indexOf("-") === -1
        ? mapArray[0].slice(0, 10)
        : mapArray[0].slice(0, 11);
    const lon =
      mapArray[1].indexOf("-") === -1
        ? mapArray[1].slice(0, 10)
        : mapArray[1].slice(0, 11);
    h2.textContent = `${lat} • ${lon}`;
  } else {
    h2.textContent = message;
  }
};

export const updateScreenReaderConfirmation = (message) => {
  document.getElementById("confirmation").textContent = message;
};

export const updateDisplay = (weatherJson, locationObj) => {
  fadeDisplay();
  clearDisplay();
  const weatherClass = getWeatherClass(
    weatherJson.current.weather_code,
    weatherJson.current.is_day
  );
  console.log(weatherClass);
  setBgImage(weatherClass);
  const screenReaderWeather = buildScreenReaderWeather(
    weatherJson,
    locationObj
  );
  updateScreenReaderConfirmation(screenReaderWeather);
  updateWeatherLocationHeader(locationObj.getName());
  const ccArray = createCurrentConditionsDivs(
    weatherJson,
    locationObj.getUnit()
  );
  displayCurrentConditions(ccArray);
  displaySixDayForecast(weatherJson);
  setFocusOnSearch();
  fadeDisplay();
};

const fadeDisplay = () => {
  const cc = document.getElementById("currentForecast");
  cc.classList.toggle("zero-vis");
  cc.classList.toggle("fade-in");
  const sixDay = document.getElementById("dailyForecast");
  sixDay.classList.toggle("zero-vis");
  sixDay.classList.toggle("fade-in");
};

const clearDisplay = () => {
  const currentConditions = document.getElementById(
    "currentForecast__conditions"
  );
  deleteContents(currentConditions);
  const sixDayForecast = document.getElementById("dailyForecast__content");
  deleteContents(sixDayForecast);
};

const deleteContents = (parentElement) => {
  let child = parentElement.lastElementChild;
  while (child) {
    parentElement.removeChild(child);
    child = parentElement.lastElementChild;
  }
};

const getWeatherClass = (wmoCode, isDay) => {
  let weatherClass;
  if (isDay == "1") {
    weatherClass = weatherLookup[wmoCode].day.description;
  } else {
    weatherClass = weatherLookup[wmoCode].night.description + " Night";
  }
  return weatherClass;
};

const setBgImage = (weatherDesc) => {
  const regex = / /g;
  const weatherClass = weatherDesc.replaceAll(regex, "_");
  console.log(weatherClass);
  document.documentElement.classList.add(weatherClass);
  document.documentElement.classList.forEach((img) => {
    if (img !== weatherClass) document.documentElement.classList.remove(img);
  });
};

const buildScreenReaderWeather = (weatherJson, locationObj) => {
  const wmoCode = weatherJson.current.weather_code;
  const isDay = weatherJson.current.is_day === "1" ? "day" : "night";
  const location = locationObj.getName();
  const unit = locationObj.getUnit();
  const tempUnit = unit === "imperial" ? "Farenheit" : "Celcius";
  return `${weatherLookup}.${wmoCode}.${isDay}.description and ${Math.round(
    Number(weatherJson.current.temperature_2m)
  )}°${tempUnit} in ${location}`;
};

const setFocusOnSearch = () => {
  document.getElementById("searchBar__text").focus();
};

const createCurrentConditionsDivs = (weatherObj, unit) => {
  const tempUnit = unit === "Imperial" ? "F" : "C";
  const windUnit = unit === "Imperial" ? "mph" : "Km/h";

  const wmoCode = weatherObj.current.weather_code;
  const isDay = weatherObj.current.is_day == "1" ? "day" : "night";
  const icon = createMainImageDiv(
    wmoCode,
    isDay,
    weatherLookup[wmoCode][isDay].description
  );
  const temp = createElem(
    "div",
    "temp",
    `${Math.round(Number(weatherObj.current.temperature_2m))}°`,
    unit
  );
  const desc = createElem(
    "div",
    "desc",
    weatherLookup[wmoCode][isDay].description
  );
  const feels = createElem(
    "div",
    "feels",
    `Feels Like ${Math.round(
      Number(weatherObj.current.apparent_temperature)
    )}${tempUnit}°`
  );
  const maxTemp = createElem(
    "div",
    "maxtemp",
    `High ${Math.round(
      Number(weatherObj.daily.temperature_2m_max[0])
    )}${tempUnit}°`
  );
  const minTemp = createElem(
    "div",
    "mintemp",
    `Low ${Math.round(
      Number(weatherObj.daily.temperature_2m_min[0])
    )}${tempUnit}°`
  );
  const humidity = createElem(
    "div",
    "humidity",
    `Humidity ${Math.round(Number(weatherObj.current.relative_humidity_2m))}%`
  );
  const wind = createElem(
    "div",
    "wind",
    `Wind ${Math.round(Number(weatherObj.current.wind_speed_10m))} ${windUnit}`
  );
  return [icon, temp, desc, feels, maxTemp, minTemp, humidity, wind];
};

const createMainImageDiv = (wmoCode, isDay, altText) => {
  const iconDiv = createElem("div", "icon");
  iconDiv.id = "icon";
  const isDayOrNight = isDay;
  const faIcon = translateIconToFontAwesome(wmoCode, isDayOrNight);
  faIcon.ariaHidden = true;
  faIcon.title = altText;
  iconDiv.appendChild(faIcon);
  return iconDiv;
};

const createElem = (elemType, divClassName, divText, unit) => {
  const div = document.createElement(elemType);
  const tempUnit = unit === "Imperial" ? "F" : "C";
  div.className = divClassName;
  if (divText) {
    div.textContent = divText;
  }
  if (divClassName === "temp") {
    const unitDiv = document.createElement("div");
    unitDiv.classList.add("unit");
    unitDiv.textContent = tempUnit;
    div.appendChild(unitDiv);
  }
  return div;
};

const translateIconToFontAwesome = (wmoCode, isDayOrNight) => {
  const i = document.createElement("i");
  switch (wmoCode) {
    case 0:
      if (isDayOrNight === "day") {
        i.classList.add("fas", "fa-sun");
      } else {
        i.classList.add("fas", "fa-moon");
      }
      break;
    case 1:
      if (isDayOrNight === "day") {
        i.classList.add("fas", "fa-sun");
      } else {
        i.classList.add("fas", "fa-moon");
      }
      break;
    case 2:
      if (isDayOrNight === "day") {
        i.classList.add("fas", "fa-cloud-sun");
      } else {
        i.classList.add("fas", "fa-cloud-moon");
      }
      break;
    case 3:
      if (isDayOrNight === "day") {
        i.classList.add("fas", "fa-cloud-sun");
      } else {
        i.classList.add("fas", "fa-cloud-moon");
      }
      break;
    case 45:
      i.classList.add("fas", "fa-smog");
      break;
    case 48:
      i.classList.add("fas", "fa-smog");
      break;
    case 51:
      if (isDayOrNight === "day") {
        i.classList.add("fas", "fa-cloud-sun-rain");
      } else {
        i.classList.add("fas", "fa-cloud-moon-rain");
      }
      break;
    case 53:
      if (isDayOrNight === "day") {
        i.classList.add("fas", "fa-cloud-sun-rain");
      } else {
        i.classList.add("fas", "fa-cloud-moon-rain");
      }
    case 61:
      if (isDayOrNight === "day") {
        i.classList.add("fas", "fa-cloud-sun-rain");
      } else {
        i.classList.add("fas", "fa-cloud-moon-rain");
      }
      break;
    case 55:
      i.classList.add("fas", "fa-cloud-rain");
      break;
    case 56:
      i.classList.add("fas", "fa-cloud-rain");
      break;
    case 57:
      i.classList.add("fas", "fa-cloud-rain");
      break;
    case 63:
      i.classList.add("fas", "fa-cloud-rain");
      break;
    case 65:
      i.classList.add("fas", "fa-cloud-rain");
      break;
    case 66:
      i.classList.add("fas", "fa-cloud-rain");
      break;
    case 67:
      i.classList.add("fas", "fa-cloud-rain");
      break;
    case 71:
      i.classList.add("fas", "fa-snowflake");
      break;
    case 73:
      i.classList.add("fas", "fa-snowflake");
      break;
    case 75:
      i.classList.add("fas", "fa-snowflake");
      break;
    case 77:
      i.classList.add("fas", "fa-snowflake");
      break;
    case 80:
      i.classList.add("fas", "fa-cloud-rain");
      break;
    case 81:
      i.classList.add("fas", "fa-cloud-rain");
      break;
    case 82:
      i.classList.add("fas", "fa-cloud-rain");
      break;
    case 85:
      i.classList.add("fas", "fa-snowflake");
      break;
    case 86:
      i.classList.add("fas", "fa-snowflake");
      break;
    case 95:
      i.classList.add("fas", "fa-poo-storm");
      break;
    case 96:
      i.classList.add("fas", "fa-poo-storm");
      break;
    case 99:
      i.classList.add("fas", "fa-poo-storm");
      break;
    default:
      i.classList.add("far", "fa-question-circle");
  }
  return i;
};

const displayCurrentConditions = (currentConditionsArray) => {
  const ccContainer = document.getElementById("currentForecast__conditions");
  currentConditionsArray.forEach((cc) => {
    ccContainer.appendChild(cc);
  });
};

const displaySixDayForecast = (weatherJson) => {
  const dfArray = createDailyForecastDiv(weatherJson.daily);
  displayDailyForecast(dfArray);
};

const createDailyForecastDiv = (dailyObj) => {
  //console.log(dailyObj);
  const wmoCode = dailyObj.weather_code;
  let dayDateArray = [];
  for (let i = 1; i <= 6; i++) {
    dayDateArray.push(dailyObj.time[i]);
  }
  let dayHighArray = [];
  for (let i = 1; i <= 6; i++) {
    dayHighArray.push(dailyObj.temperature_2m_max[i]);
  }
  let dayLowArray = [];
  for (let i = 1; i <= 6; i++) {
    dayLowArray.push(dailyObj.temperature_2m_min[i]);
  }
  let dailyIcon = [];
  for (let i = 0; i <= 5; i++) {
    dailyIcon.push(createDailyIcon(wmoCode[i]));
  }
  let dfArray = [];
  for (let i = 0; i <= 5; i++) {
    dfArray.push([dayDateArray[i], dayHighArray[i], dayLowArray[i]]);
  }
  const weekday = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  let dayNameArray = [];
  for (let i = 0; i <= 5; i++) {
    let date = new Date(dayDateArray[i]);
    let day = weekday[date.getDay()].slice(0, 3);
    dayNameArray.push(day);
  }

  let dfDivArray = [];
  for (let i = 0; i <= 5; i++) {
    dfDivArray.push([
      createElem("p", "dayDate", dayNameArray[i]),
      dailyIcon[i],
      createElem("p", "dayHigh", dayHighArray[i] + "°"),
      createElem("p", "dayLow", dayLowArray[i] + "°"),
    ]);
  }
  return dfDivArray;
};

const createDailyIcon = (wmoCode) => {
  const url = wmoDesc[wmoCode].day.image;
  let img = document.createElement("img");
  img.src = url;
  img.alt = "icon";
  return img;
};

const displayDailyForecast = (dfArray) => {
  let i = 0;
  while (i <= 5) {
    const dayDiv = createElem("div", "forecastDay");
    let dfElem = dfArray[i];
    dfElem.forEach((el) => {
      dayDiv.appendChild(el);
    });
    i++;
    const dailyForecastContainer = document.getElementById(
      "dailyForecast__content"
    );
    dailyForecastContainer.appendChild(dayDiv);
  }
};
