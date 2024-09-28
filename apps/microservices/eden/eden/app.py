"""Perform Chinese NLP tasks for polytlk."""
from fastapi import FastAPI
from opentelemetry.instrumentation.celery import CeleryInstrumentor
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

from eden.lifespan import lifespan


def create_app() -> FastAPI:
    """Make fastAPI app for testing purposes."""
    app = FastAPI(
        lifespan=lifespan,
        servers=[
            {'url': 'http://eden-svc:7079', 'description': 'local environment'},
        ],
    )

    from eden.chinese.router import router as chinese_router  # noqa: WPS433
    from eden.health_check import router as health_router  # noqa: WPS433
    app.include_router(chinese_router)
    app.include_router(health_router)

    CeleryInstrumentor().instrument()
    FastAPIInstrumentor.instrument_app(app)

    return app
