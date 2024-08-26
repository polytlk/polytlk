# Local Commands

Show all workspaces from remote state
> terraform workspace list 

Select desired vultr datastorage workspace by environment
> terraform workspace select vultr-ENV-cluster

Apply the terraform
> terraform apply -var-file="secrets.tfvars"
