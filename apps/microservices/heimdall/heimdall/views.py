import json
import logging
import time

import jwt
import requests
from django.conf import settings
from drf_spectacular.openapi import AutoSchema
from google.auth.transport import requests as req_trans
from google.oauth2 import id_token
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.serializers import CharField, Serializer
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST
from rest_framework.views import APIView

EXPIRATION_TIME = 3600
ORG_ID = '5e9d9544a1dcd60001d0ed20'
GATEWAY_HOST = 'gateway-svc-tyk-headless.tyk.svc.cluster.local'
TYK_MANAGEMENT_API_KEY = 'CHANGEME'
EDEN_API_ID = 'ZGVmYXVsdC9lZGVuLWFwaQ'
CLIENT_ID = '540933041586-61juofou98dd54ktk134ktfec2c84gd3.apps.googleusercontent.com'

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
        token = request.data.get('access_token', None)
        idinfo = None

        if not token:
            return Response({'detail': 'No access token provided'}, status=HTTP_400_BAD_REQUEST)

        try:
            # Specify the CLIENT_ID of the app that accesses the backend:
            idinfo = id_token.verify_oauth2_token(token, req_trans.Request(), CLIENT_ID)
        except ValueError:
            # Invalid token
            pass


        # Now we know that the access token is valid, and we have the user's information
        # We can create a JWT that includes this information
        payload = {
            # The subject of the token -> Google user ID
            'sub': idinfo['sub'],
            'email': idinfo['email'],
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

        KEY_REQUEST_TEMPLATE['meta_data'] = {'jwt': token}

        KEY_REQUEST_TEMPLATE['access_rights'][EDEN_API_ID] = {
            'api_name': 'eden-api',
            'api_id': EDEN_API_ID,
            'versions': [
                'Default',
            ],
        }

        logger.info('url: ' + url)

        raw_key_response = requests.post(url, headers=headers, data=json.dumps(KEY_REQUEST_TEMPLATE))

        key_info = raw_key_response.json()
        
        logger.info('createkeyintykres: ' + raw_key_response.text)

        return Response({'token': key_info['key']})
