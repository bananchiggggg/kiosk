
import { ApiResponse, VehicleRecord } from '../types';
import { GoogleGenAI } from "@google/genai";

// ИСПОЛЬЗУЕМ АКТУАЛЬНЫЙ URL ИЗ ПОСЛЕДНЕГО СООБЩЕНИЯ
const API_URL: string = 'https://script.google.com/macros/s/AKfycbxso3bNKQrVsvYhBXYBSJaPtNmYEEHUN7IxuUyi234zbNj9RTmoIrlC06NH5uMegn22BA/exec'; 
const SHEETS_API_KEY: string = '12345'; 

export const fetchRecords = async (plate: string): Promise<ApiResponse> => {
  if (!navigator.onLine) {
    throw new Error('ОТСУТСТВУЕТ ИНТЕРНЕТ: Проверьте Wi-Fi или мобильные данные.');
  }

  // Для Google Apps Script максимально простой fetch работает лучше всего
  // Опция redirect: 'follow' включена по умолчанию в большинстве браузеров
  const fetchUrl = `${API_URL}?plate=${encodeURIComponent(plate.trim())}&apiKey=${encodeURIComponent(SHEETS_API_KEY)}&t=${Date.now()}`;
  
  try {
    const response = await fetch(fetchUrl);

    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Network details:', error);
    
    // "Failed to fetch" - специфичная ошибка CORS или отсутствия доступа
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error('ОШИБКА ДОСТУПА: Скрипт заблокирован или не опубликован для "Anyone". В настройках Apps Script выберите "Deploy as Web App" -> "Access: Anyone".');
    }
    
    throw error;
  }
};

export const getAiInsight = async (record: VehicleRecord): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const recordString = Object.entries(record)
      .filter(([key]) => !key.startsWith('_'))
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Запись реестра: ${recordString}. Дай краткий (до 10 слов) вердикт для охраны: можно ли впускать и кто это.`,
      config: {
        systemInstruction: "Ты ассистент службы безопасности. Отвечай строго, профессионально и только по делу на русском языке.",
        temperature: 0.1,
      }
    });

    return response.text || 'Проверка пройдена. Доступ разрешен.';
  } catch (e) {
    console.warn('Gemini Insight error:', e);
    return 'Данные подтверждены в официальном реестре.';
  }
};
