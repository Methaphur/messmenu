# NISER Mess Menu (messmenu)

## TL;DR

Static, browser-only frontend that fetches a published Google Sheet (CSV) and renders the current week’s mess menu (Breakfast, Lunch, Dinner) as per-day tabs. Auto-selects today when available; no server or build step - update the sheet and the site updates.

## Repository Contents

| File | Purpose |
|------|---------|
| `index.html` | Main page container; loads styles + Papa Parse + `script.js`. |
| `styles.css` | Presentation layer (not shown here; customize branding / responsive layout). |
| `script.js` | Fetches CSV, parses rows, computes current week range, builds tabs, renders meals. |
| `Code.gs` | Google Apps Script utilities attached to the Sheet for housekeeping (duplicates + weekly reset + headers). |

## Data Source (Google Sheet)

Expected columns (row 1 = headers):

1. `Timestamp` – Auto-filled by Google Form submission or manual entry; used to determine week range.
2. `Day` – Full English weekday name: Monday .. Sunday.
3. `Breakfast`
4. `Lunch`
5. `Snacks` (optional - currently commented out in frontend)
6. `Dinner`

> The frontend ignores rows whose `Day` is missing or not in the predefined order array.

### Week Computation Logic
`script.js` takes the first row's `Timestamp`, converts it to a Date, then finds the Monday and Sunday bounding that week. The page title shows: `MonAbbrev Day - SunAbbrev Day` (e.g., `Nov 17 - Nov 23`).

### Tab Rendering Logic
Tabs are generated for all days present in the CSV (ordered Monday → Sunday). The tab for "today" (client local time) is auto-selected if that day's data exists; otherwise it falls back to the first available day.

## Google Apps Script (`Code.gs`)

Attached to the Sheet to keep data clean:

1. `deleteOldDuplicateOnFormSubmit(e)`
	- Trigger: **On form submit** (Installable trigger). Removes any previous row with the same `Day` value, keeping only the most recent submission. Adjusts the target insertion row index when deletions occur above it.
2. `clearSheetWeekly()`
	- Can be set on a **Time-driven (weekly)** trigger. Deletes all data rows (preserves header), then calls `setupHeaders()` to ensure header integrity.
3. `setupHeaders()`
	- Ensures headers: `Timestamp, Day, Breakfast, Lunch, Snacks, Dinner` and bold styling.

### Recommended Triggers
| Function | Trigger Type | Suggested Schedule |
|----------|--------------|--------------------|
| `deleteOldDuplicateOnFormSubmit` | Form Submit | Immediate (on each submission) |
| `clearSheetWeekly` | Time-driven | Early Monday (e.g., 00:05) before new menu entries |
| `setupHeaders` | Manual / part of weekly clear | Only needed after structural changes |

## Publishing the Sheet as CSV

1. Open the Google Sheet.
2. File → Share → Publish to web.
3. Choose the specific sheet tab used for menu data.
4. Select "Comma-separated values (.csv)" and publish.
5. Copy the generated URL (it will resemble the one in `script.js`).
6. Replace the existing `csvUrl` constant in `script.js` if the Sheet changes.

> If you add columns or rename headers, ensure the JavaScript property names match exactly (`Timestamp`, `Day`, etc.).


## Local Development

No build step - just static files.

1. Clone repository.
2. Open `index.html` in a browser (or serve via a lightweight static server if needed for CORS experiments). 
3. Ensure the published CSV URL is accessible (test it directly in the browser). 
4. Edit and refresh.

### Optional Quick Server (Python)
```
python3 -m http.server 8080
```
Open: http://localhost:8080/

## Maintenance Workflow

Weekly cycle:
1. (Trigger) `clearSheetWeekly()` runs – old entries cleared.
2. New submissions arrive through the form – duplicates per Day auto-pruned by `deleteOldDuplicateOnFormSubmit`.
3. Site auto-reflects updates 


### Handling Duplicates Manually
If triggers misfire, run `deleteOldDuplicateOnFormSubmit` logic manually by temporarily adapting it into a utility that scans all rows; or just visually prune in the Sheet.


## Contributing

Pull requests welcome. Please:
1. Keep changes minimal & focused.
2. Update this README if behavior or data shape changes.
3. Test with a temporary published test Sheet before merging.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Attribution

Made with ❤️ by Harisankar Binod. Maintained by Software Development Group, NISER.

---
Questions / improvements? Open an issue.
