"""Handles validation and task generation for chinese."""
import json
import logging
import time
import jwt
from typing import Any, AsyncGenerator, Annotated, Dict

from fastapi import APIRouter, Request, status, Header
from fastapi.responses import JSONResponse
from redis import Redis
from sqlmodel import Session, select
from sse_starlette.sse import EventSourceResponse

from eden.celery_utils import create_celery
from eden.chinese.schemas import ChineseQuery, ChineseTask, Message
from eden.config import settings
from eden.models.crud import (get_or_create_link, get_or_create_meaning,
                              get_or_create_unit, get_or_create_query_unit_meaning)
from eden.models.models import Dialogue, ParticipantEnum, Query, QueryUnitMeaning
from eden.models.validators import WorkerReponse, LanguageData
from eden.tracing import tracer  # noqa: I001
from eden.utils.validation import is_zh

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

celery_app = create_celery()
redis_db = Redis.from_url(url=settings.celery_broker_url)

@router.get('/queries')
async def chinese_endpoint(Authorization: Annotated[str | None, Header()], request: Request) -> Any:
    token = Authorization.split()[1]
    decoded_token = jwt.decode(token, options={"verify_signature": False})
    user_id = decoded_token["sub"]

    queries_dict: Dict[int, LanguageData] = {}

    engine = request.app.state.engine
    with Session(engine) as session:
        statement = select(Query).where(Query.user_id == user_id)
        results = session.exec(statement).all()

        for query in results:
            q_statement = select(QueryUnitMeaning).where(QueryUnitMeaning.query_id == query.id)
            qum_results = session.exec(q_statement).all()

            words = [
                (qum.unit_meaning.unit.text, qum.unit_meaning.sound, qum.unit_meaning.meaning.text)
                for qum in qum_results
            ]

            dialogue = [(dialogue.text, dialogue.sound, dialogue.meaning) for dialogue in query.dialogues]

            language_data = LanguageData(
                words=words,
                meaning=query.meaning,
                dialogue=dialogue
            )

            queries_dict[query.id] = language_data.model_dump()

    return JSONResponse(
        content=queries_dict
    )



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
    bearer_token = request.headers["authorization"]
    token = bearer_token.split()[1]
    decoded_token = jwt.decode(token, options={"verify_signature": False})
    user_id = decoded_token["sub"]

    async def event_generator(tid: str) -> AsyncGenerator[WorkerReponse, None]:
        while True:
            task_result = redis_db.get(tid)

            if task_result is not None:
                data_dict = json.loads(task_result.decode('utf-8'))
                worker_res = WorkerReponse(**data_dict)

                logger.info(worker_res.ari_data)

                engine = request.app.state.engine
                with Session(engine) as session:
                    logger.info("start db session")

                    query = Query(text=worker_res.user_input, user_id=user_id, meaning=worker_res.ari_data.meaning)
                    session.add(query)
                    session.commit()

                    for word_meaning in worker_res.ari_data.words:
                        logger.info("\t word meaning -> {0}".format(word_meaning))
                        unit_text = word_meaning[0]
                        sound = word_meaning[1]
                        meaning_text = word_meaning[2]

                        unit = get_or_create_unit(session, unit_text)
                        meaning = get_or_create_meaning(session, meaning_text)
                        link = get_or_create_link(session, unit.id, meaning.id, sound)
                        

                        logger.info("\t the unit {0} sounds like {1} and means {2}".format(link.unit.text, link.sound, link.meaning.text))

                        qum = get_or_create_query_unit_meaning(session, query.id, unit.id, meaning.id)
                        logger.info("\t FROM qum -> the unit {0} sounds like {1} and means {2}".format(qum.unit_meaning.unit.text, qum.unit_meaning.sound, qum.unit_meaning.meaning.text))

                    for index, (d_text, d_sound, translation) in enumerate(worker_res.ari_data.dialogue):
                        if index % 2 == 0:
                            speaker = "A"  # Even index -> Speaker A
                        else:
                            speaker = "B"  # Odd index -> Speaker B

                        logger.info(f"Person {speaker}: {d_text} ({d_sound}) -> {translation}")

                        dialogue = Dialogue(order=index+1, text=d_text, sound=d_sound, meaning=translation, participant=ParticipantEnum[speaker], query_id=query.id)
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
