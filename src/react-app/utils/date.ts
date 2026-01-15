
/**
 * Parses a date string from the server (typically UTC SQL timestamp) into a local Date object.
 * Handles format: "YYYY-MM-DD HH:MM:SS" -> Treated as UTC.
 */
export function parseServerDate(dateString: string): Date {
    if (!dateString) return new Date();

    let normalized = dateString;

    // Replace SQL space with ISO T
    if (normalized.includes(' ')) {
        normalized = normalized.replace(' ', 'T');
    }

    // If no timezone info, assume UTC ('Z')
    // We check for 'Z', '+HH:MM', '-HH:MM'
    const hasTimezone = normalized.includes('Z') ||
        (normalized.includes('+') && normalized.indexOf('+') > 10) ||
        (normalized.includes('-') && normalized.lastIndexOf('-') > 10);

    if (!hasTimezone) {
        normalized += 'Z';
    }

    return new Date(normalized);
}
