"""Perform Chinese NLP tasks for polytlk."""
from celery import Celery
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

from eden.celery_utils import create_celery

origins = [
    'http://localhost:4200',
]


class CustomFastAPI(FastAPI):
    """Include custom attrs for fastapi."""

    celery_app: Celery


def create_app() -> CustomFastAPI:
    """Make fastAPI app for testing purposes."""
    app = CustomFastAPI()

    app.celery_app = create_celery()

    from eden.chinese.router import router  # noqa: WPS433
    app.include_router(router)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=['*'],
        allow_headers=['*'],
    )

    FastAPIInstrumentor.instrument_app(app)

    return app
