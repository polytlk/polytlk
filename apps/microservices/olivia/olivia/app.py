"""Perform Korean NLP tasks for polytlk."""
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from konlpy.tag import Mecab
from pydantic import BaseModel

logging.config.fileConfig('logging.ini')
log = logging.getLogger('olivia')

app = FastAPI()
mecab = Mecab()

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


class KoreanQuery(BaseModel):
    """DTO for korean endpoint."""

    user_input: str  # should be valid korean text


def generate_tokens(user_input):
    """
    Process korean text into tokens and pos tags.

    The Sejong part-of-speech tagging system is used for POS
    Sejong POS comes from the Sejong Corpus.
    The Sejong Corpus is a large tagged corpus of Korean.
    It's one of the most important resources for Korean NLP.

    NNG: General Nouns
    NNP: Proper Nouns
    NNB: Bound Nouns
    NR: Numeral
    NP: Pronoun
    VV: Verbs
    VA: Adjectives
    VX: Auxiliary Verbs
    VCP: Copula (i.e., "be" verb)
    MM: Determiner
    MAG: Adverbs
    MAJ: Conjunction Adverb
    IC: Interjections
    JKS: Subject Marking Particles
    JKC: Complement Marking Particles
    JKG: Possession Marking Particles
    JKO: Object Marking Particles
    JKB: Adverbial Marking Particles
    JKV: Vocative Marking Particles
    JKQ: Quotation Marking Particles
    JX: Auxiliary Particles
    JC: Connecting Particles
    EP: Pre-final Endings
    EF: Final Endings
    EC: Connective Endings
    ETN: Nominalizing Endings
    ETM: Modifier Endings
    XPN: Prefix
    XPV: Suffix
    XSN: Noun Suffix
    XSV: Verb Suffix
    XSA: Adjective Suffix
    XR: Root
    SF: Sentence-final Ending Punctuation
    SP: Short Pause
    SS: Dashes, Ellipsis
    SE: Sentence-initial Punctuation
    SO: Other Symbols
    SL: Foreign Language
    SH: Chinese Characters
    SW: Korean Alphabet
    """
    log.info('User Input \t-> {0}'.format(user_input))

    tokens = mecab.morphs(user_input)
    log.info('Result \t-> {0}'.format(tokens))
    log.info('Result \t-> {0}'.format(mecab.pos(user_input)))

    return tokens


@app.post('/korean/')
async def korean_endpoint(user_query: KoreanQuery):
    """Do NLP preprocessing and other logic before calling socrates."""
    tokens = generate_tokens(user_query.user_input)

    return {'response': tokens}
