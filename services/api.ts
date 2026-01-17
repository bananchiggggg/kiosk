
import { ApiResponse, VehicleRecord } from '../types';
import { GoogleGenAI } from "@google/genai";

const API_URL: string = 'https://script.google.com/macros/s/AKfycbxso3bNKQrVsvYhBXYBSJaPtNmYEEHUN7IxuUyi234zbNj9RTmoIrlC06NH5uMegn22BA/exec'; 
const APP_TOKEN: string = '12345'; // Must match ScriptProperties in Google Apps Script

export const fetchRecords = async (plate: string, deviceId: string): Promise<ApiResponse> => {
  if (!navigator.onLine) {
    throw new Error('ОТСУТСТВУЕТ ПОДКЛЮЧЕНИЕ К ИНТЕРНЕТУ');
  }

  // Use a random cache buster and ensure deviceId is never null
  const safeDeviceId = deviceId || 'unknown-tablet';
  const fetchUrl = `${API_URL}?plate=${encodeURIComponent(plate)}&token=${encodeURIComponent(APP_TOKEN)}&deviceId=${encodeURIComponent(safeDeviceId)}&_cb=${Date.now()}`;
  
  try {
    const response = await fetch(fetchUrl, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-store', // Important for Kiosk usage to prevent stale redirects
    });

    if (!response.ok) {
      throw new Error(`ОШИБКА СЕТИ (Статус: ${response.status})`);
    }

    const data = await response.json();
    
    if (data.error) {
      return { 
        error: data.message || data.error, 
        code: data.code || 'API_ERROR',
        results: [] 
      };
    }
    
    return data;
  } catch (error: any) {
    console.error('Fetch Error:', error);
    if (error instanceof SyntaxError) {
      throw new Error('ОШИБКА ФОРМАТА: Сервер вернул некорректный ответ (проверьте URL скрипта).');
    }
    throw new Error(error.message || 'СЕРВЕР НЕДОСТУПЕН: Проверьте настройки Wi-Fi или VPN.');
  }
};

export const getAiInsight = async (record: VehicleRecord): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const context = Object.entries(record)
      .filter(([k]) => !k.startsWith('_'))
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Vehicle Row Data: ${context}. Instruction for guard in Russian (max 5 words).`,
      config: {
        systemInstruction: "You are an AI Security Supervisor. Provide a very short command for the human guard. Only Russian. Example: 'Пропуск разрешен. Служебное авто.'",
        temperature: 0.1,
      }
    });

    return response.text?.trim() || 'Допуск разрешен.';
  } catch (e) {
    console.warn('AI Insight skipped:', e);
    return 'Запись в реестре найдена.';
  }
};
