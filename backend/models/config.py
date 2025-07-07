from pydantic import BaseModel, Field, AliasChoices


class UpdateModelConfig(BaseModel):
    tool_model: str = Field(
        serialization_alias="toolModel",
        validation_alias=AliasChoices("toolModel", "tool_model"),
    )
    image_model: str = Field(
        serialization_alias="imageModel",
        validation_alias=AliasChoices("imageModel", "image_model"),
    )


class OllamaModelsResponse(BaseModel):
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
    error: str | None = None
