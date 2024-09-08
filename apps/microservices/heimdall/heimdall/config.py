"""Module for configuration logic."""
from os import getenv


class Config():
    """Store common configuration for heimdall application."""

    service_name: str = getenv('SERVICE_NAME', 'heimdall-service')
    environment: str = getenv('ENVIRONMENT')
    oltp_traces_endpoint: str = getenv('OTEL_EXPORTER_OTLP_TRACES_ENDPOINT')
    django_secret: str = getenv('DJANGO_SECRET')
    gateway_host: str = getenv('GATEWAY_HOST')
    gateway_port: str = getenv('GATEWAY_PORT')
    eden_api_id: str = getenv('EDEN_API_ID')
    allowed_hosts: str = getenv('ALLOWED_HOSTS')
    tyk_api_key: str = getenv('TYK_MANAGEMENT_API_KEY')
    client_id_web: str = getenv('CLIENT_ID_WEB')
    #  '540933041586-61juofou98dd54ktk134ktfec2c84gd3.apps.googleusercontent.com'
    client_id_ios: str = getenv('CLIENT_ID_IOS')
    #  '540933041586-83lavib8c5hu16r0v6g63200jdruif77.apps.googleusercontent.com'


settings = Config()
