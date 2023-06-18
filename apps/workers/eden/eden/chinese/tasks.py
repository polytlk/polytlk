"""Module that contains all the processing work for before openai."""
from typing import cast

from celery import shared_task
from celery.app.log import TaskFormatter
from celery.signals import after_setup_task_logger, worker_process_init
from celery.utils.log import get_task_logger
from opentelemetry.instrumentation.celery import CeleryInstrumentor

from eden.utils.model.singleton import ModelLoader
from eden.utils.tokenization import check_list_str

task_logger = get_task_logger(__name__)

model_loader = None

TASK_FMT = '%(asctime)s - %(task_id)s - %(task_name)s - %(levelname)s - %(message)s'  # noqa: WPS323


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
def setup_model(sender=None, conf=None, **kwargs):
    r"""Initialize the model loader class when the Celery worker process is initialized.

    This function is connected to the `worker_process_init` signal and
    sets up a global ModelLoader instance.

    Args:
        sender (Optional[str]): The name of the sender (or `None` if not provided).
        conf (Optional[Any]): The configuration (or `None` if not provided).
        \**kwargs (Any): Arbitrary keyword arguments.
    """
    task_logger.debug('INIT CONNECT')
    global model_loader  # noqa: WPS420
    model_loader = ModelLoader(logger=task_logger)  # noqa: WPS442
    task_logger.debug('model loader LOADED')
    CeleryInstrumentor().instrument()


@shared_task(bind=True)  # type: ignore
def sample_task(self, user_input: str) -> list[str]:
    """Call socrates in a non gating way."""
    task_logger.debug('User Input {0}'.format(user_input))

    global model_loader  # noqa: WPS420
    model = cast(ModelLoader, model_loader).load_model()
    task_logger.debug('Model {0}'.format(model))

    tokens = check_list_str(model(user_input))
    task_logger.debug('Tokens {0}'.format(tokens))

    return tokens
