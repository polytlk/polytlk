#!/bin/bash

echo "Checking ..."

while getopts ":f:c:" opt; do
  case $opt in
    f)
      files=$OPTARG
      ;;
    c)
      command=$OPTARG
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      exit 1
      ;;
  esac
done

echo "args files $files"
echo "args command $command"

FOLDER="microservices/socrates"
FILES=$(echo $files | tr ',' '\n' | grep $FOLDER | grep -v '.json' | sed "s#apps/$FOLDER/##")

echo "Folder $FOLDER"
echo "FILES $FILES"

if [ -n "$FILES" ]; then
  if [ "$command" == "format" ]; then
    poetry run autopep8 --in-place $FILES --verbose --exit-code
  fi
    if [ "$command" == "lint" ]; then
    poetry run flake8 $FILES
  fi
fi
