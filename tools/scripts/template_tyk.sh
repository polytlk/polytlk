TARGET_FOLDER="tilt/tyk"

helmfile template -f helm/base/tyk/helmfile.yaml --include-crds --output-dir ../../../$TARGET_FOLDER --output-dir-template "{{ .OutputDir }}/{{ .Release.Name}}"

mv $TARGET_FOLDER/tyk-deps/dependencies/templates/* $TARGET_FOLDER/dependencies/
mv $TARGET_FOLDER/tyk-headless/tyk-headless/templates/* $TARGET_FOLDER/gateway/
mv $TARGET_FOLDER/tyk-operator/tyk-operator/templates/* $TARGET_FOLDER/operator/deployment
mv $TARGET_FOLDER/tyk-operator/tyk-operator/crds/* $TARGET_FOLDER/operator/crds

rm -rf $TARGET_FOLDER/tyk-deps
rm -rf $TARGET_FOLDER/tyk-headless
rm -rf $TARGET_FOLDER/tyk-operator