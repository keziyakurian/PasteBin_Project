import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { clsx } from 'clsx';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Pastebin Lite',
    description: 'Share text with TTL and View Limits',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={clsx(inter.className, "min-h-screen text-white bg-[#0a0a0a]")}>
                <main className="min-h-screen flex flex-col items-center justify-center p-4">
                    <div className="z-10 w-full max-w-5xl items-center justify-between text-sm lg:flex-col">
                        {children}
                    </div>
                </main>
            </body>
        </html>
    );
}
