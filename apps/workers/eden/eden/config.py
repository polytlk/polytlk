"""Module for configuration logic."""
from functools import lru_cache
from os import environ
from typing import Union


class BaseConfig(object):
    """Store common configuration for eden application."""

    service_name: str = environ.get('SERVICE_NAME', 'eden')
    oltp_traces_endpoint: str = environ.get(
        'OTEL_EXPORTER_OTLP_TRACES_ENDPOINT',
        'http://opentelemetry-collector.default.svc.cluster.local/v1/traces',
    )

    celery_broker_url: str = environ.get(
        'CELERY_BROKER_URL',
        'redis://redis-master.default.svc.cluster.local:6379/0',
    )
    celery_result_backend: str = environ.get(
        'CELERY_RESULT_BACKEND',
        'redis://redis-master.default.svc.cluster.local:6379/0',
    )


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
