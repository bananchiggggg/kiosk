
/**
 * Advanced vehicle plate normalization and validation for RU/CIS.
 */

const CYR_LAT_MAP: Record<string, string> = {
  'А': 'A', 'В': 'B', 'Е': 'E', 'К': 'K', 'М': 'M', 'Н': 'H',
  'О': 'O', 'Р': 'P', 'С': 'C', 'Т': 'T', 'У': 'Y', 'Х': 'X'
};

const LET = 'ABEKMHOPCTYX';

export const normalizePlate = (raw: string): string => {
  if (!raw) return '';
  // Uppercase, remove all non-alphanumeric (including spaces/hyphens)
  const cleaned = raw.toUpperCase().replace(/[^A-ZА-Я0-9]/g, '');
  // Map Cyrillic to Latin
  return cleaned.split('').map(char => CYR_LAT_MAP[char] || char).join('');
};

export const isValidPlate = (raw: string): { valid: boolean; error?: string } => {
  const normalized = normalizePlate(raw);
  if (!normalized) return { valid: false };

  // 1. Phone rejection
  const isPhone = /^\+?7\d{10}$/.test(normalized) || 
                  /^8\d{10}$/.test(normalized) || 
                  /^\d{10,12}$/.test(normalized);
  if (isPhone) return { valid: false, error: 'ТЕЛЕФОН: Введите госномер' };

  // 2. RU Formats (Standard, Trailer, Moto)
  const RU_PRIVATE = new RegExp(`^[${LET}]\\d{3}[${LET}]{2}\\d{2,3}$`);
  const RU_TRAILER = new RegExp(`^[${LET}]{2}\\d{4}\\d{2,3}$`);
  const RU_MOTO = new RegExp(`^\\d{4}[${LET}]{2}(\\d{2,3})?$`);
  
  if (RU_PRIVATE.test(normalized) || RU_TRAILER.test(normalized) || RU_MOTO.test(normalized)) {
    return { valid: true };
  }

  // 3. CIS (Kazakhstan, Belarus)
  const KZ = /^\d{3}[A-Z]{3}\d{2}$/.test(normalized);
  const BY = /^\d{4}[A-Z]{2}\d$/.test(normalized);
  if (KZ || BY) return { valid: true };

  // 4. Relaxed Corridor for other CIS
  const hasLetter = /[A-Z]/.test(normalized);
  const hasDigits = (normalized.match(/\d/g) || []).length >= 2;
  const corridorSize = normalized.length >= 4 && normalized.length <= 12;

  if (hasLetter && hasDigits && corridorSize) {
    return { valid: true };
  }

  return { valid: false, error: 'НЕВЕРНЫЙ ФОРМАТ' };
};
