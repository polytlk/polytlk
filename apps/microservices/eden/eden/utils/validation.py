"""Module for Any validation/preprocessing of chinese text."""
from lingua import Language, LanguageDetectorBuilder

languages = [Language.CHINESE, Language.ENGLISH, Language.JAPANESE, Language.KOREAN]
detector = LanguageDetectorBuilder.from_languages(*languages).build()


def is_zh(input_string: str):
    """Validate input as chinese or not."""
    if not input_string:
        return False

    return detector.detect_language_of(input_string) == Language.CHINESE
