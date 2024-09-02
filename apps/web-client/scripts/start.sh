#!/bin/sh

echo "PRINTING WORKING DIRECTORY"
pwd

# Inject environment variables to index.html
./app/import-meta-env-alpine -x ./app/.env.example -p /usr/share/nginx/html/index.html || exit 1

nginx -g "daemon off;"