import { NextResponse } from 'next/server';
import { checkHealth } from '@/lib/paste-service';

export const dynamic = 'force-dynamic';

export async function GET() {
    const isOk = await checkHealth();
    if (isOk) {
        return NextResponse.json({ ok: true });
    } else {
        return NextResponse.json(
            { ok: false, error: 'Persistence layer unavailable' },
            { status: 500 }
        );
    }
}
