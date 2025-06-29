from langchain_core.tools import tool
import datetime


@tool("get_current_time", return_direct=True)
def get_current_time() -> str:
    """Get the current date and time in a standard format. Useful for answering time-related questions."""
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
