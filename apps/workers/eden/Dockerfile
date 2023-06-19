FROM python:3.11-slim-bullseye as build

WORKDIR /code

ENV \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONFAULTHANDLER=1 \
    PATH="/root/.cargo/bin:${PATH}"

SHELL ["/bin/bash", "-c"]

# Install system packages needed for final image
RUN apt-get update && apt-get install -y --no-install-recommends \
    g++ \
    curl \
    libssl-dev \
    pkg-config \
 && rm -rf /var/lib/apt/lists/* \
 && curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y \
 && pip install poetry

# Copy dependency information
COPY ./pyproject.toml ./poetry.lock* ./poetry.toml /code/

# Install application dependencies
RUN poetry export -o requirements.txt --without-hashes \
 && echo 'watchfiles==0.19.0 ; python_version >= "3.11" and python_version < "4.0"' >> requirements.txt  \
 && python -m venv /code/venv \
 && source /code/venv/bin/activate \
 && python -m ensurepip --upgrade \
 && pip install -r /code/requirements.txt

# Download the NLP model
COPY ./eden/model /code/eden/model
RUN source /code/venv/bin/activate && python -m eden.model.load

# Move the 'hanlp' model to a new location
RUN mkdir /code/.hanlp && mv /root/.hanlp/* /code/.hanlp

FROM python:3.11-slim-bullseye as final

WORKDIR /code

# Create a non-root user and give it ownership of the /code directory
RUN adduser --disabled-password --gecos '' celeryuser \
 && chown -R celeryuser:celeryuser /code \
 && chmod -R 755 /code

# Switch to the non-root user
USER celeryuser

# Make sure we use the virtualenv:
ENV PATH="/code/venv/bin:$PATH"
# Force Hugging Face 🤗 Transformers to use cached models
ENV TRANSFORMERS_OFFLINE=0
# Update 'HANLP_HOME' environment variable to the new model location
ENV HANLP_HOME=/code/.hanlp

COPY --from=build /code/.hanlp /code/.hanlp
COPY --from=build /code/venv /code/venv
COPY ./eden /code/eden/

CMD ["watchfiles", "--filter", "python", "celery -A eden.main.celery worker --concurrency 1 --loglevel=info"]