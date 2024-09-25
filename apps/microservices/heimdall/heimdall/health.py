import logging
import json
import time
import datetime

from drf_spectacular.openapi import AutoSchema
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.status import HTTP_400_BAD_REQUEST
from rest_framework.views import APIView
import requests


from heimdall.tyk.request_builder import TykRequestBuilder
from heimdall.config import settings


logger = logging.getLogger(__name__)



def get_session_expiry_info(request):
    """Get session expiry info from the request."""
    # Get the remaining time for the session to expire (in seconds)
    expiry_age = request.session.get_expiry_age()

    # Get the exact expiry date/time for the session
    expiry_date = request.session.get_expiry_date()

    # Calculate the remaining time from now
    now = datetime.datetime.now(datetime.timezone.utc)
    time_left = expiry_date - now

    return {
        'expiry_age': expiry_age,
        'expiry_date': expiry_date.isoformat(),  # Convert datetime to string
        'time_left': str(time_left),  # timedelta to string
    }


class Liveness(APIView):
    permission_classes = [AllowAny]
    schema = AutoSchema()

    def get(self, request, format=None):
        return Response('ok')

class Test(APIView):
    permission_classes = [AllowAny]
    schema = AutoSchema()

    def get(self, request, format=None):
        tyk_key = request.session.get('tyk_key')
        tyk_key_exp = request.session.get('tyk_key_exp')

        current_time = time.time()

        time_left = tyk_key_exp - current_time

        if tyk_key and tyk_key_exp and current_time < tyk_key_exp:
            logger.info(f"Tyk key {tyk_key} is valid. Time left: {time_left} seconds.")

            return Response({
                'status': 'success',
                'message': 'Valid tyk key found in session',

            })
        else:
            # Log that the key has expired
            logger.info("Tyk key has expired.")
    
            # Log the whole session object
            logger.info('Session data: {0}'.format(json.dumps(dict(request.session), indent=2)))

            session_expiry_info = get_session_expiry_info(request)

            logger.info('session_expiry_info: {0}'.format(json.dumps(session_expiry_info, indent=2)))

            # Log user ID if available
            if "_auth_user_id" in request.session:
                logger.info('User ID: {0}'.format(request.session["_auth_user_id"]))
            else:
                logger.info('User is not authenticated or no user ID found in session.')


            try:
                # Create an instance of TykRequestBuilder with the request object
                builder = TykRequestBuilder(request)

                # Example list of API IDs and readable names
                api_details = [
                    (settings.eden_api_id, 'eden-api'),
                ]

                # Generate the Tyk request body and headers with the list of API details (id, name)
                url, headers, body, exp = builder.create_request_body_and_headers(api_details)

                # Make the request to Tyk
                response = requests.post(url, headers=headers, data=body)
                response.raise_for_status()

                key_info = response.json()

                logger.info('key -> {0} '.format(key_info['key']))
                logger.info('key expires -> {0}'.format(exp))

                request.session['tyk_key'] = key_info['key']
                request.session['tyk_key_exp'] = exp

                # Return the response
                return Response('ok')

            except ValueError as e:
                return Response({'error': str(e)}, status=400)


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
