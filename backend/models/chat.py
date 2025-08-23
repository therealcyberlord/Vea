import logging
from pydantic import BaseModel, Field, AliasChoices


# Configure logger
logger = logging.getLogger("backend.models.chat")

class ChatQuery(BaseModel):
    query: str
    image_data: str = Field(
        serialization_alias="imageData",
        validation_alias=AliasChoices("imageData", "image_data"),
        default="",
    )
    
    def __init__(self, **data):
        super().__init__(**data)
        logger.debug("ChatQuery created with query: %s, image_data length: %d", 
                    self.query, len(self.image_data))
