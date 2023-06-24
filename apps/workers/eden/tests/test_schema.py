"""Tests the functionality of the ChineseInterpretation model for Interpretation functionality.

The tests use the Hypothesis library to generate test data for the ChineseInterpretation model.

Strategies are defined for generating:
- valid pinyin words (pinyin_word_st),
- invalid pinyin words (not_pinyin_word_st),
- valid tuples for the 'words' attribute (good_words_st),
- invalid tuples for the 'words' attribute (bad_word_st),
- valid tuples for the 'dialogue' attribute (good_dialogue_st).

"""
import pytest
from hypothesis import Verbosity, given, settings
from hypothesis import strategies as st
from hypothesis.strategies import builds, lists, text, tuples
from pydantic import ValidationError
from zhon.hanzi import characters
from zhon.pinyin import sent
from zhon.pinyin import word as pinyin_word

from eden.chinese.schema import ChineseInterpretation as ChineseARI

PROFILE = 'dev'
LOCAL_MAX_EXAMPLES = 10

settings.register_profile('dev', max_examples=LOCAL_MAX_EXAMPLES)
settings.register_profile('debug', max_examples=LOCAL_MAX_EXAMPLES, verbosity=Verbosity.verbose)

settings.load_profile(PROFILE)

pinyin_word_st = st.from_regex(pinyin_word, fullmatch=True)
not_pinyin_word_st = st.from_regex(characters, fullmatch=True)

pinyin_sent_st = st.from_regex(sent, fullmatch=True)
not_pinyin_sent_st = st.from_regex(characters, fullmatch=True)

good_words_st = lists(tuples(text(), pinyin_word_st, text()), min_size=1)
bad_word_st = tuples(text(), not_pinyin_word_st, text())
good_dialogue_st = lists(tuples(text(), pinyin_sent_st, text()), min_size=2)
bad_dialogue_st = tuples(text(), not_pinyin_sent_st, text())


@pytest.mark.meaning
@given(builds(ChineseARI, words=good_words_st, dialogue=good_dialogue_st))
def test_non_empty_meaning(instance: ChineseARI):
    """Check meaning in interpretation model is not empty."""
    assert instance.meaning != ''


@pytest.mark.words
@given(builds(ChineseARI, words=good_words_st, dialogue=good_dialogue_st))
def test_words_len(instance: ChineseARI):
    """Check each word tuple in interpretation model has a length of 3."""
    assert all(len(word) == 3 for word in instance.words)


@pytest.mark.dialogue
@given(builds(ChineseARI, words=good_words_st, dialogue=good_dialogue_st))
def test_dialogue_len(instance: ChineseARI):
    """Check each dialogue tuple in interpretation model has a length of 3."""
    assert all(len(dialogue) == 3 for dialogue in instance.dialogue)


@pytest.mark.words
@given(words=lists(bad_word_st, min_size=1), dialogue=good_dialogue_st, meaning=text())
def test_words_pinyin(words, dialogue, meaning):
    """Check validation error is raised when word tuple has invalid pinyin."""
    with pytest.raises(ValidationError):
        ChineseARI(words=words, dialogue=dialogue, meaning=meaning)


@pytest.mark.dialogue
@given(words=good_words_st, dialogue=lists(bad_dialogue_st, min_size=2), meaning=text())
def test_dialogue_pinyin(words, dialogue, meaning):
    """Check validation error is raised when word tuple has invalid pinyin."""
    with pytest.raises(ValidationError):
        ChineseARI(words=words, dialogue=dialogue, meaning=meaning)
