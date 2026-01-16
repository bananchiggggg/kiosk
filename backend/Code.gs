
/**
 * SECURE VEHICLE REGISTRY API v3.0
 */

function doGet(e) {
  try {
    const props = PropertiesService.getScriptProperties();
    const spreadsheetId = props.getProperty('SPREADSHEET_ID') || "1-ra-7n7R9siWg7SCQiDq7-lRPwZ8JhskLc0WXy7VpaE";
    const appToken = props.getProperty('APP_TOKEN') || "12345";
    const allowedFieldsStr = props.getProperty('ALLOWED_FIELDS') || "Гос.номер,Марка,Модель,Организация";
    const allowedFields = allowedFieldsStr.split(',').map(f => f.trim().toLowerCase());

    if (!e || !e.parameter) return createJsonResponse({ status: "online", msg: "Kiosk Endpoint Ready" });

    // 1. Security check
    if (e.parameter.token !== appToken) {
      logLookup(null, e.parameter.deviceId, e.parameter.plate, "UNAUTHORIZED");
      return createJsonResponse({ error: "Unauthorized access", code: 'UNAUTHORIZED' });
    }

    const deviceId = e.parameter.deviceId || 'unknown';
    const plateRaw = (e.parameter.plate || '').trim();
    const plateNorm = ultraNormalize(plateRaw);

    // 2. Rate limiting (30 requests/min per device)
    const cache = CacheService.getScriptCache();
    const rlKey = 'rl:' + deviceId;
    let count = parseInt(cache.get(rlKey) || '0');
    if (count > 30) {
      logLookup(null, deviceId, plateRaw, "RATE_LIMIT");
      return createJsonResponse({ error: "Too many requests", code: 'RATE_LIMIT' });
    }
    cache.put(rlKey, (count + 1).toString(), 60);

    // 3. Simple input validation on server
    if (!plateNorm || plateNorm.length < 3) {
      return createJsonResponse({ results: [], error: "Invalid Plate Format", code: 'INVALID_INPUT' });
    }

    // 4. Spreadsheet logic
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheets()[0];
    const data = sheet.getDataRange().getValues();
    if (data.length < 1) return createJsonResponse({ results: [] });

    // 5. Header detection (scan top 10 rows)
    let headerRowIndex = -1;
    let plateColIndex = -1;
    const plateKeywords = ["гос.номер", "гос номер", "госномер", "грз", "номер", "plate", "license"];

    for (let r = 0; r < Math.min(data.length, 10); r++) {
      for (let c = 0; c < data[r].length; c++) {
        const val = String(data[r][c] || '').toLowerCase();
        if (plateKeywords.includes(val)) {
          headerRowIndex = r;
          plateColIndex = c;
          break;
        }
      }
      if (headerRowIndex !== -1) break;
    }

    if (headerRowIndex === -1) return createJsonResponse({ error: "Database structure error (No header found)" });

    const headers = data[headerRowIndex];
    const results = [];

    // 6. Search
    for (let i = headerRowIndex + 1; i < data.length; i++) {
      const row = data[i];
      const sheetPlate = ultraNormalize(String(row[plateColIndex] || ''));
      
      if (sheetPlate === plateNorm) {
        const entry = { "_sheet": sheet.getName() };
        headers.forEach((h, idx) => {
          const key = String(h).trim();
          if (allowedFields.includes(key.toLowerCase())) {
            let val = row[idx];
            if (val instanceof Date) val = Utilities.formatDate(val, "GMT+3", "dd.MM.yyyy HH:mm");
            entry[key] = val;
          }
        });
        results.push(entry);
      }
    }

    logLookup(ss, deviceId, plateRaw, results.length > 0 ? "OK" : "NOT_FOUND", results.length);
    return createJsonResponse({ results: results, resultCount: results.length });

  } catch (err) {
    console.error(err);
    return createJsonResponse({ error: "Server error", code: 'SERVER_ERROR' });
  }
}

function ultraNormalize(text) {
  if (!text) return '';
  const mapping = {'А':'A','В':'B','Е':'E','К':'K','М':'M','Н':'H','О':'O','Р':'P','С':'C','Т':'T','У':'Y','Х':'X'};
  return String(text).toUpperCase().replace(/[^A-ZА-Я0-9]/g, '').split('').map(c => mapping[c] || c).join('');
}

function logLookup(ss, deviceId, raw, status, count = 0) {
  try {
    if (!ss) return;
    let logSheet = ss.getSheetByName("LookupLog");
    if (!logSheet) {
      logSheet = ss.insertSheet("LookupLog");
      logSheet.appendRow(["Timestamp", "DeviceID", "Plate", "Status", "Matches"]);
    }
    logSheet.appendRow([new Date(), deviceId, raw, status, count]);
  } catch (e) {}
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
