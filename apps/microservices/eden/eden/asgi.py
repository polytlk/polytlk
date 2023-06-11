"""Enables hot reloading for the eden microservice."""
import uvicorn

PORT = 7079


def start() -> None:
    """Launch Eden microservice with `npx nx run eden:serve` from root level."""
    uvicorn.run('eden.app:app', host='localhost', port=PORT, reload=True)
