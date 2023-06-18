"""Handles validation and task generation for chinese."""
from typing import Any
from eden.tracing import tracer  # noqa: I001

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from opentelemetry import trace

from eden.chinese.schemas import ChineseQuery, ChineseTask, Message
from eden.chinese.tasks import sample_task
from eden.utils.validation import is_zh

router = APIRouter()


@router.post('/chinese/', response_model=ChineseTask, responses={422: {'model': Message}})
async def chinese_endpoint(user_query: ChineseQuery) -> Any:
    """Do NLP preprocessing and other logic before calling socrates."""
    with tracer.start_as_current_span('Preprocess Chinese'):
        span = trace.get_current_span()
        span.set_attribute('com.polytlk.eden.user_input', user_query.user_input)

        if is_zh(user_query.user_input):
            task = sample_task.delay(user_query.user_input)
            span.set_attribute('com.polytlk.eden.task_id', task.task_id)
            return {'task_id': task.task_id}

        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={'message': 'Input is not valid chinese'},
        )
