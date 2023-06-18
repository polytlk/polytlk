"""Perform Chinese NLP tasks for polytlk."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from opentelemetry.instrumentation.celery import CeleryInstrumentor
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

origins = [
    'http://localhost:4200',
]


def create_app() -> FastAPI:
    """Make fastAPI app for testing purposes."""
    app = FastAPI()

    from eden.chinese.router import router  # noqa: WPS433
    app.include_router(router)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=['*'],
        allow_headers=['*'],
    )

    CeleryInstrumentor().instrument()
    FastAPIInstrumentor.instrument_app(app)

    return app
