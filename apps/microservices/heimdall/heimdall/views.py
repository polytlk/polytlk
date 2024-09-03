import json
import math
import time

import jwt
import requests
from django.conf import settings
from drf_spectacular.openapi import AutoSchema
from google.auth.transport import requests as req_trans
from google.oauth2 import id_token
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.status import HTTP_400_BAD_REQUEST
from rest_framework.views import APIView

from heimdall.settings import EDEN_API_ID, GATEWAY_HOST, GATEWAY_PORT
from heimdall.tracing import tracer

EXPIRATION_TIME = 3600
ORG_ID = '5e9d9544a1dcd60001d0ed20'
TYK_MANAGEMENT_API_KEY = 'CHANGEME'
CLIENT_ID_WEB = '540933041586-61juofou98dd54ktk134ktfec2c84gd3.apps.googleusercontent.com'
CLIENT_ID_IOS = '540933041586-83lavib8c5hu16r0v6g63200jdruif77.apps.googleusercontent.com'

KEY_REQUEST_TEMPLATE = {  # noqa: WPS407
    'apply_policies': [],
    'org_id': ORG_ID,
    'allowance': 0,
    'expires': -1,
    'per': 0,
    'quota_max': 0,
    'rate': 0,
    'access_rights': {},
    'jwt_data': {},
}

def extract_signature(jwt_token):
    parts = jwt_token.split('.')
    if len(parts) != 3:
        raise ValueError('Invalid JWT token')
    return parts[2]


class Liveness(APIView):
    permission_classes = [AllowAny]
    schema = AutoSchema()

    def get(self, request, format=None):
        return Response('ok')


class Readiness(APIView):
    permission_classes = [AllowAny]
    schema = AutoSchema()

    def get(self, request, format=None):
        try:
            pass
        except Exception as e:
            return Response(
                'down',
                status=HTTP_400_BAD_REQUEST,
            )
        return Response('ok')



class OAuthResponseView(APIView):
    permission_classes = [AllowAny]
    schema = AutoSchema()

    def post(self, request, format=None):
        with tracer.start_as_current_span('LOGIN FLOW') as root_span:
            token = request.data.get('access_token', None)
            idinfo = None

            if not token:
                root_span.set_attribute('ply.access_token_state', 'missing')
                return Response({'detail': 'No access token provided'}, status=HTTP_400_BAD_REQUEST)

            with tracer.start_as_current_span('oauth verify') as oauth_span:
                try:
                    idinfo = id_token.verify_oauth2_token(token, req_trans.Request())
                except ValueError:
                    oauth_span.set_attribute('ply.access_token_state', 'invalid')
                    root_span.set_attribute('ply.access_token_state', 'invalid')

                oauth_span.set_attribute('ply.idinfo.aud', idinfo['aud'])
                oauth_span.set_attribute('ply.idinfo.iss', idinfo['iss'])
                oauth_span.set_attribute('ply.idinfo.hd', idinfo['hd'])
                oauth_span.set_attribute('ply.idinfo.sub', idinfo['sub'])
                oauth_span.set_attribute('ply.idinfo.email', idinfo['email'])
                oauth_span.set_attribute('ply.idinfo.email_verified', idinfo['email_verified'])

                if idinfo['aud'] not in {CLIENT_ID_WEB, CLIENT_ID_IOS}:
                    oauth_span.set_attribute('ply.access_token_state', 'external')
                    root_span.set_attribute('ply.access_token_state', 'external')
                    raise ValueError('Could not verify audience.')

                oauth_span.set_attribute('ply.access_token_state', 'valid')
                root_span.set_attribute('ply.access_token_state', 'valid')

            with tracer.start_as_current_span('prepare_tyk') as prepare_tyk_span:
                exp = math.floor(time.time() + EXPIRATION_TIME)

                # Now we know that the access token is valid, and we have the user's information
                # We can create a JWT that includes this information
                payload = {
                    # The subject of the token -> Google user ID
                    'sub': idinfo['sub'],
                    'email': idinfo['email'],
                    # Expiration time. This is in Unix timestamp format.
                    # This token will expire in 1 hour.
                    'exp': exp,
                }

                secret = settings.SECRET_KEY  # Use Django's secret key to sign the JWT

                token = jwt.encode(payload, secret, algorithm='HS256')
                signiture = extract_signature(token)

                prepare_tyk_span.set_attribute('ply.tyk_key_signiture', signiture)
                prepare_tyk_span.set_attribute('ply.targetapis.eden-api-id', EDEN_API_ID)

                url = 'http://{0}:{1}/tyk/keys/{2}'.format(
                    GATEWAY_HOST,
                    GATEWAY_PORT,
                    signiture
                )

                headers = {
                    'Content-Type': 'application/json',
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

                KEY_REQUEST_TEMPLATE['expires'] = exp

            with tracer.start_as_current_span('post_tyk') as post_tyk_span:

                # Make the POST request
                raw_key_response = requests.post(
                    url,
                    headers=headers,
                    data=json.dumps(KEY_REQUEST_TEMPLATE),
                )

                # Check for HTTP errors
                raw_key_response.raise_for_status()

                try:
                    # Parse the JSON response
                    key_info = raw_key_response.json()

                    # Get a stringified version of the keys and values of the object
                    kvs = ', '.join([f"{key}: {value}" for key, value in key_info.items()])
                    post_tyk_span.set_attribute('ply.raw_response.kvs', kvs)

                    # Log or print the keys and values for debugging (optional)
                    print(f"Keys and values present in response: {kvs}")
                    
                    # Check if required keys are in the response
                    required_keys = ['key', 'status', 'action', 'key_hash']
                    for key in required_keys:
                        if key not in key_info:
                            raise KeyError(f"Missing key in response: {key}")

                    # Set attributes if keys are present
                    post_tyk_span.set_attribute('ply.tyk_key', key_info['key'])
                    post_tyk_span.set_attribute('ply.tyk_key_status', key_info['status'])
                    post_tyk_span.set_attribute('ply.tyk_key_action', key_info['action'])
                    post_tyk_span.set_attribute('ply.tyk_key_hash', key_info['key_hash'])

                    return Response({'token': key_info['key']})

                except KeyError as err:
                    return Response(
                        {'error': 'KeyError', 'message': str(err)},
                        status=HTTP_400_BAD_REQUEST,
                    )

                except json.JSONDecodeError as err:
                    return Response(
                        {'error': 'Invalid JSON response', 'message': str(err)},
                        status=HTTP_400_BAD_REQUEST,
                    )
