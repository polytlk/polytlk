"""Module for tokenization of chinese text."""
from typing import Any

from opentelemetry import trace

from eden.load_model import model


def check_list_str(doc: Any) -> list[str]:
    """Ensure input is list of str."""
    if not isinstance(doc, list):
        raise TypeError('Expected input to be a list')

    if not all(isinstance(str_maybe, str) for str_maybe in doc):
        raise TypeError('Expected all elements to be str')

    return doc


def generate_tokens(user_input: str) -> list[str]:
    """
    Process chinese text into tokens and pos tags.

    Segementation (Tokenization)
        -> Divides the text into words or tokens
        -> key = 'tok/fine'

    Dependency parsing
        -> shows word-to-word grammatical relations
        -> key = 'dep'
        -> see more @ https://hanlp.hankcs.com/docs/annotations/dep/sd_zh.html

    Part-of-Speech (POS) Tagging
        -> key = 'pos/ctb'
        -> Assign part-of-speech tags to each word

    Constituency Parsing
        -> reveals phrase-level and sentence-level grammatical structure
        -> key = 'con'
        -> https://repository.upenn.edu/cgi/viewcontent.cgi?article=1040&context=ircs_reports
    """
    span = trace.get_current_span()

    tokens = check_list_str(model(user_input))

    span.set_attribute('com.polytlk.eden.tokens', tokens)
    return tokens