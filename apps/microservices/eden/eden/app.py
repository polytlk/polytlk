from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import hanlp

app = FastAPI()

origins = [
    "http://localhost:4200",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class UserQuery(BaseModel):
    user_input: str


model = hanlp.pretrained.mtl.CLOSE_TOK_POS_NER_SRL_DEP_SDP_CON_ERNIE_GRAM_ZH   # type: ignore
HanLP = hanlp.load(model)


def generate_tokens(user_input):
    '''
    | Segementation (Tokenization)
    |   -> Divides the text into words or tokens
    |   -> key = 'tok/fine'
    |__________________________________________________________________________
    | Dependency parsing
    |   -> shows word-to-word grammatical relations
    |   -> key = 'dep'
    |   -> see more @ https://hanlp.hankcs.com/docs/annotations/dep/sd_zh.html
    |__________________________________________________________________________
    | Part-of-Speech (POS) Tagging
    |   -> key = 'pos/ctb'
    |   -> Assign part-of-speech tags to each word
    |__________________________________________________________________________
    | Constituency Parsing
    |   -> reveals phrase-level and sentence-level grammatical structure
    |   -> key = 'con'
    |   -> https://repository.upenn.edu/cgi/viewcontent.cgi?article=1040&context=ircs_reports
    '''
    print(user_input)
    d = HanLP([user_input])
    # print(d['tok/fine'])
    # print(d['dep'])
    # print(d['pos/ctb'])
    # print(d['con'])
    # d.pretty_print()
    d.pretty_print()
    return d['tok/fine']


@app.post("/chinese/")
async def chinese_endpoint(user_query: UserQuery):
    tokens = generate_tokens(user_query.user_input)

    return {"response": tokens}
