"""Module for storing schemas for chinese endpoint."""
from pydantic import BaseModel


class ChineseQuery(BaseModel):
    """DTO for chinese endpoint."""

    user_input: str = ''


class ChineseTask(BaseModel):
    """Response for chinese endpoint."""

    task_id: str = ''


class Message(BaseModel):
    """Model for additional responses."""

    message: str = ''
