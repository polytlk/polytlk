TARGET_FOLDER="../polytlk-cd/development/apps"

rm -rf $TARGET_FOLDER/web/*

helmfile template -e development -f helm/web/helmfile.yaml.gotmpl --output-dir ../../$TARGET_FOLDER --output-dir-template "{{ .OutputDir }}/{{ .Release.Name}}"

mv $TARGET_FOLDER/web-deployment/deployment/templates/* $TARGET_FOLDER/web/
rm -rf $TARGET_FOLDER/web-deployment

