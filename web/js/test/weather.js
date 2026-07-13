const cities = [
  { name: "서울", lat: 37.5665, lon: 126.9780 },
  { name: "부산", lat: 35.1796, lon: 129.0756 },
  { name: "제주", lat: 33.4996, lon: 126.5312 },
  { name: "도쿄", lat: 35.6762, lon: 139.6503 },
  { name: "뉴욕", lat: 40.7128, lon: -74.0060 }
];

const citySelect = document.getElementById("cityselect");
const weatherBtn = document.getElementById("weatherBtn");
const message = document.getElementById("message");
const weatherBox = document.getElementById("weatherBox");

function showMessage(text) {
  message.textContent = text;
}

function clearWeather() {
  weatherBox.innerHTML = "";
}

function makeCityOptions() {
  citySelect.innerHTML += cities
    .map((city) => {
      return `<option value="${city.name}">${city.name}</option>`;
    })
    .join("");
}

async function getWeather() {
  const selectedCityName = citySelect.value;

  showMessage("");
  clearWeather();

  if (selectedCityName === "") {
    showMessage("도시를 선택하세요");
    return;
  }

  const selectedCity = cities.find((city) => {
    return city.name === selectedCityName;
  });

  if (!selectedCity) {
    showMessage("존재하지 않는 도시입니다");
    return;
  }

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${selectedCity.lat}` +
    `&longitude=${selectedCity.lon}&current_weather=true`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("API 응답 실패");
    }

    const data = await response.json();
    const weather = data.current_weather;

    if (!weather) {
      showMessage("날씨 데이터가 없습니다");
      return;
    }

    const temperature = Number(weather.temperature);
    const windspeed = Number(weather.windspeed);
    const weatherCode = Number(weather.weathercode);

    if (
      Number.isNaN(temperature) ||
      Number.isNaN(windspeed) ||
      Number.isNaN(weatherCode)
    ) {
      showMessage("날씨 데이터가 없습니다");
      return;
    }

    weatherBox.innerHTML = `
      <section class="weather-card">
        <h2>${selectedCity.name}</h2>
        <p><span class="label">현재 기온</span>${temperature}℃</p>
        <p><span class="label">풍속</span>${windspeed} km/h</p>
        <p><span class="label">날씨 코드</span>${weatherCode}</p>
        <p><span class="label">조회 시간</span>${weather.time}</p>
      </section>
    `;
  } catch (error) {
    showMessage("날씨 정보를 불러오지 못했습니다");
  }
}

makeCityOptions();

weatherBtn.addEventListener("click", getWeather);