import { headers } from 'next/headers';

/**
 * Returns the effective current time in milliseconds.
 * If TEST_MODE=1 and x-test-now-ms header is present, returns that value.
 * Otherwise returns Date.now().
 */
export async function getEffectiveTime(): Promise<number> {
    if (process.env.TEST_MODE === '1') {
        const headersList = headers();
        const testTime = (await headersList).get('x-test-now-ms');
        if (testTime) {
            const parsed = parseInt(testTime, 10);
            if (!isNaN(parsed)) {
                return parsed;
            }
        }
    }
    return Date.now();
}
