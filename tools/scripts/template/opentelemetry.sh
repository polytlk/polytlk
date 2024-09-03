TARGET_FOLDER="tilt/opentelemetry"

rm -rf $TARGET_FOLDER/collector/*

helmfile template -f helm/base/opentelemetry/helmfile.yaml --output-dir ../../../$TARGET_FOLDER --output-dir-template "{{ .OutputDir }}/{{ .Release.Name}}"

mv $TARGET_FOLDER/opentelemetry-collector/opentelemetry-collector/templates/* $TARGET_FOLDER/collector/

rm -rf $TARGET_FOLDER/opentelemetry-collector