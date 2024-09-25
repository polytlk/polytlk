import time

from drf_spectacular.openapi import AutoSchema
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.status import HTTP_400_BAD_REQUEST
from rest_framework.views import APIView
import requests

from heimdall.tyk.request_builder import TykRequestBuilder
from heimdall.config import settings

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

        if tyk_key and tyk_key_exp and current_time < tyk_key_exp:
            time_left = tyk_key_exp - current_time
            logger.info(f"Tyk key {tyk_key} is valid. Time left: {time_left} seconds.")

            return Response({
                'status': 'success',
                'token': tyk_key,
                'message': 'Valid tyk key found in session',

            })
        else:
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

                request.session['tyk_key'] = key_info['key']
                request.session['tyk_key_exp'] = exp

                # Return the response
                return Response({'token': key_info['key']})

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
