"""This module defines the schema of chinese interpretations.

These schemas make it easy to work with and validation chinese interpretations

Classes:
    ChineseInterpretation: Data model to represent the Chinese interpretation
    ResponseModel: Data model to represent the overall response
"""
import json
from typing import Any, List, Tuple

from pydantic import BaseModel, constr, validator
from zhon.hanzi import characters
from zhon.pinyin import sent, word


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

    words: List[Tuple[constr(regex=characters), constr(regex=word), str]]
    meaning: constr(min_length=1)
    dialogue: List[Tuple[str, constr(regex=sent), str]]


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
