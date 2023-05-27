import uvicorn


def start():
    """Launched with `poetry run start` at root level"""
    uvicorn.run("eden.app:app", host="0.0.0.0", port=7079, reload=True)