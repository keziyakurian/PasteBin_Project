/**
 * Returns the effective current time in milliseconds.
 * Simplified for Node.js migration (Test mode header check removed for now).
 * Otherwise returns Date.now().
 */
export async function getEffectiveTime(): Promise<number> {
    return Date.now();
}
