"""Module for configuration logic."""
from functools import lru_cache
from os import environ, getenv
from typing import Union


class BaseConfig(object):
    """Store common configuration for eden application."""

    service_name: str = environ.get('SERVICE_NAME', 'socrates')
    oltp_traces_endpoint: str = getenv('OTEL_EXPORTER_OTLP_TRACES_ENDPOINT')


class DevelopmentConfig(BaseConfig):
    """Store development configuration for eden application."""

    pass  # noqa: WPS420, WPS604


class ProductionConfig(BaseConfig):
    """Store production configuration for eden application."""

    pass  # noqa: WPS420, WPS604


class TestingConfig(BaseConfig):
    """Store testing configuration for eden application."""

    pass  # noqa: WPS420, WPS604


@lru_cache()
def get_settings() -> Union[BaseConfig, DevelopmentConfig, ProductionConfig, TestingConfig]:
    """Pick configuration values based on environment."""
    config_cls_dict = {
        'development': DevelopmentConfig,
        'production': ProductionConfig,
        'testing': TestingConfig,
    }

    config_name = environ.get('FASTAPI_CONFIG', 'development')
    config_cls = config_cls_dict[config_name]
    return config_cls()


settings = get_settings()
