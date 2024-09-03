TARGET_FOLDER="apps/microservices/socrates/tilt"

rm -rf $TARGET_FOLDER/deployment/*

helmfile template -f helm/socrates/helmfile.yaml.gotmpl --output-dir ../../$TARGET_FOLDER --output-dir-template "{{ .OutputDir }}/{{ .Release.Name}}"

mv $TARGET_FOLDER/socrates-deployment/deployment/templates/* $TARGET_FOLDER/deployment/
rm -rf $TARGET_FOLDER/socrates-deployment
