#!/bin/bash

# Define valid targets
VALID_TARGETS=("eden" "heimdall" "eden-worker" "socrates" "web")
VALID_ENABLE_OPTIONS=("true" "false")
VALID_ENVIRONMENTS=("default" "development")

# Check if TARGET and ENABLE_APIS are provided as arguments
if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: $0 TARGET ENABLE_APIS"
  echo "Valid TARGET values are: ${VALID_TARGETS[*]}"
  echo "Valid ENABLE_APIS values are: ${VALID_ENABLE_OPTIONS[*]}"
  echo "Valid ENVIRONMENT values are: ${VALID_ENVIRONMENTS[*]}"
  exit 1
fi

TARGET="$1"
ENABLE_APIS="$2"
ENVIRONMENT="${3:-default}"  # Default to "default" if not provided

# Validate TARGET
if [[ ! " ${VALID_TARGETS[*]} " =~ " ${TARGET} " ]]; then
  echo "Invalid TARGET: $TARGET"
  echo "Valid TARGET values are: ${VALID_TARGETS[*]}"
  exit 1
fi

# Validate ENABLE_APIS
if [[ ! " ${VALID_ENABLE_OPTIONS[*]} " =~ " ${ENABLE_APIS} " ]]; then
  echo "Invalid ENABLE_APIS: $ENABLE_APIS"
  echo "Valid ENABLE_APIS values are: ${VALID_ENABLE_OPTIONS[*]}"
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
  TARGET_FOLDER="tilt"
else
  TARGET_FOLDER="../polytlk-cd/$ENVIRONMENT/apps"
fi


# Ensure target directories are clean
rm -rf "$TARGET_FOLDER/$TARGET/deployment/*"

if [ "$ENVIRONMENT" != "default" ]; then
  rm -rf "$TARGET_FOLDER/$TARGET/secret/*"
fi

if [ "$ENABLE_APIS" == "true" ]; then
  rm -rf "$TARGET_FOLDER/$TARGET/api/*"
fi

# Run helmfile template
helmfile template -e $ENVIRONMENT -f "libs/helm/apps/$TARGET/helmfile.yaml.gotmpl" --output-dir "../../../../$TARGET_FOLDER" --output-dir-template "{{ .OutputDir }}/{{ .Release.Name }}"

mv "$TARGET_FOLDER/$TARGET-deployment/deployment/templates/"* "$TARGET_FOLDER/$TARGET/deployment/"

rm -rf "$TARGET_FOLDER/$TARGET-deployment"

if [ "$ENVIRONMENT" != "default" ]; then
  mv "$TARGET_FOLDER/$TARGET-secrets/secret/templates/"* "$TARGET_FOLDER/$TARGET/secret/"
  rm -rf "$TARGET_FOLDER/$TARGET-secrets"
fi

if [ "$ENABLE_APIS" == "true" ]; then
  mv "$TARGET_FOLDER/$TARGET-apis/api/templates/"* "$TARGET_FOLDER/$TARGET/api/"
  rm -rf "$TARGET_FOLDER/$TARGET-apis"
fi

