FROM python:3.11-slim-bullseye

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

RUN poetry install --no-interaction --no-root --without dev

COPY ./eden /code/eden/

# building cryptography is cancer https://cryptography.io/en/latest/installation/#building-cryptography-on-linux
CMD ["poetry", "run", "start"]