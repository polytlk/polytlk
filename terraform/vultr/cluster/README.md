# Local Commands

Show all workspaces from remote state
> terraform workspace list 

Select desired vultr cluster workspace by environment
> terraform workspace select vultr-ENV-cluster

Apply the terraform
> terraform apply -var='node_pools_config=[]' -var-file="secrets.tfvars"

## Notes
If you are creating a cluster workspace for the first time do not use an empty list for node_pools_config