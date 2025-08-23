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
    Fetches current weather data for a specified city using the OpenWeatherMap API. Optional country and state codes help disambiguate cities with the same name.

    Args:
        city (str): Name of the city.
        country (str, optional): ISO 3166 country code (e.g., 'US', 'GB', 'CN').
        state (str, optional): State code for US cities (e.g., 'MA', 'CA').
        units (str, optional): Units for temperature. Use 'metric' for Celsius or 'imperial' for Fahrenheit. Default is 'metric'.

    Returns:
        dict: Weather data returned from the OpenWeatherMap API.

    Note:
        Some cities share the same name across different countries or states. For example, "Cambridge" exists both in the United States and the United Kingdom as distinct cities.

    Examples:
        fetch_weather_data("Cambridge", "US", "MA")  # Cambridge, Massachusetts
        fetch_weather_data("Cambridge", "GB")        # Cambridge, United Kingdom
        fetch_weather_data("Cambridge,MA,US")        # Alternative single-string format
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

    params = {"q": query, "appid": os.environ.get("OPENWEATHER_API_KEY"), "units": units}
    
    # Check if API key is available
    if not params["appid"]:
        return {"error": "OPENWEATHER_API_KEY environment variable not set"}

    try:
        response = requests.get(base_url, params=params)
        response.raise_for_status()
        data = response.json()
        return data
    except requests.exceptions.RequestException as e:
        return {"error": f"Request failed: {e}"}
    except KeyError:
        return {"error": "OPENWEATHER_API_KEY environment variable not set"}
