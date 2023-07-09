"""This module defines the schema of a chinese ARI."""
import re
import unicodedata

from pydantic import BaseModel, constr, validator
from zhon.pinyin import sent as pinyin_sent
from zhon.pinyin import syl as pinyin_syl

from eden.model.singleton import ModelLoader

DIA_PINYIN_ERR = '{0} does not match sentence pattern from zhon.pinyin'


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
    dialogue: list[tuple[str, str, str]]

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

    @validator('dialogue')
    def name_must_contain(cls, dialogues):
        for dialogue in dialogues:
            if not re.match(pinyin_sent, dialogue[1], re.IGNORECASE):
                raise ValueError(DIA_PINYIN_ERR.format(dialogue[1]))

        return dialogues
