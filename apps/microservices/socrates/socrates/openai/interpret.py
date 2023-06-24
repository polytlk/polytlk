"""Has core LLM logic for polytlk application."""
from typing import Any

from openai import ChatCompletion

from socrates.openai.functions import functions

TEMP = 0.2  # controls randomness from chatgpt
MODEL = 'gpt-3.5-turbo-0613'


def gen_raw_ari(prompt: str, user_input: str) -> str:
    """Generate an artificially refined interpretation (ARI) with OpenAI ChatCompletion model.

    Args:
        prompt (str): The prompt message to set the context of the conversation.
        user_input (str): The user's input message to continue the conversation.

    Returns:
        str: The generated artificially refined interpretation (ARI) as a string.

    Raises:
        TypeError: If the response content is not a string.
    """
    response = ChatCompletion.create(
        model=MODEL,
        messages=[
            {'role': 'system', 'content': prompt},
            {'role': 'user', 'content': user_input},
        ],
        temperature=TEMP,
    )

    ari = response.choices[0].message.content

    if isinstance(ari, str):
        return ari

    raise TypeError('Expected response content to be a string.')


def gen_ari_data(interpretation: str) -> Any:
    """Generate structured interpreation data by utilizing get interpretation function with openai.

    Args:
        interpretation (str): The raw interpretation string

    Returns:
        Any: The generated interpretation data.

    Note:
        The specific type of the returned data may vary depending on the implementation.

    """
    response = ChatCompletion.create(
        model=MODEL,
        messages=[
            {'role': 'user', 'content': interpretation},
        ],
        functions=functions,
        function_call={'name': 'get_interpretation'},
        temperature=TEMP,
    )

    return response.choices[0].message.function_call.arguments  # noqa: WPS219
