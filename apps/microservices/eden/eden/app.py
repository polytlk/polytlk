"""Perform Chinese NLP tasks for polytlk."""
from fastapi import FastAPI
from opentelemetry.instrumentation.celery import CeleryInstrumentor
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor


def create_app() -> FastAPI:
    """Make fastAPI app for testing purposes."""
    app = FastAPI(
        servers=[
            {'url': 'http://eden-svc:7079', 'description': 'local environment'},
        ],
    )

    from eden.chinese.router import router  # noqa: WPS433
    app.include_router(router)

    CeleryInstrumentor().instrument()
    FastAPIInstrumentor.instrument_app(app)

    return app
