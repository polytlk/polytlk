"""Has core LLM logic for polytlk application."""
from fastapi import FastAPI
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor


def create_app() -> FastAPI:
    """Make fastAPI app for testing purposes."""
    app = FastAPI()

    from socrates.health_check import router as health_router  # noqa: WPS433
    from socrates.openai.router import router as ai_router  # noqa: WPS433
    app.include_router(ai_router)
    app.include_router(health_router)

    FastAPIInstrumentor.instrument_app(app)

    return app
