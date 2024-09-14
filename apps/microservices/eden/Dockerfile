FROM python:3.11-slim-bullseye AS build

WORKDIR /code

ENV \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONFAULTHANDLER=1

SHELL ["/bin/bash", "-c"]

RUN apt-get update \
    && apt-get -y install libpq-dev gcc

# Install system packages needed for final image
RUN pip install poetry

# Copy dependency information
COPY ./pyproject.toml ./poetry.lock* ./poetry.toml /code/

# Install application dependencies
RUN poetry export -f requirements.txt --output requirements.txt --without-hashes \
 && python -m venv /code/venv \
 && source /code/venv/bin/activate \
 && python -m ensurepip --upgrade \
 && pip install -r /code/requirements.txt

FROM python:3.11-slim-bullseye AS final

WORKDIR /code

# Make sure we use the virtualenv:
ENV PATH="/code/venv/bin:$PATH"

COPY --from=build /code/venv /code/venv
COPY ./eden /code/eden/
COPY ./scripts/entrypoint.sh /code

RUN apt-get update \
    && apt-get -y install libpq-dev gcc 

ENTRYPOINT ["/code/entrypoint.sh"]