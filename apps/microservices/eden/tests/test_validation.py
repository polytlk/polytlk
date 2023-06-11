"""Testing module for validation functionality."""
from eden.utils.validation import is_zh
from hypothesis import given
from hypothesis import strategies as st

# List of common Chinese phrases
chinese_phrases = [
    '你好，今天天气很好。',
    '你好今天天气很好',
    '我爱学习中文。',
    '我爱学习中文',
    '中国的文化非常丰富。',
    '中国的文化非常丰富',
    '中文是一种美丽的语言。',
    '中文是一种美丽的语言',
    '我每天都在学习新的汉字。',
    '我每天都在学习新的汉字',
    '我喜欢旅行，尤其是去中国。',
    '我喜欢旅行，尤其是去中国',
    '吃饭了吗？',
    '一日之计在于晨。',
    '熟能生巧。',
    '你好，brother。',
    '高富帅',
]

# Create a strategy for picking random phrases
chinese_text_strategy = st.sampled_from(chinese_phrases)


@given(st.text())
def test_non_chinese_text(text):
    """Test all non chinese text."""
    assert is_zh(text) is False


@given(chinese_text_strategy)
def test_chinese_text(chinese_text):
    """Test sampled chinese text."""
    assert is_zh(chinese_text) is True
