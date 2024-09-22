"""
ASGI config for heimdall project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from heimdall.tracing import provider
from opentelemetry.instrumentation.django import DjangoInstrumentor
from opentelemetry.instrumentation.asgi import OpenTelemetryMiddleware


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'heimdall.settings')
DjangoInstrumentor().instrument(tracer_provider=provider)

application = get_asgi_application()
application = OpenTelemetryMiddleware(application)