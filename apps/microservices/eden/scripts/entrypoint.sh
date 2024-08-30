#!/bin/sh

# Default ENVIRONMENT to 'local' if not set
: "${ENVIRONMENT:=local}"

# Check if the environment is 'local' and set the appropriate command
if [ "$ENVIRONMENT" = "local" ]; then
    exec uvicorn eden.main:app --host 0.0.0.0 --port 7079 --reload
else
    exec uvicorn eden.main:app --host 0.0.0.0 --port 7079
fi
