import { notFound } from 'next/navigation';
import { getPaste } from '@/lib/paste-service';
import Link from 'next/link';

interface PastePageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function PastePage(props: PastePageProps) {
    const params = await props.params;
    const { id } = params;
    const paste = await getPaste(id);

    if (!paste) {
        notFound();
    }

    // Calculate remaining time for display if needed, or just show content
    // Requirement: "Paste content must be rendered safely (no script execution)."
    // React renders text content safely by default.

    return (
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-8 py-10">
            <div className="text-center space-y-2">
                <Link href="/" className="hover:opacity-80 transition-opacity">
                    <h1 className="text-3xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">
                        Pastebin Lite
                    </h1>
                </Link>
            </div>

            <div className="glass w-full rounded-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <h2 className="text-lg font-medium text-gray-200">Paste Content</h2>
                    <div className="flex gap-4 text-xs text-gray-400">
                        {paste.expires_at && (
                            <span title={new Date(paste.expires_at).toLocaleString()}>
                                Expires: {new Date(paste.expires_at).toLocaleTimeString()}
                            </span>
                        )}
                        {paste.remaining_views !== null && (
                            <span>Views Left: {paste.remaining_views}</span>
                        )}
                    </div>
                </div>

                <div className="bg-black/30 rounded-xl p-4 overflow-x-auto">
                    <pre className="font-mono text-sm text-gray-300 whitespace-pre-wrap break-words">
                        {paste.content}
                    </pre>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                    <Link
                        href="/"
                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors"
                    >
                        Create New
                    </Link>
                </div>
            </div>
        </div>
    );
}
