export default function calculateExpiresAt(duration: number): Date {
    const now = new Date();
    // For 1 day (0.5), add 1 day; otherwise add weeks
    if (duration === 0.5) {
        const newExpiry = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
        return newExpiry;
    }
    // add number of weeks(duration) to current date
    const newExpiry = new Date(now.getTime() + duration * 7 * 24 * 60 * 60 * 1000);
    return newExpiry;
}