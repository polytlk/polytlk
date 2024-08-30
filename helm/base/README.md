manual deploy base components to development

helmfile apply -e development -f helm/base/helmfile.yaml

# see prometheus
kubectl port-forward svc/prometheus-operated 9090:9090
# see graphana
kubectl port-forward svc/prometheus-operated 3000:3000