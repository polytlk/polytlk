"""This module defines the schema of chinese interpretations.

These schemas make it easy to work with and validation chinese interpretations

Classes:
    ChineseInterpretation: Data model to represent the Chinese interpretation
    ResponseModel: Data model to represent the overall response
"""
import json
import unicodedata
from typing import Any

from pydantic import BaseModel, constr, validator
from zhon.pinyin import sent as pinyin_sent
from zhon.pinyin import syl as pinyin_syl

from eden.model.singleton import ModelLoader


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

    words: list[tuple[str, constr(regex=pinyin_syl), str]]
    meaning: constr(min_length=1)
    dialogue: list[tuple[str, constr(regex=pinyin_sent), str]]

    @validator('words')
    def check_first_character(cls, words):
        model = ModelLoader().load_model()

        for word in words:
            if len(word[0]) > 1: 
                for tok in model(word[0]):
                    if 'CJK UNIFIED IDEOGRAPH' not in unicodedata.name(tok[0], ''):
                        raise ValueError(f"The first character of the word tuple must be a CJK Unified Ideograph, got {tok[0]} instead.")
            else:
                if 'CJK UNIFIED IDEOGRAPH' not in unicodedata.name(word[0], ''):
                    raise ValueError(f"The first character of the word tuple must be a CJK Unified Ideograph, got {word[0]} instead.")
        return words



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
