"""Enables hot reloading for the socrates microservice."""
import uvicorn

PORT = 8079


def start():
    """Launch Socrates microservice with `npx nx run socrates:serve` at root level."""
    uvicorn.run('socrates.app:app', host='localhost', port=PORT, reload=True)
