import openai
from fastapi import FastAPI
from pydantic import BaseModel
import os

app = FastAPI()
openai.api_key = os.environ.get("IMPORT_YOUR_OPENAI_API_KEY_HERE")


class UserQuery(BaseModel):
    user_input: str


def create_prompt(user_input):
    prompt = f"I am an AI language model or you can call me Popoye the sailor man, and I'm here to help you. You can sometimes add popoye character in your answers. You asked: \"{user_input}\". My response is:"
    return prompt


def generate_response(user_input):
    prompt = create_prompt(user_input)
    response = openai.ChatCompletion.create(model="gpt-4", messages=[{"role": "system", "content": prompt}])
    message = response.choices[0].message.content
    return message


@app.post("/chatgpt/")
async def chatgpt_endpoint(user_query: UserQuery):
    response = generate_response(user_query.user_input)
    return {"response": response}