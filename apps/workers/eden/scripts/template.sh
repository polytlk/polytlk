TARGET_FOLDER="apps/workers/eden/tilt"

rm -rf $TARGET_FOLDER/deployment/*

helmfile template -f helm/eden-worker/helmfile.yaml.gotmpl --output-dir ../../$TARGET_FOLDER --output-dir-template "{{ .OutputDir }}/{{ .Release.Name}}"

mv $TARGET_FOLDER/eden-worker-deployment/deployment/templates/* $TARGET_FOLDER/deployment/
rm -rf $TARGET_FOLDER/eden-worker-deployment
