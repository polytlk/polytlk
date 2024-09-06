# How to bootstrap a new cluster

## create a cluster
Using terraform and desired cloud provider spin up a new cluster instance

## get new kubeconfig
Depending on the provider configure your local kubectl to authenticate to the new cluster

## install argocd
helmfile apply -f ./helm/base/argocd/helmfile.yaml.gotmpl

## expose new server locally
kubectl port-forward service/argocd-server -n argocd 8080:443  

## get initial password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d; echo

## login with argocd cli
argocd login localhost:8080 --username=admin --password=<password> --insecure

## setup the private repo
go to localhost:8080 in your browser. login with the same credentials as the last step. go into the settings and configure a repository with a valid ssh key