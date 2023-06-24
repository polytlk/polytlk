"""Has core LLM logic for polytlk application."""
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel

from socrates.openai.interpret import gen_ari_data, gen_raw_ari
from socrates.openai.prompts import prompts

router = APIRouter()


class ProcessedQuery(BaseModel):
    """DTO for ChatGPT endpoint."""

    user_input: str  # Original unprocessed text from polytlk client
    native_language_code: str  # user's native language
    target_language_code: str  # users' target language
    # tokens: list[str]  # noqa: E800
    # tags: list[str]  # noqa: E800


@router.post('/chatgpt')
async def chatgpt_endpoint(user_query: ProcessedQuery) -> Any:
    """Take original input and tokens already learned and ask AI to explain."""
    prompt = prompts[user_query.native_language_code][user_query.target_language_code]
    interpretation = gen_raw_ari(prompt, user_query.user_input)
    response = gen_ari_data(interpretation)

    return {
        'response': interpretation,
        'ari_data': response,
    }
