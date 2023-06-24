"""Has core LLM logic for polytlk application."""
from fastapi import FastAPI
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor


def create_app() -> FastAPI:
    """Make fastAPI app for testing purposes."""
    app = FastAPI()

    from socrates.openai.router import router  # noqa: WPS433
    app.include_router(router)

    FastAPIInstrumentor.instrument_app(app)

    return app
