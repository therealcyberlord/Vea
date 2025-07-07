from pydantic import BaseModel, Field, AliasChoices


class ChatQuery(BaseModel):
    query: str
    image_data: str = Field(
        serialization_alias="imageData",
        validation_alias=AliasChoices("imageData", "image_data"),
        default="",
    )
