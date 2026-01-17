
/**
 * PRODUCTION VEHICLE REGISTRY API v3.6
 * Deployment: Execute as Me, Access: Anyone
 */

function doGet(e) {
  const cache = CacheService.getScriptCache();
  const props = PropertiesService.getScriptProperties();
  
  try {
    // 1. Config Loading with safer defaults
    const CONFIG = {
      SPREADSHEET_ID: props.getProperty('SPREADSHEET_ID') || "1-ra-7n7R9siWg7SCQiDq7-lRPwZ8JhskLc0WXy7VpaE",
      APP_TOKEN: props.getProperty('APP_TOKEN') || "12345",
      ALLOWED_FIELDS: (props.getProperty('ALLOWED_FIELDS') || "Гос.номер,Марка,Модель,Организация,Статус,ФИО").split(',').map(f => f.trim().toLowerCase()),
      RATE_LIMIT: parseInt(props.getProperty('RATE_LIMIT_PER_MINUTE') || "30"),
      WINDOW: parseInt(props.getProperty('RATE_LIMIT_WINDOW_SECONDS') || "60"),
      SHEET_NAME: props.getProperty('DATA_SHEET_NAME')
    };

    if (!e || !e.parameter) return createJsonResponse({ status: "online", msg: "Kiosk Endpoint Ready v3.6" });

    const { plate: plateRaw = '', token, deviceId = 'unknown' } = e.parameter;

    // 2. Security Check (Token Validation)
    if (token !== CONFIG.APP_TOKEN) {
      logLookup(null, deviceId, plateRaw, "UNAUTHORIZED");
      return createJsonResponse({ error: "Ошибка авторизации: Неверный токен приложения.", code: 'UNAUTHORIZED' });
    }

    // 3. Block check & Rate Limiting
    const blockKey = 'block:' + deviceId;
    const rlKey = 'rl:' + deviceId;
    const nfKey = 'nf:' + deviceId;

    if (cache.get(blockKey)) {
      return createJsonResponse({ error: "Доступ временно заблокирован из-за подозрительной активности.", code: 'RATE_LIMIT' });
    }

    let reqCount = parseInt(cache.get(rlKey) || '0');
    if (reqCount >= CONFIG.RATE_LIMIT) {
      return createJsonResponse({ error: "Слишком много запросов. Подождите минуту.", code: 'RATE_LIMIT' });
    }
    cache.put(rlKey, (reqCount + 1).toString(), CONFIG.WINDOW);

    // 4. Normalization
    const plateNorm = ultraNormalize(plateRaw);
    if (!plateNorm || plateNorm.length < 3) {
      return createJsonResponse({ error: "Введите корректный госномер (минимум 3 символа).", code: 'INVALID_INPUT' });
    }

    // 5. Database Access check
    let ss;
    try {
      ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    } catch (e) {
      return createJsonResponse({ error: "База данных недоступна. Проверьте SPREADSHEET_ID.", code: 'CONFIG_ERROR' });
    }
    
    const sheet = CONFIG.SHEET_NAME ? ss.getSheetByName(CONFIG.SHEET_NAME) : ss.getSheets()[0];
    const data = sheet.getDataRange().getValues();

    // 6. Enhanced Header Detection
    let headerRowIndex = -1;
    let plateColIndex = -1;
    const keywords = ["гос.номер", "гос номер", "госномер", "грз", "номер", "plate", "license", "авто", "тс"];

    for (let r = 0; r < Math.min(data.length, 15); r++) {
      for (let c = 0; c < data[r].length; c++) {
        const cellValue = String(data[r][c] || '').toLowerCase().trim().replace(/[\.\s]/g, '');
        // Check if normalized keyword exists in cell
        if (keywords.some(k => cellValue.includes(k.replace(/[\.\s]/g, '')))) {
          headerRowIndex = r;
          plateColIndex = c;
          break;
        }
      }
      if (headerRowIndex !== -1) break;
    }

    if (headerRowIndex === -1) {
      return createJsonResponse({ error: "Не удалось найти колонку с госномерами. Проверьте заголовки в таблице.", code: 'CONFIG_ERROR' });
    }

    const headers = data[headerRowIndex];
    const results = [];

    // 7. Data Search
    for (let i = headerRowIndex + 1; i < data.length; i++) {
      const row = data[i];
      const sheetVal = ultraNormalize(String(row[plateColIndex] || ''));
      
      if (sheetVal === plateNorm) {
        const record = { "_sheet": sheet.getName() };
        headers.forEach((h, idx) => {
          const originalKey = String(h).trim();
          const cleanKey = originalKey.toLowerCase();
          
          // Include if allowed OR if it's the plate column itself
          if (CONFIG.ALLOWED_FIELDS.includes(cleanKey) || idx === plateColIndex) {
            let val = row[idx];
            if (val instanceof Date) val = Utilities.formatDate(val, "GMT+3", "dd.MM.yyyy");
            record[originalKey] = val;
          }
        });
        results.push(record);
      }
    }

    // 8. Finalize Response
    if (results.length === 0) {
      let nfCount = parseInt(cache.get(nfKey) || '0') + 1;
      if (nfCount >= 20) cache.put(blockKey, '1', 300);
      else cache.put(nfKey, nfCount.toString(), CONFIG.WINDOW);
      logLookup(ss, deviceId, plateRaw, "NOT_FOUND");
    } else {
      cache.remove(nfKey);
      logLookup(ss, deviceId, plateRaw, "OK", results.length);
    }

    return createJsonResponse({ results, resultCount: results.length });

  } catch (err) {
    console.error(err);
    return createJsonResponse({ error: "Внутренняя ошибка сервера: " + err.message, code: 'SERVER_ERROR' });
  }
}

function ultraNormalize(text) {
  if (!text) return '';
  const map = {
    'А':'A','В':'B','Е':'E','К':'K','М':'M','Н':'H',
    'О':'O','Р':'P','С':'C','Т':'T','У':'Y','Х':'X'
  };
  return String(text).toUpperCase().replace(/[^A-ZА-Я0-9]/g, '')
    .split('').map(c => map[c] || c).join('');
}

function logLookup(ss, deviceId, raw, status, count = 0) {
  try {
    if (!ss) return;
    let log = ss.getSheetByName("LookupLog");
    if (!log) {
      log = ss.insertSheet("LookupLog");
      log.appendRow(["Timestamp", "DeviceID", "RawPlate", "Status", "Matches"]);
    }
    log.appendRow([new Date(), deviceId, raw, status, count]);
  } catch (e) {}
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
