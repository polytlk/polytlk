TARGET_FOLDER="../polytlk-cd/development"

rm -rf $TARGET_FOLDER/eden/*

helmfile template -e development -f helm/eden/helmfile.yaml.gotmpl --output-dir ../../$TARGET_FOLDER --output-dir-template "{{ .OutputDir }}/{{ .Release.Name}}"

mv $TARGET_FOLDER/eden-apis/api/templates/* $TARGET_FOLDER/eden/
mv $TARGET_FOLDER/eden-deployment/deployment/templates/* $TARGET_FOLDER/eden/
rm -rf $TARGET_FOLDER/eden-deployment
rm -rf $TARGET_FOLDER/eden-apis
