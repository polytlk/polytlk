TARGET_FOLDER="../polytlk-cd/development"

rm -rf $TARGET_FOLDER/eden-worker/*

helmfile template -e development -f helm/eden-worker/helmfile.yaml.gotmpl --output-dir ../../$TARGET_FOLDER --output-dir-template "{{ .OutputDir }}/{{ .Release.Name}}"

mv $TARGET_FOLDER/eden-worker-deployment/deployment/templates/* $TARGET_FOLDER/eden-worker/
rm -rf $TARGET_FOLDER/eden-worker-deployment