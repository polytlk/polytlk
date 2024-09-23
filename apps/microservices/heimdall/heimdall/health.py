from drf_spectacular.openapi import AutoSchema
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.status import HTTP_400_BAD_REQUEST
from rest_framework.views import APIView
import logging

logger = logging.getLogger(__name__)

class Liveness(APIView):
    permission_classes = [AllowAny]
    schema = AutoSchema()

    def get(self, request, format=None):
        return Response('ok')

class Test(APIView):
    permission_classes = [AllowAny]
    schema = AutoSchema()

    def get(self, request, format=None):
        logger.info('TEST -> session key -> {0}'.format(request.session.session_key))

        for key, value in request.session.items():
            logger.info('TEST -> {} => {}'.format(key, value))

        logger.info('TEST -> NEW session key -> {0}'.format('123456'))
        res = Response('ok')
        return res

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
