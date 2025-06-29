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
    get_current_time,
    fetch_weather_data,
    use_vision_llm,
)


load_dotenv()


class State(TypedDict):
    # Messages have the type "list". The `add_messages` function
    # in the annotation defines how this state key should be updated
    # (in this case, it appends messages to the list, rather than overwriting them)
    messages: Annotated[list, add_messages]
    image_data: str


class VeaAgent:
    def __init__(
        self,
        thread_id: str = "1",
        tool_model_name: str = "ollama:cogito:8b",
        vision_model_name: str = "ollama:gemma3:4b",
    ):
        self.memory = MemorySaver()
        self.llm = init_chat_model(tool_model_name)
        self.web_search = TavilySearch(
            max_results=2, api_key=os.getenv("TAVILY_API_KEY")
        )

        self.tools = [
            self.web_search,
            calculator,
            get_current_time,
            trig_functions,
            fetch_weather_data,
        ]
        self.llm_with_tools = self.llm.bind_tools(self.tools)
        self.vision_model_name = vision_model_name

        self.config = {"configurable": {"thread_id": thread_id}}
        self.graph = self._build_graph()

        # check if langgraph_workflow.png exists, if not create it
        if not os.path.exists("langgraph_workflow.png"):
            img_bytes = self.graph.get_graph().draw_mermaid_png()

            with open("langgraph_workflow.png", "wb") as f:
                f.write(img_bytes)

    async def chatbot(self, state: State):
        if not state["image_data"]:
            message = await self.llm_with_tools.ainvoke(state["messages"])
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


# if __name__ == "__main__":
#     agent = VeaAgent()
#     agent.graph.update_state(agent.config, {"force_tool_call": "web_search"})

#     async def main():
#         while True:
#             try:
#                 user_input = input("User: ")
#                 if user_input.lower() in ["quit", "exit", "q"]:
#                     print("Goodbye!")
#                     break
#                 responses = await agent.query(user_input)
#                 print(responses)
#             except Exception as e:
#                 print(f"An error occurred: {e}")

#     asyncio.run(main())
