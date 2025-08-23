import logging
import yaml
from models.config import ModelConfig
from pathlib import Path


# Configure logger
logger = logging.getLogger("backend.utils.config")
CONFIG_PATH = Path("config/agent.yaml")


def load_yaml_config() -> dict[str, any]:
    """Loads and parses the YAML config file."""
    logger.debug("Loading YAML config from %s", CONFIG_PATH)
    
    if not CONFIG_PATH.exists():
        logger.error("Config file not found at %s", CONFIG_PATH)
        raise FileNotFoundError("Missing config file at 'config/agent.yaml'.")

    try:
        with open(CONFIG_PATH, "r") as f:
            config = yaml.safe_load(f) or {}
        logger.info("Config file loaded successfully")
    except yaml.YAMLError as e:
        logger.error("Failed to parse YAML config: %s", e)
        raise ValueError(f"Failed to parse YAML: {e}")
    except Exception as e:
        logger.error("Unexpected error loading config: %s", e)
        raise

    return config


def read_config() -> ModelConfig:
    """Reads and validates the agent config file, returning a ModelConfig."""
    logger.info("Reading agent configuration")
    config = load_yaml_config()

    try:
        tool_llm = config["llm_config"]["tool_llm"]
        vision_llm = config["llm_config"]["vision_llm"]
        tool_model = f"{tool_llm['provider']}:{tool_llm['name']}"
        vision_model = f"{vision_llm['provider']}:{vision_llm['name']}"
        tools_config = config["tools"]
        
        logger.debug("Config values - Tool model: %s, Vision model: %s", 
                    tool_model, vision_model)

    except KeyError as e:
        logger.error("Missing required config key: %s", e)
        raise ValueError(f"Missing required config key: {e}")

    model_config = ModelConfig(
        tool_model=tool_model, image_model=vision_model, tools_config=tools_config
    )
    logger.info("Agent configuration read successfully")
    return model_config


def update_config(
    tool_model_name: str, vision_model_name: str, tool_config: dict[str, bool]
) -> None:
    """Updates the tool and vision model names in the config file."""
    logger.info("Updating configuration - Tool model: %s, Vision model: %s", 
                tool_model_name, vision_model_name)
    logger.debug("Tool config: %s", tool_config)
    
    config = load_yaml_config()

    try:
        config["llm_config"]["tool_llm"]["name"] = tool_model_name
        config["llm_config"]["vision_llm"]["name"] = vision_model_name
        config["tools"] = tool_config
        logger.debug("Config updated in memory")
    except KeyError as e:
        logger.error("Missing required structure in config file: %s", e)
        raise ValueError(f"Missing required structure in config file: {e}")

    try:
        with open(CONFIG_PATH, "w") as f:
            yaml.dump(config, f, default_flow_style=False, sort_keys=False)
        logger.info("Configuration updated and saved successfully")
    except IOError as e:
        logger.error("Failed to write updated config: %s", e)
        raise IOError(f"Failed to write updated config: {e}")
