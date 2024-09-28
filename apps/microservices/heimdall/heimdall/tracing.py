"""Module for setting up tracing SDK."""
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter  # noqa: I001
from opentelemetry.sdk.resources import Resource  # noqa: I005
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor  # noqa: I001

from heimdall.config import settings

provider = TracerProvider(resource=Resource.create({'service.name': settings.service_name}))
span_processor = BatchSpanProcessor(OTLPSpanExporter(endpoint=settings.oltp_traces_endpoint))

provider.add_span_processor(span_processor)
trace.set_tracer_provider(provider)
tracer = trace.get_tracer(__name__)
