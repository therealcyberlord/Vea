from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models.chat import ChatQuery
from models.config import ConfigResponse, ModelConfig
from utils.config import read_agent_config, update_agent_config
from agent import VeaAgent
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


def create_vea_agent():
    """Creates an instance of Vea Agent"""
    config = read_agent_config()

    return VeaAgent(
        tool_model_name=config.tool_model, vision_model_name=config.image_model
    )


agent = create_vea_agent()


@app.post("/chat/")
async def call_vea_agent(body: ChatQuery):
    """Endpoint to interact with the VeaAgent"""
    if body.image_data:
        agent.graph.update_state(agent.config, {"image_data": body.image_data})
    else:
        agent.graph.update_state(agent.config, {"image_data": None})

    response = await agent.query(body.query)
    return response


@app.get("/show-ollama-models/")
def show_ollama_models() -> ConfigResponse:
    """Endpoint to show available Ollama models, we return a tuple of model names
    The first one is a list of available models compatible with tool-calling, the second is a list of available vision models.
    """
    # run ollama list
    try:
        result = subprocess.run(
            ["ollama", "list"], capture_output=True, text=True, check=True
        )
        result = result.stdout.splitlines()[1:]
        result = [r.split(" ")[0] for r in result]

        tool_models = []
        vision_models = []

        config = read_agent_config()
        curr_tool_model_name = config.tool_model.split(":", 1)[1]
        curr_vision_model_name = config.image_model.split(":", 1)[1]

        for model_name in result:
            info = subprocess.run(
                ["ollama", "show", model_name],
                capture_output=True,
                text=True,
                check=True,
            )
            info = info.stdout
            if "tools" in info:
                tool_models.append(model_name)
            if "vision" in info:
                vision_models.append(model_name)

        return ConfigResponse(
            tool=tool_models,
            vision=vision_models,
            curr_tool_model=curr_tool_model_name,
            curr_vision_model=curr_vision_model_name,
        )
    except subprocess.CalledProcessError as e:
        return ConfigResponse(
            tool=[],
            vision=[],
            curr_tool_model=None,
            curr_vision_model=None,
            error=str(e),
        )


@app.post("/update-model-config/")
def update_model_config(body: ModelConfig):
    print(body.tool_model, body.image_model)
    update_agent_config(body.tool_model, body.image_model)
    global agent
    agent = create_vea_agent()
    return {
        "message": "Model configuration updated and saved.",
    }
