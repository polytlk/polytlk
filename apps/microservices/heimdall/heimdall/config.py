"""Module for configuration logic."""
from os import getenv


class Config():
    """Store common configuration for heimdall application."""

    service_name: str = getenv('SERVICE_NAME', 'heimdall-service')
    environment: str = getenv('ENVIRONMENT')
    oltp_traces_endpoint: str = getenv('OTEL_EXPORTER_OTLP_TRACES_ENDPOINT')

    gateway_host: str = getenv('GATEWAY_HOST')
    gateway_port: str = getenv('GATEWAY_PORT')
    eden_api_id: str = getenv('EDEN_API_ID')
    allowed_hosts: str = getenv('ALLOWED_HOSTS')
    client_id_web: str = getenv('CLIENT_ID_WEB')
    client_id_ios: str = getenv('CLIENT_ID_IOS')
    google_client_id: str = getenv('GOOGLE_CLIENT_ID')
    db_host: str = getenv('DB_HOST')
    db_port: str = getenv('DB_PORT')

    tyk_api_key: str = getenv('TYK_MANAGEMENT_API_KEY')
    django_secret: str = getenv('DJANGO_SECRET')
    db_pass: str = getenv('DB_PASS')
    google_secret: str = getenv('GOOGLE_SECRET')
    



settings = Config()
