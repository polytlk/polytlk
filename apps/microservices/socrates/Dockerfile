FROM python:3.11-alpine3.18

WORKDIR /code

RUN apk add --no-cache gcc libffi-dev musl-dev
RUN pip install poetry

COPY ./pyproject.toml ./poetry.lock* ./poetry.toml /code/

RUN poetry install --no-interaction --no-root --without dev

COPY ./socrates /code/socrates/

CMD ["poetry", "run", "start"]