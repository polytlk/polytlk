load('ext://nerdctl', 'nerdctl_build')
load('ext://helm_remote', 'helm_remote')

# start Tilt with no enabled resources
config.clear_enabled_resources()

# Run a defined set of services
config.define_string_list("to-run", args=True)
cfg = config.parse()

base = [
  'socrates-svc',
  'opentelemetry-collector',
  'redis-master',
  'tyk-helm',
  'tyk-headless',
  'tyk-operator'
]

# run a group like
# tilt up -- chinese
groups = {
  'chinese': ['eden-svc', 'eden-worker', 'eden-api'] + base,
  'korean': ['olivia-svc'] + base,
}

resources = []
for arg in cfg.get('to-run', []):
  if arg in groups:
    resources += groups[arg]
  else:
    # also support specifying individual services instead of groups, e.g. `tilt up a b d`
    resources.append(arg)

config.set_enabled_resources(resources)

include('./apps/microservices/socrates/Tiltfile')
include('./apps/microservices/eden/Tiltfile')
include('./apps/microservices/olivia/Tiltfile')

include('./apps/workers/eden/Tiltfile')

helm_remote('opentelemetry-collector',
            repo_name='open-telemetry',
            repo_url='https://open-telemetry.github.io/opentelemetry-helm-charts',
            values=['otel-collector-config.yaml']
)

helm_remote('redis',
            repo_name='bitnami',
            repo_url='https://charts.bitnami.com/bitnami',
            values=['redis.yaml']
)

include('./k8s/tyk/Tiltfile')