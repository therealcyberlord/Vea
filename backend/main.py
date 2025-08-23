from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models.chat import ChatQuery
from models.config import ConfigResponse, ModelConfig
from utils.config import read_config, update_config
from agent.create import create_vea_agent
import asyncio
import subprocess


app = FastAPI()

origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.agent = None


@app.post("/chat/")
async def call_vea_agent(body: ChatQuery):
    """Endpoint to interact with the VeaAgent"""
    if app.agent is None:
        app.agent = create_vea_agent()
    if body.image_data:
        app.agent.graph.update_state(app.agent.config, {"image_data": body.image_data})
    else:
        app.agent.graph.update_state(app.agent.config, {"image_data": None})

    response = await app.agent.query(body.query)
    return response


async def get_model_info(name: str) -> tuple[str, str]:
    proc = await asyncio.create_subprocess_exec(
        "ollama",
        "show",
        name,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await proc.communicate()
    if proc.returncode != 0:
        raise RuntimeError(f"Failed to show model '{name}': {stderr.decode().strip()}")
    return name, stdout.decode()


@app.get("/show-ollama-models/")
async def show_ollama_models() -> ConfigResponse:
    """Endpoint to show available Ollama models, we return a tuple of model names
    The first one is a list of available models compatible with tool-calling, the second is a list of available vision models.
    """
    try:
        result = subprocess.run(
            ["ollama", "list"], capture_output=True, text=True, check=True
        )
        result = result.stdout.splitlines()[1:]
        model_names = [r.split(" ")[0] for r in result]

        # concurrent execution
        show_results = await asyncio.gather(
            *[get_model_info(name) for name in model_names]
        )

        tool_models = []
        vision_models = []

        config = read_config()
        curr_tool_model_name = config.tool_model.split(":", 1)[1]
        curr_vision_model_name = config.image_model.split(":", 1)[1]

        for model_name, info in show_results:
            if "tools" in info:
                tool_models.append(model_name)
            if "vision" in info:
                vision_models.append(model_name)

        return ConfigResponse(
            tool=tool_models,
            vision=vision_models,
            curr_tool_model=curr_tool_model_name,
            curr_vision_model=curr_vision_model_name,
            tools_config=config.tools_config,
        )
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Ollama list failed: {e.stderr}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/update-model-config/")
def update_model_config(body: ModelConfig) -> dict[str, str]:
    update_config(body.tool_model, body.image_model, body.tools_config)

    # create a new agent when configs is changed
    app.agent = create_vea_agent()
    return {
        "message": "Model configuration updated and saved.",
    }
