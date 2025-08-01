from agent.vea import VeaAgent
from utils.config import read_config


def create_vea_agent():
    """Creates an instance of Vea Agent"""
    config = read_config()

    return VeaAgent(
        tool_model_name=config.tool_model, vision_model_name=config.image_model
    )
