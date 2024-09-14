"""Handles validation and task generation for chinese."""
import json
import logging
import time
from typing import Any, Generator

from fastapi import APIRouter, Request, status
from fastapi.responses import JSONResponse
from redis import Redis
from sqlmodel import Session, select
from sse_starlette.sse import EventSourceResponse

from eden.celery_utils import create_celery
from eden.chinese.schemas import ChineseQuery, ChineseTask, Message
from eden.config import settings
from eden.models.crud import (get_or_create_link, get_or_create_meaning,
                              get_or_create_unit)
from eden.models.models import Dialogue, ParticipantEnum
from eden.models.processing import split_by_separators
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


@router.get('/task/{task_id}/stream', response_model=WorkerReponse)
async def task_stream(task_id: str, request: Request) -> EventSourceResponse:
    async def event_generator(tid: str) -> Generator[WorkerReponse, None, None]:
        while True:
            logger.info("pinging task id -> {0}".format(task_id))
            task_result = redis_db.get(tid)
            logger.info("result -> {0}".format(task_result))

            if task_result is not None:
                data_dict = json.loads(task_result.decode('utf-8'))
                worker_res = WorkerReponse(**data_dict)

                logger.info(worker_res.ari_data)

                engine = request.app.state.engine
                with Session(engine) as session:
                    logger.info("start db session")

                    processed = []
                    for hanzi, pinyin, meaning in worker_res.ari_data.words:
                        logger.info("original hanzi \t-> {0}".format(hanzi))
                        logger.info("\t  pinyin \t-> {0}".format(pinyin))
                        logger.info("\t  meaning \t-> {0}".format(meaning))
                        meanings = split_by_separators(meaning)

                        logger.info('meanings \t\t-> {0}'.format(meanings))
                        logger.info('\t  len  \t\t-> {0}'.format(len(meanings)))

                        for single_meaning in meanings:
        
                            was_split = len(meanings) > 1

                            processed.append([(hanzi, pinyin, single_meaning), was_split])

                    logger.info("checking all the word meanings")
                    for word_meaning, was_split in processed:
                        logger.info("\t word meaning -> {0}".format(word_meaning))
                        logger.info("\t was_split -> {0}\n".format(was_split))
                        unit_text = word_meaning[0]
                        sound = word_meaning[1]
                        meaning_text = word_meaning[2]

                        unit = get_or_create_unit(session, unit_text)
                        meaning = get_or_create_meaning(session, meaning_text, was_split)
                        link = get_or_create_link(session, unit.id, meaning.id, sound)

                        logger.info("\t the unit {0} sounds like {1} and means {2}".format(link.unit.text, link.sound, link.meaning.text))

                    for index, (d_text, d_sound, translation) in enumerate(worker_res.ari_data.dialogue):
                        if index % 2 == 0:
                            speaker = "A"  # Even index -> Speaker A
                        else:
                            speaker = "B"  # Odd index -> Speaker B

                        logger.info(f"Person {speaker}: {d_text} ({d_sound}) -> {translation}")

                        dialogue = Dialogue(order=index+1, text=d_text, sound=d_sound, meaning=translation, participant=ParticipantEnum[speaker])
                        session.add(dialogue)

                    session.commit()


                    try:
                        logger.info("commiting session")
                        session.commit()
                    except IntegrityError as e:
                        session.rollback()  # Rollback in case of any error
                        logger.info("session error")

                yield worker_res.model_dump_json()
                break
            time.sleep(1)
    return EventSourceResponse(event_generator(task_id))
