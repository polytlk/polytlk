#!/bin/sh

# Default ENVIRONMENT to 'local' if not set
: "${ENVIRONMENT:=local}"

# Check if the environment is 'local' and set the appropriate command
if [ "$ENVIRONMENT" = "local" ]; then
    exec watchfiles --filter python "celery -A eden.main.celery worker --concurrency 1 --loglevel=info"
else
    exec celery -A eden.main.celery worker --concurrency 1 --loglevel=info
fi
