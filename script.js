// Replace with your published Google Sheet CSV link
const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTteP2NIiGzPK3qMd5j9JIW9ao9K-WqSG17mtg6yYerMx6D0jAhps9HzylBk8thkYfZKpusRLayRzOd/pub?gid=814693963&single=true&output=csv";


function getTodayName() {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[new Date().getDay()];
}

function renderMenu(data, selectedDay) {
  const menuDisplay = document.getElementById("menuDisplay");
  menuDisplay.innerHTML = "";

  const row = data.find(r => r.Day.toLowerCase() === selectedDay.toLowerCase());
  if (!row) {
    menuDisplay.innerHTML = `<p>No menu found for ${selectedDay}</p>`;
    return;
  }

  ["Breakfast", "Lunch", "Snacks", "Dinner"].forEach(meal => {
    if (row[meal]) {
      const div = document.createElement("div");
      div.className = "meal";
      div.innerHTML = `<span>${meal}:</span> ${row[meal]}`;
      menuDisplay.appendChild(div);
    }
  });
}

function setupTabs(data, today) {
  const tabs = document.getElementById("dayTabs");
  tabs.innerHTML = "";

  const days = data.map(r => r.Day);
  days.forEach(day => {
    const btn = document.createElement("button");
    btn.innerText = day;
    btn.classList.toggle("active", day.toLowerCase() === today.toLowerCase());
    btn.onclick = () => {
      document.querySelectorAll(".tabs button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderMenu(data, day);
    };
    tabs.appendChild(btn);
  });
}

// Load and parse CSV
Papa.parse(sheetUrl, {
  download: true,
  header: true,
  complete: function(results) {
    const data = results.data;
    const today = getTodayName();
    setupTabs(data, today);
    renderMenu(data, today);
  }
});
