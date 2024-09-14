from contextlib import asynccontextmanager

from fastapi import FastAPI
from sqlmodel import create_engine

from eden.config import settings

DB_URL = 'postgresql://postgres:{0}@{1}:{2}'.format(
    settings.db_password,
    settings.db_host,
    settings.db_port,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    engine = create_engine(DB_URL, echo=False)
    app.state.engine = engine  # Store the engine in app state for global access
    yield
