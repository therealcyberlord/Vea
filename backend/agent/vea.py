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
    ):
        self.memory = MemorySaver()
        self.llm = init_chat_model(tool_model_name)
        self.web_search = TavilySearch(
            max_results=2, api_key=os.getenv("TAVILY_API_KEY")
        )

        self.tools = [
            self.web_search,
            calculator,
            trig_functions,
            fetch_weather_data,
        ]
        self.llm_with_tools = self.llm.bind_tools(self.tools)
        self.vision_model_name = vision_model_name

        self.config = {"configurable": {"thread_id": thread_id}}
        self.graph = self._build_graph()

        # save a workflow graph, you can comment this out if you don't want to save the graph
        if not os.path.exists(DIAGRAM_OUTPUT_PATH):
            img_bytes = self.graph.get_graph().draw_mermaid_png()

            with open(DIAGRAM_OUTPUT_PATH, "wb") as f:
                f.write(img_bytes)

    async def chatbot(self, state: State):
        if not state["image_data"]:
            message = await self.llm_with_tools.ainvoke(
                self.preprend_system_prompt(state)
            )
            return {"messages": [message]}

        else:
            print("Redirecting to using a vision LLM tool")

            query = self.extract_query_from_state(state)
            message = await use_vision_llm.ainvoke(
                {
                    "query": query,
                    "image_data": state["image_data"],
                    "model_name": self.vision_model_name,
                }
            )

            return {"messages": [message], "image_data": None}

    def extract_query_from_state(self, state):
        messages = state.get("messages", [])
        # Iterate backwards to find the most recent HumanMessage
        for msg in reversed(messages):
            if type(msg).__name__ == "HumanMessage":
                return msg.content
        return ""

    def preprend_system_prompt(self, state):

        messages = state["messages"]
        system_message = {
            "role": "system",
            "content": SYSTEM_PROMPT,
        }
        return [system_message] + messages

    def _build_graph(self):
        graph_builder = StateGraph(State)
        graph_builder.add_node("chatbot", self.chatbot)
        tool_node = ToolNode(tools=self.tools)
        graph_builder.add_node("tools", tool_node)

        graph_builder.add_conditional_edges("chatbot", tools_condition)
        graph_builder.add_edge("tools", "chatbot")
        graph_builder.add_edge(START, "chatbot")
        return graph_builder.compile(checkpointer=self.memory)

    @traceable
    async def query(self, user_input: str) -> str:
        state = await self.graph.ainvoke(
            {"messages": [{"role": "user", "content": user_input}]},
            config=self.config,
            debug=True,
        )

        return state["messages"][-1].content
