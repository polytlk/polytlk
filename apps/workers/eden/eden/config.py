"""Module for configuration logic."""
from os import environ, getenv


class Config():
    """Store common configuration for eden-worker application."""

    service_name: str = environ.get('SERVICE_NAME', 'eden-worker')
    oltp_traces_endpoint: str = getenv('OTEL_EXPORTER_OTLP_TRACES_ENDPOINT')
    celery_broker_url: str = getenv('CELERY_BROKER_URL')
    celery_result_backend: str = getenv('CELERY_RESULT_BACKEND')
    celery_broker_connection_retry_on_startup = bool(getenv('CELERY_BROKER_CONN_RETRY_ON_STARTUP'))


settings = Config()
