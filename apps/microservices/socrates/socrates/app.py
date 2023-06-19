"""Has core LLM logic for polytlk application."""
import os

import openai
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

TEMP = 0.2  # controls randomness from chatgpt

app = FastAPI()
openai.api_key = os.environ.get('OPENAI_API_KEY')

origins = [
    'http://localhost:4200',
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


class ProcessedQuery(BaseModel):
    """DTO for ChatGPT endpoint."""

    user_input: str  # Original unprocessed text from polytlk client
    # tokens: list[str]  # noqa: E800
    # tags: list[str]  # noqa: E800


chinese_prompt = """\
You are a mandarin teacher. You will be given authentic mandarin text
and you will break the given text up into 3 distinct sections
words used in the text, overall meaning of said text, example dialougue with the given text
For the dialogues must include pinyin transliteration and meaning on the same line delimited by | .
"""


def generate_response(user_input):
    """Select the correct prompt for system based on language and inject user input."""
    response = openai.ChatCompletion.create(
        model='gpt-3.5-turbo',
        messages=[
            {'role': 'system', 'content': chinese_prompt},
            {'role': 'user', 'content': user_input},
        ],
        temperature=TEMP,
    )

    return response.choices[0].message.content


@app.post('/chatgpt/')
async def chatgpt_endpoint(user_query: ProcessedQuery):
    """Take original input and tokens already learned and ask AI to explain."""
    response = generate_response(user_query.user_input)
    return {'response': response}
