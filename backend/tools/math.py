from typing import Literal
from langchain_core.tools import tool
import math


@tool("basic_calculator")
def calculator(
    x: float,
    y: float,
    operation: Literal["add", "subtract", "multiply", "divide", "modulo"],
) -> float:
    """Perform basic arithmetic operations, including addition, subtraction, multiplication, division, and modulo."""
    if operation == "add":
        result = x + y
    elif operation == "subtract":
        result = x - y
    elif operation == "multiply":
        result = x * y
    elif operation == "divide":
        if y == 0:
            raise ValueError("Cannot divide by zero.")
        result = x / y
    elif operation == "modulo":
        if y == 0:
            raise ValueError("Cannot perform modulo by zero.")
        result = x % y

    return result


@tool("trig_functions")
def trig_functions(
    x: float,
    operation: Literal["sin", "cos", "tan"],
    mode: Literal["radians", "degrees"] = "degrees",
) -> float:
    """Perform trigonometric functions: sine, cosine, and tangent."""
    if mode == "degrees":
        x_rad = math.radians(x)
    else:
        x_rad = x

    if operation == "sin":
        result = math.sin(x_rad)
    elif operation == "cos":
        result = math.cos(x_rad)
    elif operation == "tan":
        result = math.tan(x_rad)

    return result
