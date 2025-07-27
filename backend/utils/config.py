import yaml
from models.config import ModelConfig
from pathlib import Path


CONFIG_PATH = Path("config/agent.yaml")


def load_yaml_config() -> dict[str, any]:
    """Loads and parses the YAML config file."""
    if not CONFIG_PATH.exists():
        raise FileNotFoundError("Missing config file at 'config/agent.yaml'.")

    try:
        with open(CONFIG_PATH, "r") as f:
            config = yaml.safe_load(f) or {}
    except yaml.YAMLError as e:
        raise ValueError(f"Failed to parse YAML: {e}")

    return config


def read_config() -> ModelConfig:
    """Reads and validates the agent config file, returning a ModelConfig."""
    config = load_yaml_config()

    try:
        tool_llm = config["llm_config"]["tool_llm"]
        vision_llm = config["llm_config"]["vision_llm"]
        tool_model = f"{tool_llm['provider']}:{tool_llm['name']}"
        vision_model = f"{vision_llm['provider']}:{vision_llm['name']}"
        tools_config = config["tools"]

    except KeyError as e:
        raise ValueError(f"Missing required config key: {e}")

    return ModelConfig(
        tool_model=tool_model, image_model=vision_model, tools_config=tools_config
    )


def update_config(
    tool_model_name: str, vision_model_name: str, tool_config: dict[str, bool]
) -> None:
    """Updates the tool and vision model names in the config file."""
    config = load_yaml_config()

    try:
        config["llm_config"]["tool_llm"]["name"] = tool_model_name
        config["llm_config"]["vision_llm"]["name"] = vision_model_name
        config["tools"] = tool_config
    except KeyError as e:
        raise ValueError(f"Missing required structure in config file: {e}")

    try:
        with open(CONFIG_PATH, "w") as f:
            yaml.dump(config, f, default_flow_style=False, sort_keys=False)
    except IOError as e:
        raise IOError(f"Failed to write updated config: {e}")
