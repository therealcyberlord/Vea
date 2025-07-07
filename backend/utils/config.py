import yaml
from models.config import ModelConfig


def read_agent_config() -> ModelConfig:
    with open("config/agent.yaml", "r") as f:
        agent_config = yaml.safe_load(f)
        curr_tool_model_name = agent_config["llm_config"]["tool_llm"]["name"]
        curr_vision_model_name = agent_config["llm_config"]["vision_llm"]["name"]
        tool_model_provider = agent_config["llm_config"]["tool_llm"]["provider"]
        vision_model_provider = agent_config["llm_config"]["vision_llm"]["provider"]

        curr_tool_model = tool_model_provider + ":" + curr_tool_model_name
        curr_vision_model = vision_model_provider + ":" + curr_vision_model_name

    return ModelConfig(
        tool_model=curr_tool_model,
        image_model=curr_vision_model,
    )


def update_agent_config(tool_model: str, vision_model: str):
    with open("config/agent.yaml", "r") as f:
        agent_config = yaml.safe_load(f)
    agent_config["llm_config"]["tool_llm"]["name"] = tool_model
    agent_config["llm_config"]["vision_llm"]["name"] = vision_model
    with open("config/agent.yaml", "w") as f:
        yaml.dump(agent_config, f, default_flow_style=False)
