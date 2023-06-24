"""This module defines the schema of chinese interpretations.

These schemas make it easy to work with and validation chinese interpretations

Classes:
    ChineseInterpretation: Data model to represent the Chinese interpretation
    ResponseModel: Data model to represent the overall response
"""

import json
from typing import Any, List, Tuple

from pydantic import BaseModel, validator


class ChineseInterpretation(BaseModel):
    """A Pydantic model that represents a Chinese interpretation.

    Attributes:
        words (List[Tuple[str, str, str]]): list of tuples representing words. tuple contains
            - hanji
            - pinyin
            - meaning

        meaning (str): The overall translation of a Chinese sentence.

        dialogue (List[Tuple[str, str, str]]): list of tuples presenting dialogues. tuple contains
            - Chinese sentence
            - pinyin
            - translation

    """

    words: List[Tuple[str, str, str]]
    meaning: str
    dialogue: List[Tuple[str, str, str]]


class ResponseModel(BaseModel):
    """A Pydantic model that represents the overall response for interpretation api.

    Attributes:
        response (ChineseInterpretation): An instance of the ChineseInterpretation model.

    Methods:
        parse_inner_json: method that parses the nested JSON string into a Python object.
    """

    response: ChineseInterpretation

    @validator('response', pre=True)
    def parse_inner_json(cls, str_response: str) -> Any:  # noqa: N805
        """
        Parse the nested JSON string in the 'response' field into a Python object.

        This is a class method that serves as a validator for the 'response' field.

        Args:
            str_response (str): The JSON string in the 'response' field.

        Returns:
            Any: The Python object resulting from the parsed JSON string.
        """
        return json.loads(str_response)
