TARGET_FOLDER="tilt/tyk"

rm -rf $TARGET_FOLDER/dependencies/*
rm -rf $TARGET_FOLDER/gateway/*
rm -rf $TARGET_FOLDER/operator/deployment/*
rm -rf $TARGET_FOLDER/operator/crds/*

helmfile template -f helm/tyk/helmfile.yaml.gotmpl --include-crds --output-dir ../../$TARGET_FOLDER --output-dir-template "{{ .OutputDir }}/{{ .Release.Name}}"

mv $TARGET_FOLDER/tyk-deps/dependencies/templates/* $TARGET_FOLDER/dependencies/
mv $TARGET_FOLDER/tyk-headless/tyk-oss/charts/tyk-gateway/templates/* $TARGET_FOLDER/gateway/
mv $TARGET_FOLDER/tyk-operator/tyk-operator/templates/* $TARGET_FOLDER/operator/deployment
mv $TARGET_FOLDER/tyk-operator/tyk-operator/crds/* $TARGET_FOLDER/operator/crds

rm -rf $TARGET_FOLDER/tyk-deps
rm -rf $TARGET_FOLDER/tyk-headless
rm -rf $TARGET_FOLDER/tyk-operator