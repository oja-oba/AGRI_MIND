// --- Navigation and Language ---
const navItems = document.querySelectorAll(".nav-item");
const content = document.getElementById("content");
const langSwitcher = document.getElementById("langSwitcher");

const translations = {
  en: {
    title: "AgriMind",
    tagline: "The AI Crop Doctor for Low-Connectivity Farmers",
    diagnose: "Diagnose",
    sms: "SMS Support",
    weather: "Weather",
    dashboard: "Dashboard",
    diagnoseTitle: "Disease Diagnosis",
    diagnoseSub: "Upload or capture an image of the affected crop",
    takePhoto: "Take Photo",
    upload: "Upload Image",
    preview: "Preview:",
    smsContent: "Send a crop description via SMS for AI-powered diagnosis.",
    weatherContent: "Check your local weather forecast for farming decisions.",
    dashboardContent: "Your farm insights and analysis will appear here soon."
  },
  yo: {
    title: "AgriMind",
    tagline: "Dókítà Ọgbìn ọlọ́gbọ́n fún Agbẹ ní àgbègbè tó ní àìlera intanẹẹti",
    diagnose: "Ṣàyẹ̀wò",
    sms: "Ìrànwọ́ SMS",
    weather: "Ojú-ọ̀run",
    dashboard: "Dasibodu",
    diagnoseTitle: "Ìdánwò Àrùn",
    diagnoseSub: "Ṣe àtàwọ̀n tàbí kó àwòrán ọgbìn tó ní àrùn",
    takePhoto: "Ya Àwòrán",
    upload: "Gbé Àwòrán sórí",
    preview: "Àwòrán:",
    smsContent: "Firanṣẹ̀ apejuwe ọgbìn pẹ̀lú SMS fún ìtọ́nisọ́nà ọlọ́gbọ́n.",
    weatherContent: "Ṣàyẹ̀wò asọtẹ́lẹ̀ oju-ọ̀run ilé rẹ fún iṣẹ́ àgbẹ̀.",
    dashboardContent: "Àwọn àfihàn àti àtúpalẹ̀ oko rẹ yóò hàn níbí."
  },
  ig: {
    title: "AgriMind",
    tagline: "AI Dọkịta Ọhịa maka Ndị Ọrụ Ugbo",
    diagnose: "Nyocha",
    sms: "Nkwado SMS",
    weather: "Ihu igwe",
    dashboard: "Dashboard",
    diagnoseTitle: "Nyocha Ọrịa",
    diagnoseSub: "Bulite ma ọ bụ were foto nke mkpụrụ osisi mebiri emebi",
    takePhoto: "Were Foto",
    upload: "Bulite Foto",
    preview: "Nlele:",
    smsContent: "Zipu nkọwa nke mkpụrụ osisi site na SMS maka nchọpụta AI.",
    weatherContent: "Lelee ihu igwe mpaghara gị maka ọrụ ugbo.",
    dashboardContent: "Ihe ọmụma na nyocha ubi gị ga-apụta ebe a."
  },
  ha: {
    title: "AgriMind",
    tagline: "Likitan AI Na Gona Ga Manoma Masu Karancin Intanet",
    diagnose: "Bincika",
    sms: "Taimakon SMS",
    weather: "Yanayi",
    dashboard: "Dashboard",
    diagnoseTitle: "Binciken Cuta",
    diagnoseSub: "Ɗora ko ɗauki hoto na shuka mai matsala",
    takePhoto: "Dauki Hoto",
    upload: "Loda Hoto",
    preview: "Hoton:",
    smsContent: "Aika bayanin shuka ta SMS don taimakon AI.",
    weatherContent: "Duba hasashen yanayi don shirye-shiryen aikin gona.",
    dashboardContent: "Bayanan gonarka za su bayyana anan."
  },
  pg: {
    title: "AgriMind",
    tagline: "Di AI Crop Doctor wey sabi help farmers wey no get better internet",
    diagnose: "Check Disease",
    sms: "SMS Help",
    weather: "Weather",
    dashboard: "Dashboard",
    diagnoseTitle: "Check Crop Disease",
    diagnoseSub: "Upload or snap di leaf wey dey sick",
    takePhoto: "Snap Picture",
    upload: "Upload Picture",
    preview: "Preview:",
    smsContent: "Send message about di crop make AI help diagnose am.",
    weatherContent: "Check weather forecast before you go farm.",
    dashboardContent: "Your farm info go show here soon."
  }
};

