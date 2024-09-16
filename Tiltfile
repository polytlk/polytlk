load('ext://uibutton', 'cmd_button', 'location', 'text_input')
load('ext://dotenv', 'dotenv')
load('ext://color', 'color')
load('ext://helm_remote', 'helm_remote')
load('ext://cert_manager', 'deploy_cert_manager')
load('ext://nerdctl', 'nerdctl_build')

deploy_cert_manager(version="v1.15.3")

# start Tilt with no enabled resources
config.clear_enabled_resources()

# Run a defined set of services
config.define_string_list("to-run", args=True)
cfg = config.parse()

# get the group to run. default to chinese if empty
language = cfg.get('to-run', [])

if len(language) == 0:
    language.append("chinese")
elif len(language) > 1:
    language = language[:1]


############ SETUP LOCAL MODES IN THIS BLOCK ###################################
dotenv()
print(color.yellow('----------------------------------------------------------------------------------------------------------------------------------------------'))
print(color.blue('TYK MODE: ') + '\t' + 'Community Edition'.upper())

LOCAL_MODE = os.environ.get('LOCAL_MODE', 'default').lower()
if LOCAL_MODE not in ['msw', 'expose_cluster']:
  LOCAL_MODE = 'default'

if language[0].lower() not in ['chinese', 'korean']:
  language[0] = 'chinese'

print(color.blue('LANGUAGE: ') + '\t' + language[0].upper())
print(color.blue('LOCAL MODE: ') + '\t' + LOCAL_MODE.upper())
print('')

if LOCAL_MODE == 'msw':
  print(color.blue('DESCRIPTION: ') + '\t' + 'optimized for frontend development. use frontend and mocks only. LANGUAGE param is inert')
elif LOCAL_MODE == 'expose_cluster':
  print(color.blue('DESCRIPTION: ') + '\t' + 'for testing changes on a real iOS device locally. use ngrok to expose cluster to public internet for your iOS device.')
else:
  print(color.blue('DESCRIPTION: ') + '\t' + 'default way of working. spins up requested backend services based on LANGUAGE, webpack dev server, and a verdaccio server.')
print(color.yellow('----------------------------------------------------------------------------------------------------------------------------------------------'))
#################################################################################


base = [
  'heimdall-svc',
  'heimdall-api',
  'socrates-svc',
  'opentelemetry-collector',
  'redis-master',
  'tyk-operator',
  'tyk-gateway',
  'postgresql',
  'flower',
  'ingress-nginx-controller',
  'ingress-nginx-admission-create',
  'ingress-nginx-admission-patch'
  # 'kube-prometheus-stack-kube-state-metrics',
  # 'kube-prometheus-stack-operator',
  # 'kube-prometheus-stack-admission-create',
  # 'kube-prometheus-stack-admission-patch',
  # 'kube-prometheus-stack-prometheus-node-exporter',
  # 'kube-prometheus-stack-grafana'
]

host = []

if LOCAL_MODE == 'expose_cluster':
  host = ['ngrok-tunnel', 'verdaccio']
else:
  host = ['web',]

final_base = base + host

# run a group like
# tilt up -- chinese
groups = {
  'chinese': ['eden-svc', 'eden-worker', 'eden-api'] + final_base,
  'korean': ['olivia-svc'] + final_base,
}

# if msw is enabled overwrite and only run FE stuff
if LOCAL_MODE == 'msw':
  groups = {
    'chinese': host,
    'korean': host,
  }

resources = []

for arg in language:
  if arg in groups:
    resources += groups[arg]
  else:
    # also support specifying individual services instead of groups, e.g. `tilt up a b d`
    resources.append(arg)

config.set_enabled_resources(resources)

## local_resource(
##   name='verdaccio',
##   serve_cmd='pnpm nx local-registry',
##   labels=['host_machine'],
##   links=link('http://localhost:4873', 'registry')
## )
## 
## cmd_button(name='publish-btn',
##           argv=['sh', '-c', 'pnpm nx run echo-plugin:publish -- --ver=$ver --tag=$tag'],
##           text='local publish',
##           location=location.NAV,
##           icon_name='waving_hand',
##           inputs=[
##               text_input('ver'),
##               text_input('tag'),
##           ]
## )

if LOCAL_MODE == 'expose_cluster':
  local_resource(name='ngrok-tunnel', serve_cmd='ngrok tunnel --region us --label edge=edghts_2RlZGb3gklIVXTQzHrY2GFYtjRu http://localhost:8080', labels=['host_machine'])
else:

## local_resource(
##   name='storybook',
##   serve_cmd='pnpm nx run web-client:storybook',
##   labels=['host_machine'],
##   links=link('http://localhost:4400/', 'storybook')
## )
    k8s_yaml('serve.yaml')

    k8s_resource(
      'web',
      labels=["web"]
    )

    nerdctl_build('web', '.',     
      live_update=[
        sync('./apps/web-client/', '/polytlk/apps/web-client/'),
      ]
    )



# do not load non front end dependencies if mode is msw
if not LOCAL_MODE == 'msw':
  # we only need redis chart for local dev
  helm_remote('redis',
              repo_name='bitnami',
              repo_url='https://charts.bitnami.com/bitnami',
              version="18.0.0",
              set=['auth.enabled=false']
  )

  helm_remote('postgresql',
              repo_name='bitnami',
              repo_url='https://charts.bitnami.com/bitnami',
              version="15.5.29",
              set=['auth.postgresPassword=helloworld']
  )

  helm_remote('ingress-nginx',
              repo_name='ingress-nginx',
              repo_url='https://kubernetes.github.io/ingress-nginx',
  )

  # helm_remote('kube-prometheus-stack',
  #             repo_name='prometheus-community',
  #             repo_url='https://prometheus-community.github.io/helm-charts'
  # )


  k8s_resource(
    workload='redis-master',
    labels=['data-storage'],
  )

  k8s_resource(
    workload='postgresql',
    labels=['data-storage'],
    port_forwards=5300
  )

  include('./tilt/otel-collector/Tiltfile')
  include('./tilt/tyk/Tiltfile')
  include('./tilt/tyk-operator/Tiltfile')

  include('./tilt/flower/Tiltfile')

  include('./apps/microservices/socrates/Tiltfile')
  include('./apps/microservices/eden/Tiltfile')
  include('./apps/microservices/olivia/Tiltfile')
  include('./apps/microservices/heimdall/Tiltfile')
  include('./apps/workers/eden/Tiltfile')
