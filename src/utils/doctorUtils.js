/**
 * Utility helper to extract the doctor's initial for avatar display.
 * Ignores any leading "Dr." or "Doctor" prefix (case-insensitive, with/without dot)
 * and returns the uppercase first letter of the actual first name.
 *
 * @param {string} fullName - Doctor's full name (e.g. "Dr. Rahul Mehta", "Dr. Priya Shah", "Rahul Mehta")
 * @returns {string} Single uppercase initial character
 */
export const getDoctorInitial = (fullName) => {
  if (!fullName || typeof fullName !== 'string') return 'D';

  // Trim leading/trailing spaces
  const trimmed = fullName.trim();

  // Remove leading prefixes like "Dr.", "Dr ", "Doctor.", "Doctor ", case-insensitively
  const cleaned = trimmed.replace(/^(dr\.|dr\s+|doctor\.|doctor\s+)+/i, '').trim();

  if (!cleaned) return 'D';

  return cleaned.charAt(0).toUpperCase() || 'D';
};
