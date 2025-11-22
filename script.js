const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTteP2NIiGzPK3qMd5j9JIW9ao9K-WqSG17mtg6yYerMx6D0jAhps9HzylBk8thkYfZKpusRLayRzOd/pub?gid=814693963&single=true&output=csv";

const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
let menuData = {};

async function fetchMenu() {
  try {
    const response = await fetch(csvUrl);
    const csvText = await response.text();
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    const dataRows = parsed.data;

    if (dataRows.length === 0) return;

    // Take the first row's timestamp from "Column 1"
    const firstTimestamp = parseTimestamp(dataRows[0]["Timestamp"]);
    const weekRange = getWeekRange(firstTimestamp);
    document.getElementById("week-title").textContent = `${weekRange.start} - ${weekRange.end}`;

    // Build menuData sorted by daysOrder
    dataRows.forEach(row => {
      const day = row["Day"]?.trim();
      if (!day || !daysOrder.includes(day)) return;
      menuData[day] = {
        breakfast: row["Breakfast"]?.trim(),
        lunch: row["Lunch"]?.trim(),
        // snacks: row["Snacks"]?.trim(),
        dinner: row["Dinner"]?.trim()
      };
    });

    renderTabs();
  } catch (err) {
    console.error("Error fetching menu:", err);
  }
}

function parseTimestamp(ts) {
  // Example: "9/17/2025 9:43:24"
  const [datePart, timePart] = ts.split(" ");
  const [month, day, year] = datePart.split("/").map(Number);
  const [hour, minute, second] = timePart.split(":").map(Number);

  return new Date(year, month - 1, day, hour, minute, second || 0);
}


function getWeekRange(date) {
  const day = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  // Find Monday of this week
  const monday = new Date(date);
  const diffToMonday = (day + 6) % 7; // turns Sunday(0) → 6, Monday(1) → 0, etc.
  monday.setDate(date.getDate() - diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    start: formatDate(monday),
    end: formatDate(sunday)
  };
}

function formatDate(date) {
  const options = { month: "short", day: "numeric" };
  return date.toLocaleDateString(undefined, options);
}

function getTodayName() {
  const jsDay = new Date().getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  // convert to Monday=0 ... Sunday=6
  const mondayFirstIndex = (jsDay + 6) % 7;
  return daysOrder[mondayFirstIndex];
}

function renderTabs() {
  const tabsContainer = document.querySelector(".tabs");
  tabsContainer.innerHTML = "";

  let defaultDay = getTodayName();

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

      // If this is today’s tab, make it active
      if (day === defaultDay) {
        btn.classList.add("active");
      }
    }
  });

  // Render today’s menu if available, otherwise fall back to Sunday
  if (menuData[defaultDay]) {
    renderMenu(defaultDay);
  } else {
    const firstAvailableDay = Object.keys(menuData)[0];
    if (firstAvailableDay) {
      tabsContainer.querySelector("button").classList.add("active");
      renderMenu(firstAvailableDay);
    }
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