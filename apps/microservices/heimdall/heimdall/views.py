import json
import logging
import time

import jwt
import requests
from django.conf import settings
from drf_spectacular.openapi import AutoSchema
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.serializers import CharField, Serializer
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST
from rest_framework.views import APIView

VALIDATION_URL = 'https://www.googleapis.com/oauth2/v3/tokeninfo?access_token={0}'
EXPIRATION_TIME = 3600
ORG_ID = '5e9d9544a1dcd60001d0ed20'
GATEWAY_HOST = 'gateway-svc-tyk-headless.tyk.svc.cluster.local'
TYK_MANAGEMENT_API_KEY = 'CHANGEME'
EDEN_API_ID = 'ZGVmYXVsdC9lZGVuLWFwaQ'

KEY_REQUEST_TEMPLATE = {  # noqa: WPS407
    'apply_policies': [],
    'org_id': ORG_ID,
    'expires': 0,
    'allowance': 0,
    'per': 0,
    'quota_max': 0,
    'rate': 0,
    'access_rights': {},
    'jwt_data': {},
}

logger = logging.getLogger(__name__)

def extract_signature(jwt_token):
    parts = jwt_token.split('.')
    if len(parts) != 3:
        raise ValueError('Invalid JWT token')
    return parts[2]


class OAuthResponseView(APIView):
    permission_classes = [AllowAny]
    schema = AutoSchema()

    def post(self, request, format=None):
        access_token = request.data.get('access_token', None)

        if not access_token:
            return Response({'detail': 'No access token provided'}, status=HTTP_400_BAD_REQUEST)

        # Validate the access token with Google
        raw_response = requests.get(VALIDATION_URL.format(access_token))

        if raw_response.status_code != HTTP_200_OK:
            return Response({'detail': 'Invalid access token'}, status=HTTP_400_BAD_REQUEST)

        user_info = raw_response.json()

        # Now we know that the access token is valid, and we have the user's information
        # We can create a JWT that includes this information
        payload = {
            # The subject of the token -> Google user ID
            'sub': user_info['sub'],
            'email': user_info['email'],
            # Expiration time. This is in Unix timestamp format. This token will expire in 1 hour.
            'exp': time.time() + EXPIRATION_TIME,
        }

        secret = settings.SECRET_KEY  # Use Django's secret key to sign the JWT

        token = jwt.encode(payload, secret, algorithm='HS256')
        signiture = extract_signature(token)

        url = 'http://{0}:8080/tyk/keys/{1}'.format(GATEWAY_HOST, signiture)
        headers = {
            'Content-Type': 'application/json',
            # 'Authorization': 'Bearer {0}'.format(access_token),
            'x-tyk-authorization': TYK_MANAGEMENT_API_KEY,
        }

        KEY_REQUEST_TEMPLATE['access_rights'][EDEN_API_ID] = {
            'api_name': 'eden-api',
            'api_id': EDEN_API_ID,
            'versions': [
                'Default',
            ],
        }

        KEY_REQUEST_TEMPLATE['jwt_data'] = {'secret': token}

        logger.info('url: ' + url)

        response = requests.post(url, headers=headers, data=json.dumps(KEY_REQUEST_TEMPLATE))

        logger.info('createkeyintykres: ' + response.text)

        return Response({'jwt': token})
