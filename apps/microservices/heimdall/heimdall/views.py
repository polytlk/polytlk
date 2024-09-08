import json
import math
import time

import jwt
import requests
from drf_spectacular.openapi import AutoSchema
from google.auth.transport import requests as req_trans
from google.oauth2 import id_token
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.status import HTTP_400_BAD_REQUEST, HTTP_404_NOT_FOUND, HTTP_200_OK
from rest_framework.views import APIView

from heimdall.config import settings
from heimdall.tracing import tracer

EXPIRATION_TIME = 3600
ORG_ID = '5e9d9544a1dcd60001d0ed20'

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

                if idinfo['aud'] not in {settings.client_id_web, settings.client_id_ios}:
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

                secret = settings.django_secret

                token = jwt.encode(payload, secret, algorithm='HS256')
                signiture = extract_signature(token)

                prepare_tyk_span.set_attribute('ply.tyk_key_signiture', signiture)
                prepare_tyk_span.set_attribute('ply.targetapis.eden-api-id', settings.eden_api_id)

                url = 'http://{0}:{1}/tyk/keys/{2}'.format(
                    settings.gateway_host,
                    settings.gateway_port,
                    signiture,
                )

                headers = {
                    'Content-Type': 'application/json',
                    'x-tyk-authorization': settings.tyk_api_key,
                }

                KEY_REQUEST_TEMPLATE['meta_data'] = {'jwt': token}

                KEY_REQUEST_TEMPLATE['access_rights'][settings.eden_api_id] = {
                    'api_name': 'eden-api',
                    'api_id': settings.eden_api_id,
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


class OAuthCheckView(APIView):
    permission_classes = [AllowAny]
    schema = AutoSchema()

    def post(self, request, format=None):
        key = request.data.get('key', None)
        print("KEY", key)

        url = 'http://{0}:{1}/tyk/keys/{2}'.format(
            settings.gateway_host,
            settings.gateway_port,
            key,
        )

        print("url", url)

        headers = {
            'Content-Type': 'application/json',
            'x-tyk-authorization': settings.tyk_api_key,
        }

        print("headers", headers)

        raw_key_response = requests.get(
            url,
            headers=headers,
        )

        print("raw", raw_key_response.status_code)

        if raw_key_response.status_code != HTTP_200_OK:
            return Response({"message": 'session is expired'}, status=HTTP_404_NOT_FOUND)

        response = raw_key_response.json()
        print("check check response")
        print(response)

        return Response({"message": 'session is valid'}, status=HTTP_200_OK)
