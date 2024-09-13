"""Handles validation and task generation for chinese."""
import json
import logging
import time
from typing import Any, Generator

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from redis import Redis
from sqlmodel import Session, select
from sse_starlette.sse import EventSourceResponse

from eden.celery_utils import create_celery
from eden.chinese.schemas import ChineseQuery, ChineseTask, Message
from eden.config import settings
from eden.models.crud import (get_or_create_link, get_or_create_meaning,
                              get_or_create_unit)
from eden.models.database import engine
from eden.models.models import Meaning, Unit, UnitMeaningLink
from eden.models.validators import WorkerReponse
from eden.tracing import tracer  # noqa: I001
from eden.utils.validation import is_zh

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

celery_app = create_celery()
redis_db = Redis.from_url(url=settings.celery_broker_url)


@router.post('/interpretation', response_model=ChineseTask, responses={422: {'model': Message}})
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
                worker_res = WorkerReponse(**data_dict)

                logger.info(worker_res.ari_data)

                with Session(engine) as session:
                    logger.info("start db session")

                    logger.info("checking all the word meanings")
                    for word_meaning in worker_res.ari_data.words:
                        logger.info("checking word meaning -> {0}".format(word_meaning))
                        unit_text = word_meaning[0]
                        sound = word_meaning[1]
                        meaning_text = word_meaning[2]

                        unit = get_or_create_unit(session, unit_text)
                        meaning = get_or_create_meaning(session, meaning_text)
                        link = get_or_create_link(session, unit.id, meaning.id, sound)

                        logger.info("the unit {0} sounds like {1} and means {2}".format(link.unit, link.sound, link.meaning))


                    try:
                        logger.info("commiting session")
                        session.commit()
                    except IntegrityError as e:
                        session.rollback()  # Rollback in case of any error
                        logger.info("session error")

                yield json.dumps(data_dict)
                break
            time.sleep(1)
    return EventSourceResponse(event_generator(task_id))
