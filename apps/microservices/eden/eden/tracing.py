"""Module for setting up tracing SDK."""
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter   # noqa: I001
from opentelemetry.sdk.resources import SERVICE_NAME, Resource  # noqa: I005
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor  # noqa: I001

OTEL_SVC_NAME = 'opentelemetry-collector'
NAMESPACE = 'default'
ENDPOINT = 'http://{0}.{1}.svc.cluster.local/v1/traces'.format(OTEL_SVC_NAME, NAMESPACE)

provider = TracerProvider(resource=Resource.create({SERVICE_NAME: 'eden'}))
span_processor = BatchSpanProcessor(OTLPSpanExporter(endpoint=ENDPOINT))

provider.add_span_processor(span_processor)
trace.set_tracer_provider(provider)
tracer = trace.get_tracer(__name__)
