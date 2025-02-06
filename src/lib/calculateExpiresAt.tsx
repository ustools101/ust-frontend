export default function calculateExpiresAt(duration: number): Date {
    // add number of weeks(duration) to current date
    const now = new Date();
    const newExpiry = new Date(now.getTime() + duration* 7 * 24 * 60 * 60 * 1000);
    return newExpiry;
}