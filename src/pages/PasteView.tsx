import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Paste } from '../lib/types';

export default function PasteView() {
    const { id } = useParams<{ id: string }>();
    const [paste, setPaste] = useState<Paste | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check for initial data injected by the server
        const initialData = (window as any).__INITIAL_PASTE__;

        if (initialData) {
            setPaste(initialData);
            setLoading(false);
            // Clean up to prevent reuse on other pages
            (window as any).__INITIAL_PASTE__ = undefined;
        } else if (id) {
            // Fallback to API if no initial data or ID mismatch (client-side nav)
            const fetchPaste = async () => {
                try {
                    const res = await fetch(`/api/pastes/${id}`);
                    if (!res.ok) {
                        if (res.status === 404) {
                            throw new Error('Paste not found or expired');
                        }
                        throw new Error('Failed to fetch paste');
                    }
                    const data = await res.json();
                    setPaste(data);
                } catch (err: any) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchPaste();
        }
    }, [id]);

    if (loading) {
        return <div className="text-center py-20 text-gray-400">Loading...</div>;
    }

    if (error || !paste) {
        return (
            <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-8 py-10">
                <div className="text-center space-y-4">
                    <h1 className="text-3xl font-bold text-red-400">Error</h1>
                    <p className="text-gray-400">{error || 'Paste not found'}</p>
                    <Link to="/" className="text-blue-400 hover:underline">Go Home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-8 py-10">
            <div className="text-center space-y-2">
                <Link to="/" className="hover:opacity-80 transition-opacity">
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
                        to="/"
                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors"
                    >
                        Create New
                    </Link>
                </div>
            </div>
        </div>
    );
}
