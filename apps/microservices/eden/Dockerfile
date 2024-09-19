FROM python:3.11-slim-bullseye AS build

WORKDIR /code

ENV \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONFAULTHANDLER=1 \
    POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_IN_PROJECT=1 \
    POETRY_VIRTUALENVS_CREATE=true \
    POETRY_CACHE_DIR=/tmp/poetry_cache

SHELL ["/bin/bash", "-c"]

RUN apt-get update \
    && apt-get -y install libpq-dev gcc

# Install system packages needed for final image
RUN pip install poetry

# Copy dependency information
COPY ./pyproject.toml ./poetry.lock* ./poetry.toml /code/

# Install application dependencies
RUN pip3 install poetry==1.8.3 && poetry install --only main --no-root --no-directory

COPY ./eden /code/eden/

RUN poetry install

FROM python:3.11-slim-bullseye AS final

WORKDIR /code

# Make sure we use the virtualenv:
ENV PATH="/code/venv/bin:$PATH"

COPY --from=build /code/.venv /code/.venv
COPY ./eden /code/eden/
COPY ./scripts/entrypoint.sh /code

RUN apt-get update \
    && apt-get -y install libpq-dev gcc 

ENTRYPOINT [ "/code/.venv/bin/uvicorn", "eden.main:app", "--host", "0.0.0.0", "--port", "7079", "--reload"]