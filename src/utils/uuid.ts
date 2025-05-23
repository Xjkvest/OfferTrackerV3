/**
 * Generate a UUID with fallback for environments that don't support crypto.randomUUID
 */
export function generateUUID(): string {
  // Check if crypto.randomUUID is available (modern browsers with HTTPS)
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch (error) {
      console.warn('crypto.randomUUID failed, falling back to alternative method');
    }
  }

  // Fallback method using crypto.getRandomValues if available
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    try {
      return generateUUIDFromRandomValues();
    } catch (error) {
      console.warn('crypto.getRandomValues failed, falling back to Math.random');
    }
  }

  // Final fallback using Math.random (less secure but compatible)
  return generateUUIDFromMathRandom();
}

/**
 * Generate UUID using crypto.getRandomValues
 */
function generateUUIDFromRandomValues(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  
  // Set version (4) and variant bits
  array[6] = (array[6] & 0x0f) | 0x40; // Version 4
  array[8] = (array[8] & 0x3f) | 0x80; // Variant 10
  
  const hex = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32)
  ].join('-');
}

/**
 * Generate UUID using Math.random (fallback for very old environments)
 */
function generateUUIDFromMathRandom(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
} 