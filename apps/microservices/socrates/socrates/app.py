import openai
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os

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


system_prompt = "You are a mandarin teacher. You will be given authentic mandarin text from real chinese people and you will break the text up into 4 lists: characters used, words used ,sentence patterns used, and overall meaning of the text). Each list should have the original chinese, pinyin, and correct meaning"


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
    # tokens = generate_tokens(user_query.user_input)

    response = generate_response(user_query.user_input)
    return {"response": response}
