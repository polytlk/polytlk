"""Tests the functionality of the ChineseInterpretation model for Interpretation functionality.

The tests use the Hypothesis library to generate test data for the ChineseInterpretation model.

Strategies are defined for generating:
- valid pinyin words (pinyin_word_st),
- invalid pinyin words (not_pinyin_word_st),
- valid tuples for the 'words' attribute (good_words_st),
- invalid tuples for the 'words' attribute (bad_word_st),
- valid tuples for the 'dialogue' attribute (good_dialogue_st).

"""
import unicodedata

import pytest
from hypothesis import Verbosity, given, settings
from hypothesis import strategies as st
from hypothesis.strategies import builds, lists, text, tuples
from pydantic import ValidationError
from zhon.pinyin import sent as pinyin_sent
from zhon.pinyin import syl as pinyin_syl

from eden.chinese.schema import ChineseInterpretation as ChineseARI

PROFILE = 'dev'
LOCAL_MAX_EXAMPLES = 3


def is_cjk(char):
    try:
        name = unicodedata.name(char)
        return 'CJK UNIFIED IDEOGRAPH' in name
    except ValueError:
        return False




settings.register_profile('dev', max_examples=LOCAL_MAX_EXAMPLES)
settings.register_profile('debug', max_examples=LOCAL_MAX_EXAMPLES, verbosity=Verbosity.verbose)

settings.load_profile(PROFILE)

pinyin_word_st = st.from_regex(pinyin_syl, fullmatch=True)
hanji_word_st = st.characters(min_codepoint=0x4E00, max_codepoint=0x9FFF).filter(is_cjk)

pinyin_sent_st = st.from_regex(pinyin_sent, fullmatch=True)

# WORDS
good_words_st = lists(tuples(hanji_word_st, pinyin_word_st, text(min_size=1)), min_size=1, max_size=1)
bad_word_pinyin_st = tuples(hanji_word_st, hanji_word_st, text())
bad_word_hanji_st = tuples(pinyin_word_st, pinyin_word_st, text())

# DIALOGUE
good_dialogue_st = lists(tuples(hanji_word_st, pinyin_sent_st, text(min_size=1)), min_size=1, max_size=1)
bad_dialogue_pinyin_st = tuples(hanji_word_st, hanji_word_st, text())


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
@given(words=lists(bad_word_pinyin_st, min_size=1, max_size=1), dialogue=good_dialogue_st, meaning=text(min_size=1))
def test_words_pinyin(words, dialogue, meaning):
    """Check validation error is raised when word tuple has invalid pinyin."""
    with pytest.raises(ValidationError, match='{0}'.format(pinyin_syl)):
        ChineseARI(words=words, dialogue=dialogue, meaning=meaning)


@pytest.mark.words
@given(words=lists(bad_word_hanji_st, min_size=1), dialogue=good_dialogue_st, meaning=text(min_size=1))
def test_words_hanji(words, dialogue, meaning):
    """Check validation error is raised when word tuple has invalid hanji."""
    with pytest.raises(ValidationError, match='{0}'.format('CJK Unified')):
        ChineseARI(words=words, dialogue=dialogue, meaning=meaning)


@pytest.mark.dialogue
@given(words=good_words_st, dialogue=lists(bad_dialogue_pinyin_st, min_size=1), meaning=text(min_size=1))
def test_dialogue_pinyin(words, dialogue, meaning):
    """Check validation error is raised when word tuple has invalid pinyin."""
    with pytest.raises(ValidationError, match='{0}'.format(pinyin_sent)):
        ChineseARI(words=words, dialogue=dialogue, meaning=meaning)
