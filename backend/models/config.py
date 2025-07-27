from pydantic import BaseModel, Field, AliasChoices


class ModelConfig(BaseModel):
    tool_model: str = Field(
        serialization_alias="toolModel",
        validation_alias=AliasChoices("toolModel", "tool_model"),
    )
    image_model: str = Field(
        serialization_alias="imageModel",
        validation_alias=AliasChoices("imageModel", "image_model"),
    )
    tools_config: dict[str, bool] = Field(
        serialization_alias="toolsConfig",
        validation_alias=AliasChoices("toolsConfig", "tools_config"),
    )


class ConfigResponse(BaseModel):
    tool: list[str]
    vision: list[str]
    curr_tool_model: str | None = Field(
        alias="currToolModel",
        validation_alias=AliasChoices("currToolModel", "curr_tool_model"),
    )
    curr_vision_model: str | None = Field(
        alias="currVisionModel",
        validation_alias=AliasChoices("currVisionModel", "curr_vision_model"),
    )
    tools_config: dict[str, bool] = Field(
        alias="toolsConfig",
        validation_alias=AliasChoices("toolsConfig", "tools_config"),
    )
    error: str | None = None
