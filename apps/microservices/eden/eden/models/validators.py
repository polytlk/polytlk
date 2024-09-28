import json
from typing import Any, List, Tuple

from pydantic import BaseModel, Field, validator


class WordMeaning(BaseModel):
    word: str
    pinyin: str
    meaning: str

class Dialogue(BaseModel):
    original: str
    pinyin: str
    english: str

class LanguageData(BaseModel):
    words: List[Tuple[str, str, str]]
    meaning: str 
    dialogue: List[Tuple[str, str, str]]


class WorkerReponse(BaseModel):
    user_input: str
    response: str
    ari_data: LanguageData

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
