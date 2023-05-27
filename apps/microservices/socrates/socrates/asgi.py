import uvicorn


def start():
    """Launched with `poetry run start` at root level"""
    uvicorn.run("socrates.app:app", host="0.0.0.0", port=8079, reload=True)
