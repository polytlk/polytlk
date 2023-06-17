load('ext://nerdctl', 'nerdctl_build')

k8s_yaml('worker.yaml')
k8s_resource('eden-worker', labels=["chinese"])

nerdctl_build('eden-worker-img', '.',     
    live_update=[
        sync('.', '/code'),
        run('cd /code && poetry install --no-interaction --no-root --without dev',
            trigger=['./poetry.lock', './pyproject.toml']),
    ]
)
