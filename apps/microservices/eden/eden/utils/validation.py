"""Module for validation of chinese text."""
from re import findall

from lingua import Language
from lingua import LanguageDetectorBuilder as Builder
from opentelemetry import trace
from zhon.hanzi import characters, punctuation

languages = [Language.CHINESE, Language.ENGLISH, Language.JAPANESE, Language.KOREAN]
detector = Builder.from_languages(*languages).build()


def check_valid_token_amount(user_input: str) -> int:
    """Retrieve amount of valid chinese chars in a string."""
    valid_tokens = findall('[{0}]'.format(characters), user_input)
    valid_punc = findall('[{0}]'.format(punctuation), user_input)

    return len(valid_tokens) + len(valid_punc)


def is_zh(input_string: str) -> bool:
    """Validate input as chinese or not."""
    span = trace.get_current_span()
    if not input_string:
        span.set_attribute('com.polytlk.eden.valid_input', value=False)
        return False

    zh_detected = detector.detect_language_of(input_string) == Language.CHINESE

    if zh_detected:
        token_amount = check_valid_token_amount(input_string)
        is_valid = zh_detected and token_amount > 2
        span.set_attribute('com.polytlk.eden.valid_input', value=is_valid)
        span.set_attribute('com.polytlk.eden.token_amount', value=token_amount)
        return is_valid

    span.set_attribute('com.polytlk.eden.valid_input', value=False)
    return False
