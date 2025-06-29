from langchain_core.tools import tool
from langchain.chat_models import init_chat_model


@tool("use_vision_llm", return_direct=True)
def use_vision_llm(
    query: str, image_data: str, model_name: str = "ollama:gemma3:4b"
) -> str:
    """Use a vision LLM to extract information on an image."""
    vlm = init_chat_model(model_name)
    message = {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": query,
            },
            {
                "type": "image",
                "source_type": "base64",
                "data": image_data,
                "mime_type": "image/jpeg",
            },
        ],
    }
    response = vlm.invoke([message])
    return response.text()


# # read an image to base64
# path = "langgraph_workflow.png"

# with open(path, "rb") as image_file:
#     encoded_string = base64.b64encode(image_file.read())

# base64_str = encoded_string.decode("utf-8")
# print(use_vision_llm(base64_str))  # This line is just for testing the function
