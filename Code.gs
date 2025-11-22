function deleteOldDuplicateOnFormSubmit(e) {
  var sheet = e.range.getSheet();
  var row = e.range.getRow();
  var newDay = sheet.getRange(row, 2).getValue(); // Column B = 2

  // Get all values in column B
  var days = sheet.getRange(1, 2, sheet.getLastRow(), 1).getValues().flat();

  for (var r = 1; r <= days.length; r++) {
    if (r === row) continue; // Skip the new row itself
    if (days[r - 1] === newDay) {
      sheet.deleteRow(r);
      if (r < row) row--; // Adjust if deleted row is above the new one
    }
  }
}

function clearSheetWeekly() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Delete all data rows, preserve header row (row 1)
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
  
  // Ensure headers are set correctly after clearing
  setupHeaders();
}

function setupHeaders() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Set the proper column headers
  var headers = ['Timestamp', 'Day', 'Breakfast', 'Lunch', 'Snacks', 'Dinner'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Optional: Make header row bold
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
}

