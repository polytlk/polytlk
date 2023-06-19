"""Module that contains all the processing work for before openai."""
from typing import Any

from celery import shared_task
from celery.app.log import TaskFormatter
from celery.signals import after_setup_task_logger, worker_process_init
from celery.utils.log import get_task_logger
from opentelemetry.instrumentation.celery import CeleryInstrumentor

from eden.model.singleton import ModelLoader
from eden.tracing import tracer

task_logger = get_task_logger(__name__)

TASK_FMT = '%(asctime)s - %(task_id)s - %(task_name)s - %(levelname)s - %(message)s'  # noqa: WPS323


def check_list_str(doc: Any) -> list[str]:
    """Ensure input is list of str."""
    if not isinstance(doc, list):
        raise TypeError('Expected input to be a list')

    if not all(isinstance(str_maybe, str) for str_maybe in doc):
        raise TypeError('Expected all elements to be str')

    return doc


@after_setup_task_logger.connect  # type: ignore
def setup_task_logger(logger, *args, **kwargs):
    r"""Configure the task logger when the Celery worker setup is complete.

    This function is connected to the `after_setup_task_logger` signal and
    updates the log formatter for all handlers of the logger.

    Args:
        logger (Logger): The logger object.
        \*args (Any): Variable length argument list.
        \**kwargs (Any): Arbitrary keyword arguments.
    """
    for log in logger.handlers:
        log.setFormatter(TaskFormatter(TASK_FMT))


@worker_process_init.connect(weak=True)  # type: ignore
def setup_celery(sender=None, conf=None, **kwargs):
    r"""Initialize the model loader class when the Celery worker process is initialized.

    This function is connected to the `worker_process_init` signal and
    sets up a global ModelLoader instance.

    Args:
        sender (Optional[str]): The name of the sender (or `None` if not provided).
        conf (Optional[Any]): The configuration (or `None` if not provided).
        \**kwargs (Any): Arbitrary keyword arguments.
    """
    CeleryInstrumentor().instrument()


@shared_task(bind=True)  # type: ignore
def sample_task(self, user_input: str) -> list[str]:
    """Call socrates in a non gating way."""
    with tracer.start_as_current_span('Prepare Chinese prompt'):
        task_logger.debug('User Input {0}'.format(user_input))

        model = ModelLoader(logger=task_logger).load_model()
        task_logger.debug('Model {0}'.format(model))

        tokens = check_list_str(model(user_input))
        task_logger.debug('Tokens {0}'.format(tokens))

        return tokens
