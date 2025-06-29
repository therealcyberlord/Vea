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
        return x + y
    elif operation == "subtract":
        return x - y
    elif operation == "multiply":
        return x * y
    elif operation == "divide":
        if y == 0:
            raise ValueError("Cannot divide by zero.")
        return x / y
    elif operation == "modulo":
        if y == 0:
            raise ValueError("Cannot perform modulo by zero.")
        return x % y
    else:
        raise ValueError(
            "Invalid operation. Choose from add, subtract, multiply, or divide."
        )


@tool("trig_functions")
def trig_functions(
    x: float,
    operation: Literal["sin", "cos", "tan"],
    mode: Literal["radians", "degrees"] = "degrees",
) -> float:
    """Perform trigonometric functions: sine, cosine, and tangent."""
    if mode == "degrees":
        x = math.radians(x)
    if operation == "sin":
        return math.sin(x)
    elif operation == "cos":
        return math.cos(x)
    elif operation == "tan":
        return math.tan(x)
    else:
        raise ValueError("Invalid operation. Choose from sin, cos, or tan.")
