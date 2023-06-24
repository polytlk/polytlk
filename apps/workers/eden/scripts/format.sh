#!/bin/bash

echo "Formating ..."

FOLDER=workers/eden
FILES=$(echo "$@" | tr ',' '\n' | grep $FOLDER | grep -v '.json' | sed 's#apps/$FOLDER/##')

echo "Folder $FOLDER"
echo "FILES $FILES"

if [ -n "$FILES" ]; then
  poetry run autopep8 --in-place $FILES --verbose --exit-code
fi
