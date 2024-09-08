# How to use secrets with polytlk

## local development

for local development a developer needs access to our doppler instance. from there per project copy and past the .env from the local config to respective app folder

make sure to delete any quotes around secret values that doppler auto generates

## higher envs

In higher envs the appliciations expect a secret that contains a valid service access token. these are scoped by project and env.

This is a manual step when setting up a new cluster or disaster recovery

>  kubectl create secret generic doppler-token-<FULLNAME> --from-literal dopplerToken=<SERVICE-ACCESS-TOKEN> -n <NAMESPACE>
