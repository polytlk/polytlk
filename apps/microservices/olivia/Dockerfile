FROM python:3.11-slim-bullseye as build

WORKDIR /code

SHELL ["/bin/bash", "-c"]

# Install system packages needed for final image
RUN apt-get update && apt-get install -y --no-install-recommends \
    g++ \
    curl \
    automake \
    make \
    git \
    mecab \
 && rm -rf /var/lib/apt/lists/* \
 && pip install poetry

# install_mecab_ko(){ SEE MORE HERE https://raw.githubusercontent.com/konlpy/konlpy/master/scripts/mecab.sh
RUN cd /tmp \
 && curl -LO https://bitbucket.org/eunjeon/mecab-ko/downloads/mecab-0.996-ko-0.9.2.tar.gz \
 && tar zxfv mecab-0.996-ko-0.9.2.tar.gz \
 && cd mecab-0.996-ko-0.9.2 \
 && ./configure --build=aarch64-unknown-linux-gnu \
 && make \
 && make check \
 && $sudo make install

# install_mecab_ko_dict(){ SEE MORE HERE https://raw.githubusercontent.com/konlpy/konlpy/master/scripts/mecab.sh
RUN echo "Install mecab-ko-dic" \
 && cd /tmp \
 && curl -LO https://bitbucket.org/eunjeon/mecab-ko-dic/downloads/mecab-ko-dic-2.1.1-20180720.tar.gz\
 && tar -zxvf mecab-ko-dic-2.1.1-20180720.tar.gz \
 && cd mecab-ko-dic-2.1.1-20180720 \
 && ./autogen.sh \ 
 && ./configure --build=aarch64-unknown-linux-gnu \
 && mecab-config --libs-only-L | $sudo tee /etc/ld.so.conf.d/mecab.conf \
 && $sudo ldconfig \
 && make \
 && $sudo sh -c 'echo "dicdir=/usr/local/lib/mecab/dic/mecab-ko-dic" > /usr/local/etc/mecabrc' \
 && $sudo make install

# install_mecab_ko_dict(){ SEE MORE HERE https://raw.githubusercontent.com/konlpy/konlpy/master/scripts/mecab.sh
RUN pushd /tmp \
 && git clone https://bitbucket.org/eunjeon/mecab-python-0.996.git \
 && popd \
 && python -m pip install --user /tmp/mecab-python-0.996
  
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
COPY --from=build /usr/local/lib/mecab/dic/mecab-ko-dic /usr/local/lib/mecab/dic/mecab-ko-dic

COPY ./olivia /code/olivia/
COPY ./logging.ini /code/

RUN apt-get update && apt-get install -y --no-install-recommends \
    mecab \
 && rm -rf /var/lib/apt/lists/*

CMD ["uvicorn", "olivia.app:app", "--host", "0.0.0.0", "--port", "6079", "--reload"]



