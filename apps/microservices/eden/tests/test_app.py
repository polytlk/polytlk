"""Test app for eden service."""
from fastapi import status
from fastapi.testclient import TestClient

from eden.app import create_app

app = create_app()
client = TestClient(app)


def test_invalid_chinese_post() -> None:
    """Return 422 when non chinese text is posted."""
    response = client.post('/chinese', json={'user_input': '미안해 내가 너무 바빴어  쉴때도 집을 구하느라 바빴어'})
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    assert response.json() == {'message': 'Input is not valid chinese'}
