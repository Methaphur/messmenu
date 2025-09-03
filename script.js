const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTteP2NIiGzPK3qMd5j9JIW9ao9K-WqSG17mtg6yYerMx6D0jAhps9HzylBk8thkYfZKpusRLayRzOd/pub?gid=814693963&single=true&output=csv";

const daysOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
let menuData = {};

async function fetchMenu() {
  try {
    const response = await fetch(csvUrl);
    const csvText = await response.text();
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    const dataRows = parsed.data;

    if (dataRows.length === 0) return;

    // Take the first row's timestamp from "Column 1"
    const firstTimestamp = new Date(dataRows[0]["Column 1"]);
    const weekRange = getWeekRange(firstTimestamp);
    document.getElementById("week-title").textContent = `${weekRange.start} - ${weekRange.end}`;

    // Build menuData sorted by daysOrder
    dataRows.forEach(row => {
      const day = row["Column 2"]?.trim();
      if (!day || !daysOrder.includes(day)) return;
      menuData[day] = {
        breakfast: row["Column 3"]?.trim(),
        lunch: row["Column 4"]?.trim(),
        // snacks: row["Column 5"]?.trim(),
        dinner: row["Column 6"]?.trim()
      };
    });

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

  let today = new Date().getDay(); // 0 = Sunday, 6 = Saturday
  let defaultDay = daysOrder[today];

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

