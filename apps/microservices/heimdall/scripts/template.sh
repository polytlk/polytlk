TARGET_FOLDER="apps/microservices/heimdall/tilt"

helmfile template -f helm/heimdall/helmfile.yaml --output-dir ../../$TARGET_FOLDER --output-dir-template "{{ .OutputDir }}/{{ .Release.Name}}"

mv $TARGET_FOLDER/heimdall-apis/api/templates/* $TARGET_FOLDER/api/
mv $TARGET_FOLDER/heimdall-deployment/deployment/templates/* $TARGET_FOLDER/deployment/
rm -rf $TARGET_FOLDER/heimdall-deployment
rm -rf $TARGET_FOLDER/heimdall-apis
