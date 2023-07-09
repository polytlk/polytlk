"""Perform Korean NLP tasks for polytlk."""
from collections.abc import Iterable
from typing import Any

import esupar
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

nlp = esupar.load('ko')


def check_list_str(doc: Any) -> list[str]:
    """Ensure input is list of str."""
    if not isinstance(doc, Iterable):
        raise TypeError('Expected input to be an iterable, got {0}'.format(type(doc).__name__))

    if not all(isinstance(str_maybe, str) for str_maybe in doc):
        raise TypeError('Expected all elements to be str')

    return list(doc)


class KoreanQuery(BaseModel):
    """DTO for korean endpoint."""

    user_input: str  # should be valid korean text


def generate_tokens(user_input: str) -> list[str]:
    """Process korean text into doc and return tokens."""
    doc = nlp(user_input)
    tokens = doc.values[1]

    return check_list_str(tokens)


@app.post('/korean/')
async def korean_endpoint(user_query: KoreanQuery) -> Any:
    """Do NLP preprocessing and other logic before calling socrates."""
    tokens = generate_tokens(user_query.user_input)

    return {'response': tokens}
