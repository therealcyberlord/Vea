import logging
from typing import Annotated
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition
from langchain.chat_models import init_chat_model
from langchain_tavily import TavilySearch
from langgraph.checkpoint.memory import MemorySaver
from langsmith import traceable
import os
from dotenv import load_dotenv
from tools import (
    calculator,
    trig_functions,
    fetch_weather_data,
    use_vision_llm,
)
import datetime


load_dotenv()

# Configure logger
logger = logging.getLogger("backend.agent")

CURRENT_TIME = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
SYSTEM_PROMPT = f"""You are Vea, a friendly and knowledgeable AI assistant. Respond in a warm, approachable, and helpful manner. Always provide clear, accurate, and thoughtfully presented answers. Use markdown formatting when it improves clarity, structure, or readability. Whenever the user asks about current events, recent scientific developments, or other time-sensitive topics (e.g., stock prices or market trends), use the web search tool to retrieve the most up-to-date information before replying.
Today's date is {CURRENT_TIME}"""
DIAGRAM_OUTPUT_PATH = "diagrams/langgraph_workflow.png"


class State(TypedDict):
    messages: Annotated[list, add_messages]
    image_data: str


class VeaAgent:
    def __init__(
        self,
        tool_model_name,
        vision_model_name,
        thread_id: str = "1",
        enabled_tools: list[str] = ["web_search", "weather", "math"],
    ):
        logger.info(
            "Initializing VeaAgent with tool_model: %s, vision_model: %s",
            tool_model_name,
            vision_model_name,
        )
        logger.info("Enabled tools: %s", enabled_tools)

        self.memory = MemorySaver()
        self.llm = init_chat_model(tool_model_name)
        self.web_search = TavilySearch(
            max_results=2, api_key=os.getenv("TAVILY_API_KEY")
        )

        # we add tools based on the enabled_tools list
        self.tools = []
        if "web_search" in enabled_tools:
            self.tools.append(self.web_search)
            logger.debug("Added web search tool")
        if "weather" in enabled_tools:
            self.tools.append(fetch_weather_data)
            logger.debug("Added weather tool")
        if "math" in enabled_tools:
            self.tools.append(calculator)
            self.tools.append(trig_functions)
            logger.debug("Added math tools")

        self.llm_with_tools = self.llm.bind_tools(self.tools)
        self.vision_model_name = vision_model_name

        self.config = {"configurable": {"thread_id": thread_id}}
        self.graph = self._build_graph()

        # save a workflow graph, you can comment this out if you don't want to save the graph
        if not os.path.exists(DIAGRAM_OUTPUT_PATH):
            logger.info("Generating workflow diagram at %s", DIAGRAM_OUTPUT_PATH)
            img_bytes = self.graph.get_graph().draw_mermaid_png()

            with open(DIAGRAM_OUTPUT_PATH, "wb") as f:
                f.write(img_bytes)
            logger.info("Workflow diagram saved successfully")

    async def chatbot(self, state: State):
        logger.debug("Processing chatbot state: %s", state)
        if not state["image_data"]:
            logger.info("Processing text-based query")
            message = await self.llm_with_tools.ainvoke(
                self.preprend_system_prompt(state)
            )
            logger.debug("LLM response generated")
            return {"messages": [message]}

        else:
            logger.info("Processing image-based query with vision LLM")
            query = self.extract_query_from_state(state)
            message = await use_vision_llm.ainvoke(
                {
                    "query": query,
                    "image_data": state["image_data"],
                    "model_name": self.vision_model_name,
                }
            )

            logger.debug("Vision LLM response generated")
            return {"messages": [message], "image_data": None}

    def extract_query_from_state(self, state):
        messages = state.get("messages", [])
        # Iterate backwards to find the most recent HumanMessage
        for msg in reversed(messages):
            if type(msg).__name__ == "HumanMessage":
                logger.debug("Extracted query from HumanMessage: %s", msg.content)
                return msg.content
        logger.warning("No HumanMessage found in state")
        return ""

    def preprend_system_prompt(self, state):
        messages = state["messages"]
        system_message = {
            "role": "system",
            "content": SYSTEM_PROMPT,
        }
        return [system_message] + messages

    def _build_graph(self):
        logger.info("Building LangGraph workflow")
        graph_builder = StateGraph(State)
        graph_builder.add_node("chatbot", self.chatbot)
        tool_node = ToolNode(tools=self.tools)
        graph_builder.add_node("tools", tool_node)

        graph_builder.add_conditional_edges("chatbot", tools_condition)
        graph_builder.add_edge("tools", "chatbot")
        graph_builder.add_edge(START, "chatbot")

        graph = graph_builder.compile(checkpointer=self.memory)
        logger.info("LangGraph workflow built successfully")
        return graph

    @traceable
    async def query(self, user_input: str) -> str:
        logger.info("Processing user query: %s", user_input)
        state = await self.graph.ainvoke(
            {"messages": [{"role": "user", "content": user_input}]},
            config=self.config,
            debug=True,
        )

        response = state["messages"][-1].content
        logger.info("Query processed successfully, response length: %d", len(response))
        return response
