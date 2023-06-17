"""Handles validation and task generation for chinese."""
from typing import Any
from eden.tracing import tracer  # noqa: I001

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from opentelemetry import trace

from eden.chinese.schemas import ChineseQuery, ChineseTokens, Message
from eden.utils.tokenization import generate_tokens
from eden.utils.validation import is_zh

router = APIRouter()


@router.post('/chinese/', response_model=ChineseTokens, responses={422: {'model': Message}})
async def chinese_endpoint(user_query: ChineseQuery) -> Any:
    """Do NLP preprocessing and other logic before calling socrates."""
    with tracer.start_as_current_span('Preprocess Chinese'):
        span = trace.get_current_span()
        span.set_attribute('com.polytlk.eden.user_input', user_query.user_input)

        if is_zh(user_query.user_input):
            tokens = generate_tokens(user_query.user_input)
            return {'tokens': tokens}

        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={'message': 'Input is not valid chinese'},
        )
