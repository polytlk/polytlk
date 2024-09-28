PROJECT_ROOT="$NX_WORKSPACE_ROOT/apps/workers/eden" 

export HANLP_HOME="$PROJECT_ROOT/.hanlp" 

cd $PROJECT_ROOT

poetry install
poetry run python eden/model/load.py 

