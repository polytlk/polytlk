"""Module for storing schemas for chinese endpoint."""
from pydantic import BaseModel


class ChineseQuery(BaseModel):
    """DTO for chinese endpoint."""

    user_input: str = ''


class ChineseTokens(BaseModel):
    """Response for chinese endpoint."""

    tokens: list[str] = []


class Message(BaseModel):
    """Model for additional responses."""

    message: str = ''
