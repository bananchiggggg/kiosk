
/**
 * БЭКЕНД: ВЕРСИЯ С УЛУЧШЕННОЙ НОРМАЛИЗАЦИЕЙ СИМВОЛОВ
 */

const SPREADSHEET_ID = "1-ra-7n7R9siWg7SCQiDq7-lRPwZ8JhskLc0WXy7VpaE";

function doGet(e) {
  try {
    if (!e || !e.parameter) {
      return createJsonResponse({ status: "online", msg: "API is active. Waiting for params." });
    }

    const plateQuery = (e.parameter.plate || '').trim();
    const normQuery = ultraNormalize(plateQuery);

    if (!normQuery) {
      return createJsonResponse({ results: [], error: "Query is empty after normalization" });
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheets = ss.getSheets();
    const results = [];

    for (let s = 0; s < sheets.length; s++) {
      const sheet = sheets[s];
      const data = sheet.getDataRange().getValues();
      if (data.length < 1) continue;

      const headers = data[0];
      
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        let isMatch = false;

        for (let j = 0; j < row.length; j++) {
          const cellVal = String(row[j] || '').trim();
          if (!cellVal) continue;
          
          // Сравниваем только буквы и цифры, игнорируя регистр и тип алфавита
          if (ultraNormalize(cellVal) === normQuery) {
            isMatch = true;
            break;
          }
        }

        if (isMatch) {
          const obj = { "_row": i + 1, "_sheet": sheet.getName() };
          headers.forEach((h, idx) => {
            let val = row[idx];
            // Форматируем дату для читаемости
            if (val instanceof Date) {
              val = Utilities.formatDate(val, Session.getScriptTimeZone(), "dd.MM.yyyy HH:mm");
            }
            obj[String(h || 'Поле ' + (idx + 1)).trim()] = val;
          });
          results.push(obj);
        }
      }
      if (results.length > 0) break; // Прекращаем поиск после нахождения в первом листе
    }

    return createJsonResponse({ results: results });

  } catch (err) {
    return createJsonResponse({ error: err.toString(), stack: err.stack, code: 'SERVER_ERROR' });
  }
}

/**
 * Очищает строку от спецсимволов и приводит кириллические буквы 
 * к латинским аналогам для стопроцентного совпадения.
 */
function ultraNormalize(text) {
  if (!text) return '';
  const mapping = {
    'А':'A','В':'B','Е':'E','К':'K','М':'M','Н':'H',
    'О':'O','Р':'P','С':'C','Т':'T','У':'Y','Х':'X'
  };
  
  // 1. Нормализуем Unicode
  // 2. В верхний регистр
  // 3. Удаляем всё, кроме цифр и букв
  let cleaned = String(text).toUpperCase().replace(/[^A-ZА-Я0-9]/g, '');
  
  // 4. Заменяем кириллицу на латиницу
  return cleaned.split('').map(function(c) {
    return mapping[c] || c;
  }).join('');
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
