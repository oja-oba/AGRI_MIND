// --- Navigation Tabs ---
const navItems = document.querySelectorAll(".nav-item");
const content = document.getElementById("content");
const langSwitcher = document.getElementById("langSwitcher");

// --- Language Data ---
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
  }
};

let currentLang = "en";

// --- Language Switcher ---
langSwitcher.addEventListener("click", () => {
  const langs = ["en", "yo", "ig", "ha"];
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

// --- Section Content ---
const sections = {
  diagnose: document.getElementById("diagnoseSection"),
  sms: `<section class="container"><h1 class="title" data-key="sms">SMS Support</h1><p data-key="smsContent">${translations[currentLang].smsContent}</p></section>`,
  weather: `<section class="container"><h1 class="title" data-key="weather">Weather</h1><p data-key="weatherContent">${translations[currentLang].weatherContent}</p></section>`,
  dashboard: `<section class="container"><h1 class="title" data-key="dashboard">Dashboard</h1><p data-key="dashboardContent">${translations[currentLang].dashboardContent}</p></section>`
};

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
    }
  });
});

// --- Image Upload Logic ---
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
