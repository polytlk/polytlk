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
RUN poetry export -f requirements.txt --output requirements.txt --without-hashes \
 && python -m venv /code/venv \
 && source /code/venv/bin/activate \
 && python -m ensurepip --upgrade \
 && pip install -r /code/requirements.txt

# Download the NLP model
COPY ./eden/load_model.py /code/eden/load_model.py
RUN source /code/venv/bin/activate && python /code/eden/load_model.py

FROM python:3.11-slim-bullseye as final

WORKDIR /code

# Make sure we use the virtualenv:
ENV PATH="/code/venv/bin:$PATH"
# Force Hugging Face 🤗 Transformers to use cached models
ENV TRANSFORMERS_OFFLINE=1

COPY --from=build /root/.hanlp /root/.hanlp
COPY --from=build /code/venv /code/venv
COPY ./eden /code/eden/

CMD ["uvicorn", "eden.app:app", "--host", "0.0.0.0", "--port", "7079", "--reload"]