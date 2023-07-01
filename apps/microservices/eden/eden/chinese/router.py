"""Handles validation and task generation for chinese."""
import json
import time
from typing import Any, Generator

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from redis import Redis
from sse_starlette.sse import EventSourceResponse

from eden.celery_utils import create_celery
from eden.chinese.schemas import ChineseQuery, ChineseTask, Message
from eden.tracing import tracer  # noqa: I001
from eden.utils.validation import is_zh

router = APIRouter()

celery_app = create_celery()
redis_db = Redis(host='redis-master.default.svc.cluster.local', port=6379, db=0)


@router.post('/chinese', response_model=ChineseTask, responses={422: {'model': Message}})
async def chinese_endpoint(user_query: ChineseQuery) -> Any:
    """Do NLP preprocessing and other logic before calling socrates."""
    is_chinese = False

    with tracer.start_as_current_span('INTERPRET: Validate Chinese') as validate_span:
        validate_span.set_attribute('com.polytlk.eden.user_input', user_query.user_input)

        is_chinese = is_zh(user_query.user_input)

    if is_chinese:
        with tracer.start_as_current_span('INTERPRET: Start task') as task_span:
            task = celery_app.send_task(
                'eden.chinese.tasks.sample_task',
                args=[user_query.user_input],
            )
            task_span.set_attribute('com.polytlk.eden.task_id', task.task_id)
            task_span.set_attribute('com.polytlk.eden.user_input', user_query.user_input)
            return {'task_id': task.task_id}

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={'message': 'Input is not valid chinese'},
    )


@router.get('/task/{task_id}/stream')
async def task_stream(task_id: str) -> EventSourceResponse:
    async def event_generator(tid: str) -> Generator[str, None, None]:
        while True:
            task_result = redis_db.get(tid)
            if task_result is not None:
                data_dict = json.loads(task_result.decode('utf-8'))
                yield json.dumps(data_dict)
                break
            time.sleep(1)
    return EventSourceResponse(event_generator(task_id))
