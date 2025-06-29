import os
import requests
from typing import Literal, Optional
from dotenv import load_dotenv
from langchain_core.tools import tool

load_dotenv()


@tool("fetch_weather_data")
def fetch_weather_data(
    city: str,
    country: Optional[str] = None,
    state: Optional[str] = None,
    units: Literal["metric", "imperial"] = "metric",
) -> dict:
    """
    Fetch weather data for a city with optional country/state specification. This provides the current weather conditions using the OpenWeatherMap API.

    Args:
        city: City name
        country: ISO 3166 country code (e.g., 'US', 'GB', 'CN')
        state: State code for US cities (e.g., 'MA', 'CA')
        units: Temperature units ('metric' for Celsius, 'imperial' for Fahrenheit), typically you should use 'metric'
        unless specifically specified otherwise.

    Returns:
        Weather data dictionary from OpenWeatherMap API

    Examples:
        fetch_weather_data("Cambridge", "US", "MA")  # Cambridge, Massachusetts
        fetch_weather_data("Cambridge", "GB")        # Cambridge, UK
        fetch_weather_data("Cambridge,MA,US")        # Alternative format
    """
    base_url = "http://api.openweathermap.org/data/2.5/weather"

    # Build the query string based on provided parameters
    if "," in city:
        # Handle comma-separated format: "Cambridge,MA,US"
        query = city
    elif country and state:
        # US city with state: "Cambridge,MA,US"
        query = f"{city},{state},{country}"
    elif country:
        # City with country: "Cambridge,GB"
        query = f"{city},{country}"
    else:
        # Just city name (may be ambiguous)
        query = city

    params = {"q": query, "appid": os.environ["OPENWEATHER_API_KEY"], "units": units}

    try:
        response = requests.get(base_url, params=params)
        response.raise_for_status()  # Raises exception for HTTP errors
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": f"Request failed: {e}"}
    except KeyError:
        return {"error": "OPENWEATHER_API_KEY environment variable not set"}
