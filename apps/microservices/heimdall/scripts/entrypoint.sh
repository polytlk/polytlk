#!/bin/sh

# Default ENVIRONMENT to 'local' if not set
: "${ENVIRONMENT:=local}"

# Check if the environment is 'local' and set the appropriate command
if [ "$ENVIRONMENT" = "local" ]; then
    exec uvicorn heimdall.asgi:application --host 0.0.0.0 --port 8000 --reload
else
    exec uvicorn heimdall.asgi:application --host 0.0.0.0 --port 8000
fi
