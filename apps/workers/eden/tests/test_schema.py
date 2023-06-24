"""Tests the functionality of the ChineseInterpretation model for Interpretation functionality.

The tests use the Hypothesis library to generate test data for the ChineseInterpretation model.

Strategies are defined for generating:
- valid pinyin words (pinyin_word_st),
- invalid pinyin words (not_pinyin_word_st),
- valid tuples for the 'words' attribute (good_words_st),
- invalid tuples for the 'words' attribute (bad_word_st),
- valid tuples for the 'dialogue' attribute (good_diagloues_st).

"""

import pytest
from hypothesis import given
from hypothesis import strategies as st
from hypothesis.strategies import builds, lists, text, tuples
from pydantic import ValidationError
from zhon.hanzi import characters
from zhon.pinyin import word as pinyin_word

from eden.chinese.schema import ChineseInterpretation

pinyin_word_st = st.from_regex(pinyin_word, fullmatch=True)
not_pinyin_word_st = st.from_regex(characters, fullmatch=True)

good_words_st = lists(tuples(text(), pinyin_word_st, text()), min_size=1)
bad_word_st = tuples(text(), not_pinyin_word_st, text())
good_diagloues_st = lists(tuples(text(), text(), text()), min_size=2)


@given(builds(ChineseInterpretation, words=good_words_st, dialogue=good_diagloues_st))
def test_non_empty_meaning(instance: ChineseInterpretation):
    """Check meaning in interpretation model is not empty."""
    assert instance.meaning != ''


@given(builds(ChineseInterpretation, words=good_words_st, dialogue=good_diagloues_st))
def test_words_len(instance: ChineseInterpretation):
    """Check each word tuple in interpretation model has a length of 3."""
    assert all(len(word) == 3 for word in instance.words)


@given(
    words=lists(bad_word_st, min_size=1),
    meaning=text(),
    dialogue=good_diagloues_st,
)
def test_words_pinyin(words, meaning, dialogue):
    """Check validation error is raised when word tuple has invalid pinyin."""
    with pytest.raises(ValidationError):
        ChineseInterpretation(words=words, meaning=meaning, dialogue=dialogue)


@given(builds(ChineseInterpretation, words=good_words_st, dialogue=good_diagloues_st))
def test_dialogue_len(instance: ChineseInterpretation):
    """Check each dialogue tuple in interpretation model has a length of 3."""
    assert all(len(dialogue) == 3 for dialogue in instance.dialogue)
