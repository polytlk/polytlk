# how to quickly manual deploy to dev

## deploy base components first
helmfile apply -e development -f helm/base/helmfile.yaml

## deploy tyk-api-gateway second
helmfile apply -e development -f helm/tyk/helmfile.yaml.gotmpl

# how to reset dev env

## deploy tyk-api-gateway first
helmfile destroy -e development -f helm/tyk/helmfile.yaml.gotmpl

## destroy base components last
helmfile destroy -e development -f helm/base/helmfile.yaml


