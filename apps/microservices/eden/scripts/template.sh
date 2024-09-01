TARGET_FOLDER="apps/microservices/eden/tilt"

helmfile template -f helm/eden/helmfile.yaml.gotmpl --output-dir ../../$TARGET_FOLDER --output-dir-template "{{ .OutputDir }}/{{ .Release.Name}}"

mv $TARGET_FOLDER/eden-apis/api/templates/* $TARGET_FOLDER/api/
mv $TARGET_FOLDER/eden-deployment/deployment/templates/* $TARGET_FOLDER/deployment/
rm -rf $TARGET_FOLDER/eden-deployment
rm -rf $TARGET_FOLDER/eden-apis
