FROM python:3.11-slim-bullseye as build

WORKDIR /code

SHELL ["/bin/bash", "-c"]

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

FROM python:3.11-slim-bullseye as final

WORKDIR /code

# Make sure we use the virtualenv:
ENV PATH="/code/venv/bin:$PATH"

COPY --from=build /code/venv /code/venv

COPY ./olivia /code/olivia/

CMD ["uvicorn", "olivia.app:app", "--host", "0.0.0.0", "--port", "6079", "--reload"]



