
const CYR_LAT_MAP: Record<string, string> = {
  'А': 'A', 'В': 'B', 'Е': 'E', 'К': 'K', 'М': 'M', 'Н': 'H',
  'О': 'O', 'Р': 'P', 'С': 'C', 'Т': 'T', 'У': 'Y', 'Х': 'X'
};

const LET = 'ABEKMHOPCTYX';

export const normalizePlate = (raw: string): string => {
  if (!raw) return '';
  const cleaned = raw.toUpperCase().replace(/[^A-ZА-Я0-9]/g, '');
  return cleaned.split('').map(char => CYR_LAT_MAP[char] || char).join('');
};

export const isValidPlate = (raw: string): { valid: boolean; error?: string } => {
  const normalized = normalizePlate(raw);
  if (!normalized) return { valid: false };

  // 1. Phone rejection
  if (/^\+?7\d{10}$/.test(normalized) || /^8\d{10}$/.test(normalized) || /^\d{10,12}$/.test(normalized)) {
    return { valid: false, error: 'ТЕЛЕФОН НЕЛЬЗЯ (Пример: А777АА77)' };
  }

  // 2. Strict Russia
  const RU_PRIVATE = new RegExp(`^[${LET}]\\d{3}[${LET}]{2}\\d{2,3}$`);
  const RU_TRAILER = new RegExp(`^[${LET}]{2}\\d{4}\\d{2,3}$`);
  const RU_MOTO = new RegExp(`^\\d{4}[${LET}]{2}(\\d{2,3})?$`);
  
  if (RU_PRIVATE.test(normalized) || RU_TRAILER.test(normalized) || RU_MOTO.test(normalized)) {
    return { valid: true };
  }

  // 3. Relaxed Corridor for CIS
  const hasLetter = /[A-Z]/.test(normalized);
  const hasDigits = (normalized.match(/\d/g) || []).length >= 2;
  const corridorSize = normalized.length >= 4 && normalized.length <= 12;

  if (hasLetter && hasDigits && corridorSize) {
    return { valid: true };
  }

  return { valid: false, error: 'НЕВЕРНЫЙ ФОРМАТ' };
};
