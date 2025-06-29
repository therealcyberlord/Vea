export const NavBar = () => {
    return (
        <nav className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 border-b border-blue-700/30 shadow-sm">
            <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-6">
                <a href="/" className="flex items-center gap-2">
                    <span className="text-white text-2xl font-bold tracking-tight drop-shadow-sm">Vea AI</span>
                </a>
                <div className="flex items-center gap-4">
                    <a href="/configure">
                        <button className="text-indigo-100 text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/10 transition">
                            Configure
                        </button>
                    </a>
                    <a href="https://ollama.com/" target="_blank" rel="noopener noreferrer">
                        <span className="bg-white/10 text-indigo-100 text-xs font-mono px-3 py-1 rounded-full tracking-widest shadow-sm flex items-center gap-2 cursor-pointer hover:bg-white/20 transition">
                            Powered by Ollama
                            <img src="/ollama.svg" alt="Ollama logo" className="w-5 h-5" />
                        </span>
                    </a>
                </div>
            </div>
        </nav>
    );
};
