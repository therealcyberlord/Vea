import logging
from agent.vea import VeaAgent
from utils.config import read_config


logger = logging.getLogger(__name__)


def create_vea_agent():
    """Creates an instance of Vea Agent"""
    logger.info("Creating Vea agent")
    config = read_config()

    tools = config.tools_config
    enabled_tools = [tool for tool, enabled in tools.items() if enabled]
    logger.info("Enabled tools: %s", enabled_tools)

    agent = VeaAgent(
        tool_model_name=config.tool_model,
        vision_model_name=config.image_model,
        enabled_tools=enabled_tools,
    )
    logger.info("Vea agent created successfully")
    return agent
