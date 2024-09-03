"""Perform Chinese NLP tasks for polytlk."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from opentelemetry.instrumentation.celery import CeleryInstrumentor
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor


def create_app() -> FastAPI:
    """Make fastAPI app for testing purposes."""
    app = FastAPI(
        servers=[
            {'url': 'http://eden-svc:7079', 'description': 'local environment'},
        ],
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            'https://dev.polytlk.io',
            'http://localhost:4200',
            'capacitor://localhost',
        ],
        allow_credentials=False,
        allow_methods=['GET', 'POST'],
        allow_headers=['*'],
    )

    from eden.chinese.router import router as chinese_router  # noqa: WPS433
    from eden.health_check import router as health_router  # noqa: WPS433
    app.include_router(chinese_router)
    app.include_router(health_router)

    CeleryInstrumentor().instrument()
    FastAPIInstrumentor.instrument_app(app)

    return app
