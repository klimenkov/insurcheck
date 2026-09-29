/**
 * Normalizes and validates Canadian / Ontario postal codes and FSAs.
 * Accepts:
 *  - 3-character FSA: 'M4G', 'm4g'
 *  - 6-character postal code: 'M4N0A5', 'm4n0a5'
 *  - 7-character formatted postal code: 'M4N 0A5', 'm4n 0a5'
 */
export function parseAndValidatePostalCode(input) {
  if (!input || typeof input !== 'string' || !input.trim()) {
    return {
      isValid: false,
      isEmpty: true,
      fsa: '',
      normalized: '',
      error: 'Postal code or FSA is required.'
    };
  }

  const trimmed = input.trim();
  const clean = trimmed.replace(/\s+/g, '').toUpperCase();

  // Basic length check (3 for FSA, 6 for full postal code)
  if (clean.length !== 3 && clean.length !== 6) {
    return {
      isValid: false,
      isEmpty: false,
      fsa: '',
      normalized: clean,
      error: 'Please enter a 3-character FSA (e.g. M4G) or a 6-character postal code (e.g. M4N 0A5).'
    };
  }

  // FSA format check: Letter-Digit-Letter (e.g. M4N)
  const fsaPart = clean.slice(0, 3);
  const fsaRegex = /^[A-Z]\d[A-Z]$/;
  if (!fsaRegex.test(fsaPart)) {
    return {
      isValid: false,
      isEmpty: false,
      fsa: fsaPart,
      normalized: clean,
      error: 'Invalid format. Expected letter-digit-letter (e.g. M4G or M4N 0A5).'
    };
  }

  // If 6 characters, validate the full Canadian postal code pattern: A1A 1A1
  if (clean.length === 6) {
    const fullPostalRegex = /^[A-Z]\d[A-Z]\d[A-Z]\d$/;
    if (!fullPostalRegex.test(clean)) {
      return {
        isValid: false,
        isEmpty: false,
        fsa: fsaPart,
        normalized: clean,
        error: 'Invalid postal code format. Expected e.g. M4N 0A5.'
      };
    }
  }

  // Ontario validation: Canadian postal codes in Ontario start with K, L, M, N, or P
  const ontarioFirstLetters = ['K', 'L', 'M', 'N', 'P'];
  if (!ontarioFirstLetters.includes(fsaPart[0])) {
    return {
      isValid: false,
      isEmpty: false,
      fsa: fsaPart,
      normalized: clean,
      error: `Postal code ${fsaPart} is outside Ontario. InsurCheck currently benchmarks Ontario (starting with K, L, M, N, P).`
    };
  }

  return {
    isValid: true,
    isEmpty: false,
    fsa: fsaPart,
    normalized: clean.length === 6 ? `${clean.slice(0, 3)} ${clean.slice(3)}` : clean,
    error: null
  };
}
