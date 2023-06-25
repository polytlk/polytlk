"""This module provides access to interpretation API.

It expects a chinese string to be interpretated, makes API request to OpenAI, and then validates.

Functions:
    get_en_interpretation(user_input: str) -> Optional[ChineseInterpretation]:
"""
from typing import Optional

import httpx
from opentelemetry.instrumentation.httpx import SyncOpenTelemetryTransport
from pydantic import ValidationError

from eden.chinese.schema.response import ResponseModel

TIMEOUT = 40.0
BASE_URL = 'http://socrates-svc:8079'
ENDPOINT = '/chatgpt'
TARGET = 'zh'

timeout = httpx.Timeout(TIMEOUT)
transport = SyncOpenTelemetryTransport(httpx.HTTPTransport())


def get_en_interpretation(user_input: str) -> Optional[ResponseModel]:
    """
    Send a POST request to the interpretation API.

    Args:
        user_input (str): The chinese input string to be translated.

    Returns:
        ResponseModel: The interpretation response if successful, None otherwise.
    """
    with httpx.Client(timeout=timeout, transport=transport) as client:
        final: Optional[ResponseModel] = None

        response = client.post(
            '{0}{1}'.format(BASE_URL, ENDPOINT),
            json={
                'user_input': user_input,
                'native_language_code': 'en',
                'target_language_code': TARGET,
            },
            headers={
                'Content-Type': 'application/json',
            },
        )
        try:
            final = ResponseModel.parse_raw(response.text)
        except ValidationError:
            return None

        return final
