import { useEffect, useState } from "react";
import { NavBar } from "@/components/NavBar";
import { getAvailableOllamaModels, updateModelConfig } from "@/api/ollama";

export default function ConfigureModels() {
  const [toolModels, setToolModels] = useState<string[]>([]);
  const [visionModels, setVisionModels] = useState<string[]>([]);
  const [chatModel, setChatModel] = useState<string>("");
  const [imageModel, setImageModel] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    getAvailableOllamaModels().then((data) => {
      setToolModels(data.tool || []);
      setVisionModels(data.vision || []);
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      await updateModelConfig({ toolModel: chatModel, imageModel });
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Error saving configuration:", err);
      setSaving(false);
      setError("Failed to save configuration, please double-check config/agent.yaml");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 flex flex-col">
      <NavBar />
      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <div className="flex items-center mb-6 gap-3">
            <img src="/ollama.svg" alt="Ollama Logo" className="w-8 h-8" />
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Ollama Model Settings</h1>
          </div>
          <p className="text-gray-500 mb-8 text-sm">Configure which Ollama models are used for chat and image tasks. Your selections will be used for all future conversations.</p>
          {loading ? (
            <div className="flex items-center gap-2 text-gray-500"><span className="animate-spin h-5 w-5 border-2 border-blue-400 border-t-transparent rounded-full inline-block"></span> Loading models...</div>
          ) : (
            <form className="space-y-8" onSubmit={handleSave}>
              <section>
                <h2 className="text-lg font-semibold mb-2 text-gray-800 flex items-center gap-2">
                  <span role="img" aria-label="Chat">💬</span> Chat Model
                </h2>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none bg-gray-50 text-gray-900"
                  value={chatModel}
                  onChange={e => setChatModel(e.target.value)}
                >
                  <option value="">-- Select a model --</option>
                  {toolModels.map((model) => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </section>
              <section>
                <h2 className="text-lg font-semibold mb-2 text-gray-800 flex items-center gap-2">
                  <span role="img" aria-label="Image">🖼️</span> Image Model
                </h2>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none bg-gray-50 text-gray-900"
                  value={imageModel}
                  onChange={e => setImageModel(e.target.value)}
                >
                  <option value="">-- Select a model --</option>
                  {visionModels.map((model) => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </section>
              <div className="bg-gray-50 rounded-lg p-4 mt-6 text-gray-700 text-sm border border-gray-100">
                <div className="mb-1">Selected Chat Model: <span className="font-mono text-blue-700">{chatModel || "(none)"}</span></div>
                <div>Selected Image Model: <span className="font-mono text-blue-700">{imageModel || "(none)"}</span></div>
              </div>
              {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
              <button
                type="submit"
                className={`w-full mt-4 py-3 rounded-lg font-semibold text-white transition-all ${chatModel && imageModel ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}`}
                disabled={!chatModel || !imageModel || saving}
              >
                {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}