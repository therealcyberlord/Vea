from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, AliasChoices
from agent import VeaAgent
import subprocess
import yaml


class ChatQuery(BaseModel):
    query: str
    image_data: str = Field(
        serialization_alias="imageData",
        validation_alias=AliasChoices("imageData", "image_data"),
        default="",
    )


class UpdateModelConfig(BaseModel):
    tool_model: str = Field(
        serialization_alias="toolModel",
        validation_alias=AliasChoices("toolModel", "tool_model"),
    )
    image_model: str = Field(
        serialization_alias="imageModel",
        validation_alias=AliasChoices("imageModel", "image_model"),
    )


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
    with open("config/agent.yaml", "r") as f:
        llm_config = yaml.safe_load(f)

    tool_model_name = llm_config["llm_config"]["tool_llm"]["name"]
    tool_model_provider = llm_config["llm_config"]["tool_llm"]["provider"]
    vision_model_name = provider + ":" + llm_config["llm_config"]["vision_llm"]["name"]
    vision_model_provider = llm_config["llm_config"]["vision_llm"]["provider"]

    tool_model = tool_model_provider + ":" + tool_model_name
    vision_model = vision_model_provider + ":" + vision_model_name

    return VeaAgent(tool_model_name=tool_model, vision_model_name=vision_model)


# define the agent for persistent memory

# read the tool_llm and vision_llm from the config file
with open("config/agent.yaml", "r") as f:
    llm_config = yaml.safe_load(f)

provider = "ollama"
tool_model_name = provider + ":" + llm_config["llm_config"]["tool_llm"]["name"]
vision_model_name = provider + ":" + llm_config["llm_config"]["vision_llm"]["name"]
agent = VeaAgent(tool_model_name=tool_model_name, vision_model_name=vision_model_name)


@app.post("/chat/")
async def call_vea_agent(body: ChatQuery):
    """Endpoint to interact with the VeaAgent"""
    if body.image_data:
        agent.graph.update_state(agent.config, {"image_data": body.image_data})
        agent.graph.update_state(agent.config, {"force_tool_call": None})
    else:
        agent.graph.update_state(agent.config, {"image_data": None})
        agent.graph.update_state(agent.config, {"force_tool_call": None})

    response = await agent.query(body.query)
    return response


@app.get("/show-ollama-models/")
def show_ollama_models():
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

        return {
            "tool": tool_models,
            "vision": vision_models,
        }
    except subprocess.CalledProcessError as e:
        return {"error": str(e), "output": e.output}


@app.post("/update-model-config/")
def update_model_config(body: UpdateModelConfig):
    config_path = "config/agent.yaml"

    # Load existing YAML config
    with open(config_path, "r") as f:
        llm_config = yaml.safe_load(f)

    # Update fields
    llm_config["llm_config"]["tool_llm"]["name"] = body.tool_model
    llm_config["llm_config"]["vision_llm"]["name"] = body.image_model

    # Save updated YAML config
    with open(config_path, "w") as f:
        yaml.dump(llm_config, f, default_flow_style=False)

    global agent
    agent = create_vea_agent()

    return {
        "message": "Model configuration updated and saved.",
    }
