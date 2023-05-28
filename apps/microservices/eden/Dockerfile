FROM python:3.11-slim-bullseye as build

WORKDIR /code

ENV \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONFAULTHANDLER=1 \
    PATH="/root/.cargo/bin:${PATH}"

RUN apt-get update && apt-get install -y --no-install-recommends \
    g++ \
    curl \
    libssl-dev \
    pkg-config \
 && rm -rf /var/lib/apt/lists/* \
 && curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y \
 && pip install poetry

COPY ./pyproject.toml ./poetry.lock* ./poetry.toml /code/

# RUN poetry install --no-interaction --no-root --without dev
RUN poetry export -f requirements.txt --output requirements.txt --without-hashes

RUN python -m venv /code/venv
RUN . /code/venv/bin/activate && \
    python -m ensurepip --upgrade && \
    python -m pip install -r /code/requirements.txt

FROM python:3.11-slim-bullseye as final

WORKDIR /code

# Make sure we use the virtualenv:
ENV PATH="/code/venv/bin:$PATH"

COPY --from=build /code/venv /code/venv
COPY ./eden /code/eden/

# building cryptography is cancer https://cryptography.io/en/latest/installation/#building-cryptography-on-linux
CMD ["uvicorn", "eden.app:app", "--host", "0.0.0.0", "--port", "7079", "--reload"]