"""Perform Chinese NLP tasks for polytlk."""
import logging

import hanlp
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

log = logging.getLogger('eden')

app = FastAPI()

origins = [
    'http://localhost:4200',
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


class UserQuery(BaseModel):
    """DTO for chinese endpoint."""

    user_input: str


model = hanlp.pretrained.mtl.CLOSE_TOK_POS_NER_SRL_DEP_SDP_CON_ERNIE_GRAM_ZH   # type: ignore
HanLP = hanlp.load(model)


def generate_tokens(user_input):
    """
    Process chinese text into tokens and pos tags.

    Segementation (Tokenization)
        -> Divides the text into words or tokens
        -> key = 'tok/fine'

    Dependency parsing
        -> shows word-to-word grammatical relations
        -> key = 'dep'
        -> see more @ https://hanlp.hankcs.com/docs/annotations/dep/sd_zh.html

    Part-of-Speech (POS) Tagging
        -> key = 'pos/ctb'
        -> Assign part-of-speech tags to each word

    Constituency Parsing
        -> reveals phrase-level and sentence-level grammatical structure
        -> key = 'con'
        -> https://repository.upenn.edu/cgi/viewcontent.cgi?article=1040&context=ircs_reports
    """
    log.info('User Input -> {0}'.format(user_input))
    doc = HanLP([user_input])

    doc.pretty_print()
    return doc['tok/fine']


@app.post('/chinese/')
async def chinese_endpoint(user_query: UserQuery):
    """Do NLP preprocessing and other logic before calling socrates."""
    tokens = generate_tokens(user_query.user_input)

    return {'response': tokens}
