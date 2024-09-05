TARGET_FOLDER="../polytlk-cd/development/apps"

rm -rf $TARGET_FOLDER/heimdall/*

helmfile template -e development -f helm/heimdall/helmfile.yaml.gotmpl --output-dir ../../$TARGET_FOLDER --output-dir-template "{{ .OutputDir }}/{{ .Release.Name}}"

mv $TARGET_FOLDER/heimdall-apis/api/templates/* $TARGET_FOLDER/heimdall/
mv $TARGET_FOLDER/heimdall-deployment/deployment/templates/* $TARGET_FOLDER/heimdall/
rm -rf $TARGET_FOLDER/heimdall-deployment
rm -rf $TARGET_FOLDER/heimdall-apis
