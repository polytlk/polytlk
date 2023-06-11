"""Module for setting up tracing SDK."""
from opentelemetry import trace
from opentelemetry.sdk.resources import SERVICE_NAME, Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor  # noqa: I001
from opentelemetry.sdk.trace.export import ConsoleSpanExporter

provider = TracerProvider(resource=Resource.create({SERVICE_NAME: 'eden'}))
span_processor = BatchSpanProcessor(ConsoleSpanExporter())

provider.add_span_processor(span_processor)
trace.set_tracer_provider(provider)
tracer = trace.get_tracer(__name__)
