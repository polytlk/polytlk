"""Has core LLM logic for polytlk application."""
import os

import openai
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from socrates.prompts import prompts

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
    native_language_code: str  # user's native language
    target_language_code: str  # users' target language
    # tokens: list[str]  # noqa: E800
    # tags: list[str]  # noqa: E800


def generate_response(user_query: ProcessedQuery):
    """Select the correct prompt for system based on language and inject user input."""
    prompt = prompts[user_query.native_language_code][user_query.target_language_code]

    response = openai.ChatCompletion.create(
        model='gpt-3.5-turbo',
        messages=[
            {'role': 'system', 'content': prompt},
            {'role': 'user', 'content': user_query.user_input},
        ],
        temperature=TEMP,
    )

    return response.choices[0].message.content


@app.post('/chatgpt/')
async def chatgpt_endpoint(user_query: ProcessedQuery):
    """Take original input and tokens already learned and ask AI to explain."""
    response = generate_response(user_query)
    return {'response': response}
