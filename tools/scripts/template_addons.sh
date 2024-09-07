#!/bin/bash

# Define valid targets and environments
VALID_TARGETS=("cert-manager" "nginx-ingress" "external-secrets" "otel-collector" "tyk-operator" "tyk")
VALID_ENVIRONMENTS=("default" "development" "production")

# Check if TARGET and ENVIRONMENT are provided as arguments
if [ -z "$1" ]; then
  echo "Usage: $0 TARGET ENVIRONMENT"
  echo "Valid TARGET values are: ${VALID_TARGETS[*]}"
  echo "Valid ENVIRONMENT values are: ${VALID_ENVIRONMENTS[*]}"
  exit 1
fi

TARGET="$1"
ENVIRONMENT="${2:-default}"

# Validate TARGET
if [[ ! " ${VALID_TARGETS[*]} " =~ " ${TARGET} " ]]; then
  echo "Invalid TARGET: $TARGET"
  echo "Valid TARGET values are: ${VALID_TARGETS[*]}"
  exit 1
fi

# Validate ENVIRONMENT
if [[ ! " ${VALID_ENVIRONMENTS[*]} " =~ " ${ENVIRONMENT} " ]]; then
  echo "Invalid ENVIRONMENT: $ENVIRONMENT"
  echo "Valid ENVIRONMENT values are: ${VALID_ENVIRONMENTS[*]}"
  exit 1
fi

# Determine TARGET_FOLDER based on ENVIRONMENT
if [ "$ENVIRONMENT" == "default" ]; then
  TARGET_FOLDER="tilt/$TARGET"
else
  TARGET_FOLDER="../polytlk-cd/$ENVIRONMENT/addons/$TARGET"
fi

#### REMOVE FILES FROM BEFORE
rm -rf $TARGET_FOLDER/secret/*
rm -rf $TARGET_FOLDER/deps/*

# Run helmfile template
helmfile template -e $ENVIRONMENT -l type=secret -l type=deps -f "libs/helm/addons/$TARGET/helmfile.yaml.gotmpl" --output-dir "../../../../$TARGET_FOLDER" --output-dir-template "{{ .OutputDir }}/{{ .Release.Name }}"

if [ "$ENVIRONMENT" != "default" ]; then
  mv "$TARGET_FOLDER/$TARGET-secrets/secret/templates/"* "$TARGET_FOLDER/secret/"
  rm -rf "$TARGET_FOLDER/$TARGET-secrets"
fi

if [ "$TARGET" == "tyk" ]; then
  mv "$TARGET_FOLDER/$TARGET-deps/dependencies/templates/"* "$TARGET_FOLDER/deps/"
  rm -rf "$TARGET_FOLDER/$TARGET-deps"
fi

rm -rf $TARGET_FOLDER/values.yaml

# Generate values.yaml file using helmfile
helmfile write-values -e "$ENVIRONMENT" -l type=remote -f "libs/helm/addons/$TARGET/helmfile.yaml.gotmpl" --output-file-template "{{ .State.BaseName }}/values.yaml"

# Move and clean up
mv "./libs/helm/addons/$TARGET/helmfile.yaml/values.yaml" "$TARGET_FOLDER"
rm -rf ./libs/helm/addons/$TARGET/helmfile.yaml