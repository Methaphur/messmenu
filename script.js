const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTteP2NIiGzPK3qMd5j9JIW9ao9K-WqSG17mtg6yYerMx6D0jAhps9HzylBk8thkYfZKpusRLayRzOd/pub?gid=814693963&single=true&output=csv";

const daysOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
let menuData = {};

async function fetchMenu() {
  try {
    const response = await fetch(csvUrl);
    const csvText = await response.text();
    const rows = csvText.split("\n").map(r => r.split(","));
    
    // Assuming: Timestamp, Day, Breakfast, Lunch, Dinner in sheet
    const headers = rows[0];
    const dataRows = rows.slice(1).filter(r => r.length >= 5);

    if (dataRows.length === 0) return;

    // Take the first row's timestamp
    const firstTimestamp = new Date(dataRows[0][0]);
    const weekRange = getWeekRange(firstTimestamp);
    document.getElementById("week-title").textContent = `${weekRange.start} - ${weekRange.end} Mess Menu`;

    // Build menuData sorted by daysOrder
    dataRows.forEach(row => {
      const [timestamp, day, breakfast, lunch, dinner] = row.map(x => x.trim());
      if (!day || !daysOrder.includes(day)) return;
      menuData[day] = { breakfast, lunch, dinner };
    });

    // Render Sunday → Saturday in order
    renderTabs();
    renderMenu("Sunday");
  } catch (err) {
    console.error("Error fetching menu:", err);
  }
}

function getWeekRange(date) {
  const day = date.getDay(); // 0 = Sunday
  const sunday = new Date(date);
  sunday.setDate(date.getDate() - day);

  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);

  return {
    start: formatDate(sunday),
    end: formatDate(saturday)
  };
}

function formatDate(date) {
  const options = { month: "short", day: "numeric" };
  return date.toLocaleDateString(undefined, options);
}

function renderTabs() {
  const tabsContainer = document.querySelector(".tabs");
  tabsContainer.innerHTML = "";

  daysOrder.forEach(day => {
    if (menuData[day]) {
      const btn = document.createElement("button");
      btn.textContent = day;
      btn.onclick = () => {
        document.querySelectorAll(".tabs button").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderMenu(day);
      };
      tabsContainer.appendChild(btn);
    }
  });

  // Mark Sunday as default
  if (tabsContainer.firstChild) {
    tabsContainer.firstChild.classList.add("active");
  }
}

function renderMenu(day) {
  const menuContainer = document.getElementById("menu");
  menuContainer.innerHTML = "";

  const meals = menuData[day];
  for (let [meal, value] of Object.entries(meals)) {
    const div = document.createElement("div");
    div.className = "meal";
    div.innerHTML = `<span>${meal.toUpperCase()}:</span> ${value || "Not available"}`;
    menuContainer.appendChild(div);
  }
}

fetchMenu();
