
/**
 * Утилиты для нормализации и валидации госномеров.
 */

export const normalizeInput = (raw: string): string => {
  if (!raw) return '';
  
  const mapping: Record<string, string> = {
    'А': 'A', 'В': 'B', 'Е': 'E', 'К': 'K', 'М': 'M', 'Н': 'H',
    'О': 'O', 'Р': 'P', 'С': 'C', 'Т': 'T', 'У': 'Y', 'Х': 'X'
  };

  // 1. Верхний регистр
  // 2. Удаляем ВООБЩЕ всё, кроме букв и цифр (включая все виды пробелов)
  // 3. Заменяем кириллицу на латиницу
  const cleaned = raw.toUpperCase().replace(/[\s\t\n\r]/g, '').replace(/[^A-ZА-Я0-9]/g, '');
  
  return cleaned.split('').map(char => mapping[char] || char).join('');
};

export const isValidPlate = (raw: string): boolean => {
  const normalized = normalizeInput(raw);
  if (!normalized) return false;

  // Базовая проверка: длина 3-15 символов
  const hasLetters = /[A-Z]/.test(normalized);
  const hasDigits = /\d/.test(normalized);
  const correctLength = normalized.length >= 3 && normalized.length <= 15;

  return (hasLetters || hasDigits) && correctLength;
};

export const normalizePlate = (plate: string): string => {
  return normalizeInput(plate);
};
