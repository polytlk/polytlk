"""Module for configuration logic."""
from os import environ, getenv


class Config():
    """Store common configuration for eden application."""

    service_name: str = environ.get('SERVICE_NAME', 'eden-service')
    oltp_traces_endpoint: str = getenv('OTEL_EXPORTER_OTLP_TRACES_ENDPOINT')
    celery_broker_url: str = getenv('CELERY_BROKER_URL')
    celery_result_backend: str = getenv('CELERY_RESULT_BACKEND')


settings = Config()
