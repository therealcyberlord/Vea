import logging
import logging.config
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models.chat import ChatQuery
from models.config import ConfigResponse, ModelConfig
from utils.config import read_config, update_config
from agent.create import create_vea_agent
import asyncio
import subprocess


# Configure logging
try:
    logging.config.fileConfig("config/logging.conf")
    logger = logging.getLogger("backend")
except Exception as e:
    # Fallback to basic logging configuration
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.FileHandler("app.log"),
            logging.StreamHandler()
        ]
    )
    logger = logging.getLogger(__name__)
    logger.warning(
        "Failed to load logging configuration from file, using basic config: %s", e
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
app.agent = None


@app.post("/chat/")
async def call_vea_agent(body: ChatQuery):
    """Endpoint to interact with the VeaAgent"""
    logger.info("Received chat request: %s", body.query)

    if app.agent is None:
        logger.info("Creating new Vea agent")
        app.agent = create_vea_agent()

    if body.image_data:
        logger.info("Processing image data with chat query")
        app.agent.graph.update_state(app.agent.config, {"image_data": body.image_data})
    else:
        app.agent.graph.update_state(app.agent.config, {"image_data": None})

    response = await app.agent.query(body.query)
    return response


async def get_model_info(name: str) -> tuple[str, str]:
    logger.debug("Fetching info for Ollama model: %s", name)
    proc = await asyncio.create_subprocess_exec(
        "ollama",
        "show",
        name,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await proc.communicate()
    if proc.returncode != 0:
        error_msg = f"Failed to show model '{name}': {stderr.decode().strip()}"
        logger.error(error_msg)
        raise RuntimeError(error_msg)
    logger.debug("Successfully fetched info for model: %s", name)
    return name, stdout.decode()


@app.get("/show-ollama-models/")
async def show_ollama_models() -> ConfigResponse:
    """Endpoint to show available Ollama models, we return a tuple of model names
    The first one is a list of available models compatible with tool-calling, the second is a list of available vision models.
    """
    logger.info("Fetching available Ollama models")
    try:
        result = subprocess.run(
            ["ollama", "list"], capture_output=True, text=True, check=True
        )
        result = result.stdout.splitlines()[1:]
        model_names = [r.split(" ")[0] for r in result]
        logger.debug("Found %d Ollama models: %s", len(model_names), model_names)

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

        logger.info(
            "Categorized models - Tool models: %s, Vision models: %s",
            tool_models,
            vision_models,
        )

        response = ConfigResponse(
            tool=tool_models,
            vision=vision_models,
            curr_tool_model=curr_tool_model_name,
            curr_vision_model=curr_vision_model_name,
            tools_config=config.tools_config,
        )
        logger.info("Successfully returned model configuration")
        return response
    except subprocess.CalledProcessError as e:
        logger.error("Ollama list command failed: %s", e.stderr)
        raise HTTPException(status_code=500, detail=f"Ollama list failed: {e.stderr}")
    except Exception as e:
        logger.error("Unexpected error in show_ollama_models: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/update-model-config/")
def update_model_config(body: ModelConfig) -> dict[str, str]:
    logger.info(
        "Updating model configuration - Tool model: %s, Vision model: %s",
        body.tool_model,
        body.image_model,
    )

    update_config(body.tool_model, body.image_model, body.tools_config)

    # create a new agent when configs is changed
    logger.info("Creating new agent with updated configuration")
    app.agent = create_vea_agent()

    logger.info("Agent created successfully")
    return {
        "message": "Model configuration updated and saved.",
    }
