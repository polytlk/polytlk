#!/bin/bash

# Define valid targets and environments
VALID_TARGETS=("cert-manager" "nginx-ingress" "external-secrets" "opentelemetry" "argocd")
VALID_ENVIRONMENTS=("development" "production")

# Check if TARGET and ENVIRONMENT are provided as arguments
if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: $0 TARGET ENVIRONMENT"
  echo "Valid TARGET values are: ${VALID_TARGETS[*]}"
  echo "Valid ENVIRONMENT values are: ${VALID_ENVIRONMENTS[*]}"
  exit 1
fi

TARGET="$1"
ENVIRONMENT="$2"
TARGET_FOLDER="../polytlk-cd/$ENVIRONMENT/addons/$TARGET"

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

# Ensure the target folder exists and clean up
rm -rf "$TARGET_FOLDER"/*

# Generate values.yaml file using helmfile
helmfile write-values -e "$ENVIRONMENT" -f "helm/base/$TARGET/helmfile.yaml.gotmpl" --output-file-template "{{ .State.BaseName }}/values.yaml"

# Move and clean up
mv "./helm/base/$TARGET/helmfile.yaml/values.yaml" "$TARGET_FOLDER"
rm -rf "./helm/base/$TARGET/helmfile.yaml"
