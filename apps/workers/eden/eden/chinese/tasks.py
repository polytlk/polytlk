"""Module that contains all the processing work for before openai."""
import json
from typing import Any

from celery import shared_task
from celery.signals import worker_process_init
from opentelemetry.instrumentation.celery import CeleryInstrumentor
from redis import Redis

from eden.chinese.api_request import get_en_interpretation
from eden.config import settings
from eden.model.singleton import ModelLoader
from eden.tracing import tracer

redis_db = Redis.from_url(url=settings.celery_broker_url)


def check_list_str(doc: Any) -> list[str]:
    """Ensure input is list of str."""
    if not isinstance(doc, list):
        raise TypeError('Expected input to be a list')

    if not all(isinstance(str_maybe, str) for str_maybe in doc):
        raise TypeError('Expected all elements to be str')

    return doc


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
def sample_task(self, user_input: str) -> Any:
    """Call socrates in a non gating way."""
    model = None
    tokens = None

    with tracer.start_as_current_span('INTERPRET: Load NLP Model'):
        model = ModelLoader().load_model()

    with tracer.start_as_current_span('INTERPRET: Tokenize Input') as span:
        tokens = check_list_str(model(user_input))
        span.set_attribute('com.polytlk.eden.user_input', user_input)
        span.set_attribute('com.polytlk.eden.tokens', tokens)
        span.set_attribute('com.polytlk.eden.token_amount', len(tokens))

    ari = get_en_interpretation(user_input)

    # TODO: make validation work again
    if ari:
        ari['user_input'] = user_input

        redis_db.set(str(self.request.id), json.dumps(ari))
        return ari

    redis_db.set(str(self.request.id), 'nothing')
    return 'ARI not generated for input -> {0}'.format(user_input)
