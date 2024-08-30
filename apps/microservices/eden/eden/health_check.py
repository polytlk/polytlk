"""Healthcheck probe routes for robust scaling."""
from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

router = APIRouter()


@router.get('/healthz', status_code=status.HTTP_200_OK)
async def health_check():
    """Liveness probe endpoint to check if the application is running."""
    return JSONResponse(status_code=status.HTTP_200_OK, content={'status': 'healthy'})


@router.get('/readiness', status_code=status.HTTP_200_OK)
async def readiness_check():
    """Readiness probe endpoint to check if the application is ready to serve traffic."""
    # Include logic to check if dependencies are ready, e.g., database, cache, etc.
    is_ready = True  # Replace with actual readiness check logic
    if is_ready:
        return JSONResponse(status_code=status.HTTP_200_OK, content={'status': 'ready'})

    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={'status': 'not ready'},
    )
