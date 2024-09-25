# Tools and dependencies for running and managing polytlk locally

## Tools
Required for local cluster development

- [Podman](https://podman.io/) creates VM to host cluster and builder of local images
- [Kind](https://kind.sigs.k8s.io/) Kubernetes distrubution designed for local dev
- [Tilt](https://tilt.dev/) automates builds and deploys to local cluster
- [Helm](https://helm.sh/) The package manager for Kubernetes
- [Doppler](https://docs.doppler.com/docs/install-cli) Secret Management
- [asdf](https://asdf-vm.com/#/core-manage-asdf-vm?id=install-asdf-vm) The Multiple Runtime Version Manager
- [Atlas]() Database schema as code.

## Optional Tooling
Tools used for polytlk that are not used for day to day development

- [Helmfile]() Nice templater for helm values

## Runtimes to be managed by asdf
- NodeJS
- Python  note this might require some [build dependencies](https://github.com/pyenv/pyenv/wiki#suggested-build-environment)

## Runtime specific Tooling

### NodeJS
- pnpm 

### Python
- poetry

# Manual steps

## Add postgres dependencies
- > brew install libpq && brew link --force libpq


## Add asdf plugins for runtimes/tools
- > asdf plugin add nodejs https://github.com/asdf-vm/asdf-nodejs.git
- > asdf plugin-add python
- > asdf plugin-add kubectl
- > asdf plugin-add helm https://github.com/Antiarchitect/asdf-helm.git
- > asdf plugin-add poetry https://github.com/asdf-community/asdf-poetry.git

## Install the local versions
go to the root directory and run install
> asdf install

### NodeJS
- PNPM package manager
  when installing new versions of nodejs you need to run the following commands
> corepack enable && corepack prepare pnpm@9.9.0 --activate && asdf reshim nodejs

### Python
- Poetry package manager

### Extras
fully emluate docker with [this script](https://podman-desktop.io/docs/migrating-from-docker/emulating-docker-cli-with-podman)