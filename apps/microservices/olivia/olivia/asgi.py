"""Enables hot reloading for the olivia microservice."""
import uvicorn

PORT = 6079


def start():
    """Launch Olivia microservice with `npx nx run olivia:serve` from root."""
    uvicorn.run('olivia.app:app', host='localhost', port=PORT, reload=True)
