"""Module that contains all the processing work for before openai."""

from celery import shared_task

from eden.utils.tokenization import generate_tokens


@shared_task()  # type: ignore
def sample_task(user_input: str) -> list[str]:
    """Call socrates in a non gating way."""
    return generate_tokens(user_input)