let currentLang = "en";

langSwitcher.addEventListener("click", () => {
  const langs = ["en", "yo", "ig", "ha", "pg"];
  const nextIndex = (langs.indexOf(currentLang) + 1) % langs.length;
  currentLang = langs[nextIndex];
  langSwitcher.innerHTML = `<i class="fas fa-globe"></i> ${currentLang.toUpperCase()}`;
  updateLanguage();
});

function updateLanguage() {
  document.querySelectorAll("[data-key]").forEach(el => {
    const key = el.getAttribute("data-key");
    if (translations[currentLang][key]) {
      el.textContent = translations[currentLang][key];
    }
  });
}

// --- Weather Section (GPS-based + 3-day Forecast) ---
async function loadWeather() {
  const apiKey = "4004f22137594867aba174613250311"; // your working key
  const container = document.getElementById("weatherContainer");
  container.innerHTML = `<p>Detecting your location...</p>`;

  if (!navigator.geolocation) {
    container.innerHTML = `<p>⚠️ Geolocation not supported by your browser.</p>`;
    return;
  }

  navigator.geolocation.getCurrentPosition(async position => {
    const { latitude, longitude } = position.coords;
    container.innerHTML = `<p>Fetching weather for your location...</p>`;

    try {
      // Get both current and forecast data (3 days)
      const url = `https://corsproxy.io/?https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${latitude},${longitude}&days=3`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Bad response");
      const data = await res.json();

      const weather = data.current;
      const loc = data.location;
      const forecastDays = data.forecast.forecastday;

      // Current Weather
      let html = `
        <h3>${loc.name}, ${loc.country}</h3>
        <img src="https:${weather.condition.icon}" alt="weather icon" style="width:60px;height:60px;">
        <p>${weather.condition.text}</p>
        <p>🌡️ Temperature: ${weather.temp_c}°C</p>
        <p>💧 Humidity: ${weather.humidity}%</p>
        <p>💨 Wind: ${weather.wind_kph} km/h</p>
        <hr style="margin:20px 0;">
        <h4>3-Day Forecast</h4>
        <div class="forecast-grid">
      `;

      // Forecast for next 3 days
      forecastDays.forEach(day => {
        html += `
          <div class="forecast-card">
            <p><b>${day.date}</b></p>
            <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
            <p>${day.day.condition.text}</p>
            <p>🌡️ ${day.day.avgtemp_c}°C</p>
            <p>🌧️ ${day.day.daily_chance_of_rain}% rain</p>
          </div>
        `;
      });

      html += `</div>`;
      container.innerHTML = html;

    } catch (error) {
      console.error(error);
      container.innerHTML = `<p>⚠️ Unable to fetch weather data.</p>`;
    }
  }, () => {
    container.innerHTML = `<p>⚠️ Location permission denied. Please enable GPS for accurate weather.</p>`;
  });
}


const weatherTemplate = `
  <section class="container weather">
    <h1 class="title" data-key="weather">Weather</h1>
    <p data-key="weatherContent">${translations[currentLang].weatherContent}</p>
    <div id="weatherContainer" class="weather-card"></div>
  </section>
`;

