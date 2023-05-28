FROM python:3.11-slim-bullseye

WORKDIR /code

RUN apt-get update && apt-get upgrade && pip install --upgrade pip 
RUN apt-get install curl build-essential gcc make pkg-config -y
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"
RUN apt-get install libssl-dev libffi-dev openssl -y
RUN pip install poetry 

COPY ./pyproject.toml ./poetry.lock* ./poetry.toml /code/

RUN poetry install --no-interaction --without dev

COPY ./eden /code/eden/

# building cryptography is cancer https://cryptography.io/en/latest/installation/#building-cryptography-on-linux
CMD ["poetry", "run", "start"]