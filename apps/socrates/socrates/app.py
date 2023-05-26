from fastapi import FastAPI

# 1. Define an API object
app = FastAPI()


# 2. Map HTTP method and path to python function
@app.get("/")
async def root():
    return {"message": "Hello World. Welcome to the API home page!"}
