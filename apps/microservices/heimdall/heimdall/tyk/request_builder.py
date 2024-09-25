import time
import math
import json
import jwt
from copy import deepcopy
import logging

from heimdall.config import settings

logger = logging.getLogger(__name__)

EXPIRATION_TIME = 3600
ORG_ID = '5e9d9544a1dcd60001d0ed20'

KEY_REQUEST_TEMPLATE = {  
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

class TykRequestBuilder:
    def __init__(self, request):
        # Use the Django request object to access session or user data
        self.request = request
        self.secret = settings.django_secret
        self.tyk_api_key = settings.tyk_api_key
        self.gateway_host = settings.gateway_host
        self.gateway_port = settings.gateway_port

    def _generate_jwt(self, user_info):
        """Generate a JWT based on user info."""
        exp = math.floor(time.time() + EXPIRATION_TIME)
        payload = {
            'sub': user_info['sub'],
            'exp': exp,
        }
        token = jwt.encode(payload, self.secret, algorithm='HS256')
        return token, exp

    def _extract_signature(self, jwt_token):
        """Extract the signature part of the JWT token."""
        parts = jwt_token.split('.')
        if len(parts) != 3:
            raise ValueError('Invalid JWT token')
        return parts[2]

    def get_user_info_from_session(self):
        """Pull user data from Django session or request user."""
        if self.request.user.is_authenticated:
            return {
                'sub': str(self.request.user.id)
            }
        else:
            raise ValueError('User is not authenticated')

    def create_request_body_and_headers(self, api_details):
        """
        Create the request body and headers for the Tyk call, accepting a list of API ID and name tuples.

        Args:
            api_details (list): A list of tuples where each tuple contains (api_id, api_name).

        Returns:
            tuple: The URL, headers, and request body (as JSON) for the Tyk call.
        """
        # Get user info from session
        user_info = self.get_user_info_from_session()

        # Generate JWT and extract signature
        jwt_token, exp = self._generate_jwt(user_info)
        signature = self._extract_signature(jwt_token)

        # Prepare URL
        url = f'http://{self.gateway_host}:{self.gateway_port}/tyk/keys/{signature}'

        # Prepare headers
        headers = {
            'Content-Type': 'application/json',
            'x-tyk-authorization': self.tyk_api_key,
        }

        # Prepare body by copying the template
        request_body = deepcopy(KEY_REQUEST_TEMPLATE)
        request_body['meta_data'] = {'jwt': jwt_token}
        request_body['expires'] = exp

        # Add access rights for each API tuple (id, readable name)
        for api_id, api_name in api_details:
            request_body['access_rights'][api_id] = {
                'api_name': api_name,
                'api_id': api_id,
                'versions': ['Default'],
            }

        return url, headers, json.dumps(request_body), exp
