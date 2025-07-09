export const NavBar = () => {
  return (
    <nav className="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-3 border-b border-blue-900/20 shadow-sm">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="text-white text-2xl font-semibold tracking-tight font-sans hover:opacity-90 transition"
          >
            Vea
          </a>
          <div className="h-6 w-px bg-white/20" />
          <span className="text-white/70 text-base font-semibold font-sans tracking-normal">
            Local AI Copilot
          </span>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <a href="/configure">
            <button className="text-white/90 text-base font-semibold font-sans px-5 py-2 rounded-md hover:bg-white/10 focus:outline-none focus:ring-1 focus:ring-white/30 transition">
              Configure
            </button>
          </a>
          <a
            href="https://ollama.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white/70 text-base font-semibold font-sans px-4 py-1.5 rounded-full border border-white/30 hover:border-white/50 transition"
          >
            <span>Powered by Ollama</span>
            <img
              src="/ollama.svg"
              alt="Ollama logo"
              className="w-5 h-5 opacity-80"
              draggable={false}
            />
          </a>
        </div>
      </div>
    </nav>
  );
};
