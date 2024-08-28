# microservices-heimdall

## Setup fresh heimdall instance

Run the commands below from heimdall root

poetry install
ENVIRONMENT=local poetry run python manage.py migrate
ENVIRONMENT=local poetry run python manage.py createsuperuser
ENVIRONMENT=local poetry run python manage.py collectstatic  