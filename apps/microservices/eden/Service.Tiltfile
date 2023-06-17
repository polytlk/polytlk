load('ext://nerdctl', 'nerdctl_build')

k8s_yaml('service.yaml')
k8s_resource('eden-svc', port_forwards=7079, labels=["chinese"])

nerdctl_build('eden-svc-img', '.',     
    live_update=[
        sync('.', '/code'),
        run('cd /code && poetry install --no-interaction --no-root --without dev',
            trigger=['./poetry.lock', './pyproject.toml']),
    ]
)
