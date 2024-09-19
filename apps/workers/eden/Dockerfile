FROM python:3.11-slim-bullseye AS build

WORKDIR /code

ENV \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONFAULTHANDLER=1 \
    RUSTFLAGS="-A invalid_reference_casting" \
    PATH="/root/.cargo/bin:${PATH}" \
    POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_IN_PROJECT=1 \
    POETRY_VIRTUALENVS_CREATE=true \
    POETRY_CACHE_DIR=/tmp/poetry_cache

SHELL ["/bin/bash", "-c"]

# Install system packages needed for final image
RUN apt-get update && apt-get install -y --no-install-recommends \
    g++ \
    curl \
    libssl-dev \
    pkg-config \
 && rm -rf /var/lib/apt/lists/* \
 && curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y 

# Copy dependency information
COPY ./pyproject.toml ./poetry.lock* ./poetry.toml /code/

# Install application dependencies
RUN pip3 install poetry==1.8.3 && poetry install --only main --no-root --no-directory

COPY ./eden /code/eden/

RUN poetry install

# Download the NLP model
COPY ./eden/model /code/eden/model
RUN poetry run python -m eden.model.load

# Move the 'hanlp' model to a new location
RUN mkdir /code/.hanlp && mv /root/.hanlp/* /code/.hanlp

FROM python:3.11-slim-bullseye AS final

WORKDIR /code

# Create a non-root user and give it ownership of the /code directory
RUN adduser --disabled-password --gecos '' celeryuser \
 && chown -R celeryuser:celeryuser /code \
 && chmod -R 755 /code

# Switch to the non-root user
USER celeryuser

# Make sure we use the virtualenv:
ENV PATH="/code/.venv/bin:$PATH"
# Force Hugging Face 🤗 Transformers to use cached models
ENV TRANSFORMERS_OFFLINE=0
# Update 'HANLP_HOME' environment variable to the new model location
ENV HANLP_HOME=/code/.hanlp

COPY --from=build /code/.hanlp /code/.hanlp
COPY --from=build /code/.venv /code/.venv

# Switch back to root to change file ownership
USER root

COPY ./eden /code/eden/
COPY ./scripts/entrypoint.sh /code
RUN chown -R celeryuser:celeryuser /code/eden

# Switch to celeryuser
USER celeryuser

ENTRYPOINT ["/code/entrypoint.sh"]