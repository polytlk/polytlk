"""Has core LLM logic for polytlk application."""
from fastapi import FastAPI


def create_app() -> FastAPI:
    """Make fastAPI app for testing purposes."""
    app = FastAPI()

    from socrates.openai.router import router  # noqa: WPS433
    app.include_router(router)

    return app
