import time

import jwt
import requests
from django.conf import settings
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST
from rest_framework.views import APIView

VALIDATION_URL = 'https://www.googleapis.com/oauth2/v3/tokeninfo?access_token={0}'


class OAuthResponseView(APIView):
    def post(self, request, format=None):
        access_token = request.data.get('access_token', None)

        if not access_token:
            return Response({'detail': 'No access token provided'}, status=HTTP_400_BAD_REQUEST)

        # Validate the access token with Google
        raw_response = requests.get(VALIDATION_URL.format(access_token))

        if raw_response.status_code != HTTP_200_OK:
            return Response({'detail': 'Invalid access token'}, status=HTTP_400_BAD_REQUEST)

        user_info = raw_response.json()

        # Save user_info to your database here, as per your needs

        # Now we know that the access token is valid, and we have the user's information
        # We can create a JWT that includes this information

        payload = {
            'sub': user_info['sub'],  # The subject of the token (the user it identifies) should be the Google user ID
            'email': user_info['email'],
            'exp': time.time() + 3600,  # Expiration time. This is in Unix timestamp format. This token will expire in 1 hour.
        }

        secret = settings.SECRET_KEY  # Use Django's secret key to sign the JWT

        token = jwt.encode(payload, secret, algorithm='HS256')

        return Response({'jwt': token})
