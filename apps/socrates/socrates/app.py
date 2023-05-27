import openai
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import hanlp

load_dotenv()  # take environment variables from .env.
app = FastAPI()
openai.api_key = os.environ.get("OPENAI_API_KEY")

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

system_prompt = "You are a mandarin teacher. You will be given authentic mandarin text from real chinese people and you will break the text up into 4 lists: characters used, words used ,sentence patterns used, and overall meaning of the text). Each list should have the original chinese, pinyin, and correct meaning"


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
    d = HanLP([user_input])
    # print(d['tok/fine'])
    # print(d['dep'])
    # print(d['pos/ctb'])
    # print(d['con'])
    # d.pretty_print()
    return d['tok/fine']


def generate_response(user_input):
    response = openai.ChatCompletion.create(model="gpt-3.5-turbo", messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_input},
    ], temperature=0.2)

    lesson = response.choices[0].message.content
    return lesson


@app.post("/chatgpt/")
async def chatgpt_endpoint(user_query: UserQuery):
    # Segmentation
    # words = jieba.cut(user_query.user_input)
    # print("Segmentation:")
    # print("/".join(words))

    # POS tagging
    # words = pseg.cut(user_query.user_input)
    # print("\nPOS Tagging:")
    # for word, tag in words:
    #   print(f"{word}: {tag}")
    tokens = generate_tokens(user_query.user_input)

    #   response = generate_response(user_query.user_input)
    return {"response": tokens}
