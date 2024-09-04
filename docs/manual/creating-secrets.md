# higher envs

In higher envs the appliciations expect a secret that contains a valid service access token. these are scoped by project and env.

This is a manual step when setting up a new cluster or disaster recovery

>  kubectl create secret generic doppler-token-<FULLNAME> --from-literal dopplerToken=<SERVICE-ACCESS-TOKEN> -n <NAMESPACE>
