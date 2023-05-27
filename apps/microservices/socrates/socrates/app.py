"""Has core LLM logic for polytlk application."""
import os

import openai
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

TEMP = 0.2  # controls randomness from chatgpt

load_dotenv()  # take environment variables from .env.
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
    tokens: list[str]
    tags: list[str]


chinese_prompt = ''.join([
    'You are a mandarin teacher. You will be given authentic mandarin text',
    ' and you will break the text up into 4 lists:',
    'characters used, words used ,sentence patterns used, and overall meaning of the text.',
    'Each list should have the original chinese, pinyin, and correct meaning',
])


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
