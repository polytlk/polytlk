# `python-base` sets up all our shared environment variables
FROM python:3.12.0-slim AS python-base

    # python
ENV PYTHONUNBUFFERED=1 \
    # prevents python creating .pyc files
    PYTHONDONTWRITEBYTECODE=1 \
    \
    # pip
    PIP_NO_CACHE_DIR=off \
    PIP_DISABLE_PIP_VERSION_CHECK=on \
    PIP_DEFAULT_TIMEOUT=100 \
    \
    # poetry
    # https://python-poetry.org/docs/configuration/#using-environment-variables
    POETRY_VERSION=1.8.3 \
    # make poetry install to this location
    POETRY_HOME="/opt/poetry" \
    # make poetry create the virtual environment in the project's root
    # it gets named `.venv`
    POETRY_VIRTUALENVS_IN_PROJECT=true \
    # do not ask any interactive question
    POETRY_NO_INTERACTION=1 \
    \
    # paths
    # this is where our requirements + virtual environment will live
    PYSETUP_PATH="/opt/pysetup" \
    VENV_PATH="/opt/pysetup/.venv"

# prepend poetry and venv to path
ENV PATH="$POETRY_HOME/bin:$VENV_PATH/bin:$PATH"

FROM python-base AS builder-base
RUN apt-get update \
    && apt-get install --no-install-recommends -y \
        # deps for installing poetry
        curl

RUN curl -sSL https://install.python-poetry.org/ | python

WORKDIR $PYSETUP_PATH
COPY poetry.lock pyproject.toml ./

RUN poetry install --only main --no-root --no-directory

FROM python-base AS development
WORKDIR $PYSETUP_PATH

COPY --from=builder-base $PYSETUP_PATH $PYSETUP_PATH

COPY ./socrates /app/socrates

# will become mountpoint of our code
WORKDIR /app

CMD ["uvicorn", "socrates.main:app", "--host", "0.0.0.0", "--port", "8079", "--reload"]

FROM python-base AS production
WORKDIR $PYSETUP_PATH

COPY --from=builder-base $PYSETUP_PATH $PYSETUP_PATH

COPY ./socrates /app/socrates

# will become mountpoint of our code
WORKDIR /app

CMD ["uvicorn", "socrates.main:app", "--host", "0.0.0.0", "--port", "8079"]