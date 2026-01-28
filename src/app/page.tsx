'use client';

import { useState } from 'react';

export default function Home() {
    const [content, setContent] = useState('');
    const [ttl, setTtl] = useState<string>('');
    const [maxViews, setMaxViews] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{ url: string; id: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const payload: any = { content };
            if (ttl) {
                const ttlNum = parseInt(ttl, 10);
                if (!isNaN(ttlNum) && ttlNum > 0) payload.ttl_seconds = ttlNum;
            }
            if (maxViews) {
                const viewsNum = parseInt(maxViews, 10);
                if (!isNaN(viewsNum) && viewsNum > 0) payload.max_views = viewsNum;
            }

            const res = await fetch('/api/pastes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            setResult(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-8 py-10">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">
                    Pastebin Lite
                </h1>
                <p className="text-gray-400 text-lg">
                    Share text securely with expiration and view limits.
                </p>
            </div>

            <div className="glass w-full rounded-2xl p-6 sm:p-8 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="content" className="text-sm font-medium text-gray-300">
                            Content
                        </label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Paste your text here..."
                            className="w-full min-h-[200px] p-4 rounded-xl input-glass border border-white/10 focus:border-blue-500/50 outline-none resize-y font-mono text-sm"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="ttl" className="text-sm font-medium text-gray-300">
                                Expires In (Seconds)
                            </label>
                            <input
                                id="ttl"
                                type="number"
                                min="1"
                                placeholder="e.g. 60 (Optional)"
                                value={ttl}
                                onChange={(e) => setTtl(e.target.value)}
                                className="w-full p-3 rounded-lg input-glass outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="views" className="text-sm font-medium text-gray-300">
                                Max Views
                            </label>
                            <input
                                id="views"
                                type="number"
                                min="1"
                                placeholder="e.g. 5 (Optional)"
                                value={maxViews}
                                onChange={(e) => setMaxViews(e.target.value)}
                                className="w-full p-3 rounded-lg input-glass outline-none"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !content}
                        className="w-full btn-primary py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
                    >
                        {isLoading ? 'Creating Paste...' : 'Create Paste'}
                    </button>
                </form>

                {error && (
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-center text-sm">
                        {error}
                    </div>
                )}

                {result && (
                    <div className="space-y-3 pt-4 border-t border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <p className="text-green-400 font-medium text-center">Paste Created Successfully! 🎉</p>
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-black/40 border border-white/10">
                            <input
                                readOnly
                                value={result.url}
                                className="bg-transparent border-none outline-none text-white w-full text-sm font-mono truncate"
                                onClick={(e) => e.currentTarget.select()}
                            />
                            <button
                                onClick={() => navigator.clipboard.writeText(result.url)}
                                className="p-2 text-xs font-medium text-gray-400 hover:text-white transition-colors"
                            >
                                Copy
                            </button>
                        </div>
                        <div className="text-center">
                            <a href={result.url} className="text-blue-400 hover:text-blue-300 text-sm underline underline-offset-4">
                                Visit Paste
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
