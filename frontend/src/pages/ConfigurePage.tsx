import { useMemo } from "react";
import Select from "react-select";
import { NavBar } from "@/components/NavBar";
import { ToggleButton } from "@/components/ToggleButton";
import { useModelConfig } from "@/hooks/useModelConfig";

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed top-6 right-6 z-50 rounded-lg bg-green-100 text-green-800 px-4 py-3 text-sm shadow-lg border border-green-300">
      {message}
    </div>
  );
}

export default function ConfigureModels() {
  const { state, actions } = useModelConfig();

  const toolOptions = useMemo(
    () =>
      state.toolModels.map((model) => ({
        value: model,
        label: model,
      })),
    [state.toolModels]
  );

  const visionOptions = useMemo(
    () =>
      state.visionModels.map((model) => ({
        value: model,
        label: model,
      })),
    [state.visionModels]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 flex flex-col">
      <NavBar />
      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4">
        {/* ✅ Toast displayed on save */}
        {state.saved && <Toast message="✅ Model configuration saved." />}

        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <div className="flex items-center mb-6 gap-3">
            <img src="/ollama.svg" alt="Ollama Logo" className="w-8 h-8" />
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Ollama Model Settings</h1>
          </div>

          <p className="text-gray-500 mb-8 text-sm">
            Configure which Ollama models are used for chat and image tasks. Your selections will be used for all future conversations.
          </p>

          {state.loading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <span className="animate-spin h-5 w-5 border-2 border-blue-400 border-t-transparent rounded-full inline-block"></span>
              Loading models...
            </div>
          ) : (
            <form className="space-y-8" onSubmit={actions.saveConfig}>
              <section>
                <h2 className="text-lg font-semibold mb-2 text-gray-800 flex items-center gap-2">
                  <span role="img" aria-label="Chat">💬</span> Chat Model
                </h2>
                <Select
                  className="react-select-container"
                  classNamePrefix="react-select"
                  isDisabled={state.saving}
                  placeholder="Select a model..."
                  options={toolOptions}
                  value={toolOptions.find(opt => opt.value === state.currToolModel) || null}
                  onChange={opt => actions.setCurrToolModel(opt?.value || "")}
                />
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-2 text-gray-800 flex items-center gap-2">
                  <span role="img" aria-label="Image">🖼️</span> Image Model
                </h2>
                <Select
                  className="react-select-container"
                  classNamePrefix="react-select"
                  isDisabled={state.saving}
                  placeholder="Select a model..."
                  options={visionOptions}
                  value={visionOptions.find(opt => opt.value === state.currVisionModel) || null}
                  onChange={opt => actions.setCurrVisionModel(opt?.value || "")}
                />
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <span role="img" aria-label="Tools">🛠️</span> Tools
                </h2>
                <div className="space-y-4">
                  <ToggleButton
                    label="Web Search"
                    checked={state.toolConfig.web_search}
                    onChange={() => actions.toggleTool('web_search')}
                  />
                  <ToggleButton
                    label="Weather"
                    checked={state.toolConfig.weather}
                    onChange={() => actions.toggleTool('weather')}
                  />
                  <ToggleButton
                    label="Math"
                    checked={state.toolConfig.math}
                    onChange={() => actions.toggleTool('math')}
                  />
                </div>
              </section>

              <div className="bg-gray-50 rounded-lg p-4 mt-6 text-gray-700 text-sm border border-gray-100">
                <div className="mb-1">
                  Selected Chat Model:{" "}
                  <span className="font-mono text-blue-700">
                    {state.currToolModel || "(none)"}
                  </span>
                </div>
                <div className="mb-1">
                  Selected Image Model:{" "}
                  <span className="font-mono text-blue-700">
                    {state.currVisionModel || "(none)"}
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <span className="font-medium">Enabled Tools:</span>{" "}
                  <span className="font-mono text-blue-700">
                    {Object.entries(state.toolConfig || {})
                      .filter(([_key, enabled]) => enabled)
                      .map(([tool]) => tool.replace('_', ' '))
                      .join(', ') || "(none)"}
                  </span>
                </div>
              </div>

              {state.error && (
                <div className="text-red-600 text-sm mt-2">{state.error}</div>
              )}

              <button
                type="submit"
                className={`w-full mt-4 py-3 rounded-lg font-semibold text-white transition-all ${
                  state.currToolModel && state.currVisionModel
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
                disabled={
                  !state.currToolModel || !state.currVisionModel || state.saving
                }
              >
                {state.saving ? "Saving..." : "Save"}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