// --- Sections ---
const sections = {
  diagnose: document.getElementById("diagnoseSection"),
  sms: `
  <section class="container sms">
    <h1 class="title" data-key="sms">SMS Support</h1>
    <p data-key="smsContent">${translations[currentLang].smsContent}</p>
    <div class="sms-box">
      <textarea id="smsMessage" placeholder="Describe your crop issue..."></textarea>
      <button id="sendSMS" class="btn send-btn">
        <i class="fa-regular fa-paper-plane"></i> Send
      </button>
    </div>
    <p id="smsStatus"></p>
  </section>`,
  weather: weatherTemplate,
  dashboard: `
  <section class="container dashboard">
    <h1 class="title" data-key="dashboard">Dashboard</h1>
    <div class="stats">
      <div class="card"><h2 id="totalScans">0</h2><p>Total Scans</p></div>
      <div class="card"><h2 id="activeFarmers">0</h2><p>Active Farmers</p></div>
      <div class="card"><h2 id="diseasesDetected">0</h2><p>Diseases Detected</p></div>
      <div class="card"><h2 id="successRate">0%</h2><p>Success Rate</p></div>
    </div>
    <div class="chart-section">
      <h3>Most Common Diseases</h3>
      <div id="commonDiseases" class="bars"></div>
    </div>
    <div class="activity-section">
      <h3>Recent Activity</h3>
      <ul id="recentActivity" class="activity-list"></ul>
    </div>
  </section>`
};

// --- Navigation ---
navItems.forEach(item => {
  item.addEventListener("click", () => {
    navItems.forEach(btn => btn.classList.remove("active"));
    item.classList.add("active");

    const section = item.dataset.section;
    if (section === "diagnose") {
      content.innerHTML = "";
      content.appendChild(sections.diagnose);
    } else {
      content.innerHTML = sections[section];
      updateLanguage();
      if (section === "weather") loadWeather();
      if (section === "dashboard") loadDashboardData();
    }
  });
});

// --- SMS Sending (Integration Ready) ---
document.addEventListener("click", async (e) => {
  if (e.target.id === "sendSMS") {
    const msg = document.getElementById("smsMessage").value.trim();
    const status = document.getElementById("smsStatus");

    if (!msg) {
      status.textContent = "Please type a message first.";
      return;
    }

    status.textContent = "Sending...";

    try {
      // 🔹 Replace this URL with your backend endpoint
      const response = await fetch("https://your-backend.com/api/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          sender: "AgriMindWeb",  // optional identifier
          timestamp: new Date().toISOString()
        }),
      });

      if (response.ok) {
        status.textContent = "✅ Message sent successfully!";
        document.getElementById("smsMessage").value = "";
      } else {
        status.textContent = "⚠️ Failed to send message. Try again.";
      }
    } catch (err) {
      console.error("SMS send error:", err);
      status.textContent = "⚠️ Error connecting to SMS service.";
    }
  }
});

// --- Dashboard Data Loader ---
async function loadDashboardData() {
  try {
    const response = await fetch("/api/dashboard");
    const data = await response.json();
    document.getElementById("totalScans").textContent = data.total_scans ?? 0;
    document.getElementById("activeFarmers").textContent = data.active_farmers ?? 0;
    document.getElementById("diseasesDetected").textContent = data.diseases_detected ?? 0;
    document.getElementById("successRate").textContent = (data.success_rate ?? 0) + "%";
  } catch (err) {
    console.error("Dashboard load error:", err);
  }
}

// --- Diagnose Upload ---
const takePhotoBtn = document.getElementById("takePhotoBtn");
const uploadImageBtn = document.getElementById("uploadImageBtn");
const cameraInput = document.getElementById("cameraInput");
const fileInput = document.getElementById("fileInput");
const previewContainer = document.getElementById("previewContainer");
const previewImage = document.getElementById("previewImage");

if (takePhotoBtn && uploadImageBtn) {
  takePhotoBtn.addEventListener("click", () => cameraInput.click());
  uploadImageBtn.addEventListener("click", () => fileInput.click());
}

function showPreview(file) {
  const reader = new FileReader();
  reader.onload = e => {
    previewContainer.style.display = "block";
    previewImage.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

cameraInput?.addEventListener("change", e => {
  if (e.target.files.length > 0) showPreview(e.target.files[0]);
});

fileInput?.addEventListener("change", e => {
  if (e.target.files.length > 0) showPreview(e.target.files[0]);
});

updateLanguage();
