
import { ApiResponse, VehicleRecord } from '../types';
import { GoogleGenAI } from "@google/genai";

const API_URL: string = 'https://script.google.com/macros/s/AKfycbxso3bNKQrVsvYhBXYBSJaPtNmYEEHUN7IxuUyi234zbNj9RTmoIrlC06NH5uMegn22BA/exec'; 
const APP_TOKEN: string = '12345'; // Pre-shared application secret

export const fetchRecords = async (plate: string, deviceId: string): Promise<ApiResponse> => {
  if (!navigator.onLine) {
    throw new Error('ОТСУТСТВУЕТ ИНТЕРНЕТ');
  }

  const fetchUrl = `${API_URL}?plate=${encodeURIComponent(plate)}&token=${encodeURIComponent(APP_TOKEN)}&deviceId=${encodeURIComponent(deviceId)}&t=${Date.now()}`;
  
  try {
    const response = await fetch(fetchUrl);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    return await response.json();
  } catch (error: any) {
    throw new Error('СЕТЕВАЯ ОШИБКА: Сервер недоступен');
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
      contents: `Vehicle Data: ${context}. Determine if access should be granted and write a 5-word directive in Russian for a security guard.`,
      config: {
        systemInstruction: "You are a professional security command AI. You output only direct, concise instructions in Russian. Example: 'Пропуск разрешен. Сотрудник склада.'",
        temperature: 0.1,
      }
    });

    return response.text?.trim() || 'Допуск разрешен.';
  } catch (e) {
    return 'Запись найдена. Проверьте документы.';
  }
};
