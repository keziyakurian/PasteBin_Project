import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PasteView from './pages/PasteView';

import './index.css';
import { clsx } from 'clsx';
// import { Inter } from 'next/font/google'; // Next.js font won't work in Vite directly as is.

// We need to replace next/font with standard CSS or simple import if possible.
// Since we are moving away from Next.js, 'next/font' won't work.
// I'll handle font import in index.css or use a standard font.
// For now, I'll remove the unused font import and just use a class or style.

function App() {
    return (
        <Router>
            <div className="min-h-screen text-white bg-[#0a0a0a] flex flex-col items-center justify-center p-4 font-sans">
                <div className="z-10 w-full max-w-5xl items-center justify-between text-sm lg:flex-col">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/p/:id" element={<PasteView />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
