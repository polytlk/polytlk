TARGET_FOLDER="../polytlk-cd/development"

rm -rf $TARGET_FOLDER/socrates/*

helmfile template -e development -f helm/socrates/helmfile.yaml.gotmpl --output-dir ../../$TARGET_FOLDER --log-level=debug --output-dir-template "{{ .OutputDir }}/{{ .Release.Name}}"

mv $TARGET_FOLDER/socrates-deployment/deployment/templates/* $TARGET_FOLDER/socrates/
rm -rf $TARGET_FOLDER/socrates-deployment