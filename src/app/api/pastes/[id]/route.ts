import { NextRequest, NextResponse } from 'next/server';
import { getPaste } from '@/lib/paste-service';



export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    if (!id) {
        return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const paste = await getPaste(id);

    if (!paste) {
        return NextResponse.json({ error: 'Paste not found' }, { status: 404 });
    }

    return NextResponse.json({
        content: paste.content,
        remaining_views: paste.remaining_views,
        expires_at: paste.expires_at ? new Date(paste.expires_at).toISOString() : null,
    });
}
