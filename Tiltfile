include('./apps/microservices/socrates/Tiltfile')
include('./apps/microservices/eden/Tiltfile')
include('./apps/microservices/olivia/Tiltfile')

load('ext://nerdctl', 'nerdctl_build')

k8s_yaml('./apps/polytlk/kubernetes.yaml')
k8s_resource('polytlk-web', port_forwards=4200)

nerdctl_build('polytlk-web-img', '.',
    dockerfile='./base.dockerfile'
)




