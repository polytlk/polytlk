"""Define celery instance."""
from celery import Celery
from celery import current_app as current_celery_app

from eden.chinese.tasks import sample_task  # noqa: F401
from eden.config import settings


def create_celery() -> Celery:
    """Configure and return a Celery app instance."""
    celery_app: Celery = current_celery_app
    celery_app.config_from_object(settings, namespace='celery')

    return celery_app
