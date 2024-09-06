#!/bin/bash

# Define valid targets
VALID_TARGETS=("eden" "heimdall")

# Check if TARGET is provided as an argument
if [ -z "$1" ]; then
  echo "Usage: $0 TARGET"
  echo "Valid TARGET values are: ${VALID_TARGETS[*]}"
  exit 1
fi

TARGET="$1"
TARGET_FOLDER="../polytlk-cd/development/apps"

# Validate TARGET
if [[ ! " ${VALID_TARGETS[*]} " =~ " ${TARGET} " ]]; then
  echo "Invalid TARGET: $TARGET"
  echo "Valid TARGET values are: ${VALID_TARGETS[*]}"
  exit 1
fi

# Ensure target directories are clean
rm -rf "$TARGET_FOLDER/$TARGET/api/*"
rm -rf "$TARGET_FOLDER/$TARGET/deployment/*"
rm -rf "$TARGET_FOLDER/$TARGET/secret/*"

# Run helmfile template
helmfile template -e development -f "helm/$TARGET/helmfile.yaml.gotmpl" --output-dir "../../$TARGET_FOLDER" --output-dir-template "{{ .OutputDir }}/{{ .Release.Name }}"

# Move the generated files to the appropriate directories
mv "$TARGET_FOLDER/$TARGET-apis/api/templates/"* "$TARGET_FOLDER/$TARGET/api/"
mv "$TARGET_FOLDER/$TARGET-deployment/deployment/templates/"* "$TARGET_FOLDER/$TARGET/deployment/"
mv "$TARGET_FOLDER/$TARGET-secrets/secret/templates/"* "$TARGET_FOLDER/$TARGET/secret/"

# Clean up temporary directories
rm -rf "$TARGET_FOLDER/$TARGET-deployment"
rm -rf "$TARGET_FOLDER/$TARGET-apis"
rm -rf "$TARGET_FOLDER/$TARGET-secrets"