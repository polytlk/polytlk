"""Perform Chinese NLP tasks for polytlk."""
from fastapi import FastAPI, Request
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

    @app.middleware('http')
    async def add_version_header(request: Request, call_next):
        print('request headers')
        print(request.headers)
        response = await call_next(request)
        print('response headers')
        print(response.headers)
        return response

    app.add_middleware(
        CORSMiddleware,
        allow_origins=['http://localhost:4200'],
        allow_credentials=False,
        allow_methods=['GET', 'POST'],
        allow_headers=['*'],
    )

    from eden.chinese.router import router  # noqa: WPS433
    app.include_router(router)

    CeleryInstrumentor().instrument()
    FastAPIInstrumentor.instrument_app(app)

    return app
