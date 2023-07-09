"""This module defines the schema of the overall response."""
import json
from typing import Any

from pydantic import BaseModel, validator

from eden.chinese.schema.ari import ChineseInterpretation


class ResponseModel(BaseModel):
    """A Pydantic model that represents the overall response for interpretation api.

    Attributes:
        response: raw interpretation in multiline string
        ari_data (ChineseInterpretation): An instance of the ChineseInterpretation model.

    Methods:
        parse_inner_json: method that parses the nested JSON string into a Python object.
    """

    response: str
    ari_data: ChineseInterpretation

    @validator('ari_data', pre=True)
    def parse_inner_json(cls, str_data: str) -> Any:  # noqa: N805
        """
        Parse the nested JSON string in the 'ari_data' field into a Python object.

        This is a class method that serves as a validator for the 'ari_data' field.

        Args:
            str_data (str): The JSON string in the 'ari_data' field.

        Returns:
            Any: The Python object resulting from the parsed JSON string.
        """
        return json.loads(str_data)
