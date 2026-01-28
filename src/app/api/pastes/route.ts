import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getEffectiveTime } from '@/lib/time';
import { CreatePasteRequest, Paste } from '@/lib/types';
import { createPaste } from '@/lib/paste-service';

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as CreatePasteRequest;

        // Validation
        if (!body.content || typeof body.content !== 'string' || body.content.trim().length === 0) {
            return NextResponse.json({ error: 'Content is required and must be a non-empty string' }, { status: 400 });
        }

        if (body.ttl_seconds !== undefined && (!Number.isInteger(body.ttl_seconds) || body.ttl_seconds < 1)) {
            return NextResponse.json({ error: 'ttl_seconds must be an integer >= 1' }, { status: 400 });
        }

        if (body.max_views !== undefined && (!Number.isInteger(body.max_views) || body.max_views < 1)) {
            return NextResponse.json({ error: 'max_views must be an integer >= 1' }, { status: 400 });
        }

        const now = await getEffectiveTime();

        const paste: Paste = {
            content: body.content,
            created_at: now,
            ttl_seconds: body.ttl_seconds,
            max_views: body.max_views,
            remaining_views: body.max_views ? body.max_views : null,
            expires_at: body.ttl_seconds ? now + body.ttl_seconds * 1000 : null,
        };

        const id = await createPaste(paste);

        // Construct URL
        const host = req.headers.get('host') || 'localhost:3000';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const url = `${protocol}://${host}/p/${id}`;

        return NextResponse.json({ id, url });
    } catch (error) {
        console.error('Create paste error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
