const opentelemetry = require('@opentelemetry/api');
const { BasicTracerProvider, SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { OTLPTraceExporter } =  require('@opentelemetry/exporter-trace-otlp-proto');
const { Resource } = require('@opentelemetry/resources');
const { diag, DiagConsoleLogger, DiagLogLevel, context } = require('@opentelemetry/api');

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.VERBOSE);

const collectorOptions = {
    url: 'https://fra-sls-agent-api.saas.appdynamics.com:443/v1/traces', // url is optional and can be omitted - default is http://localhost:4318/v1/traces
    headers: {
        'x-api-key': '<API-KEY>'
    }, //an optional object containing custom headers to be sent with each request will only work with http
};

// To start a trace, you first need to initialize the Tracer provider.
// NOTE: The default OpenTelemetry tracer provider does not record any tracing information.
//       Registering a working tracer provider allows the API methods to record traces.
const provider = new BasicTracerProvider({
    resource: new Resource({
      'service.name': 'emp',
      'appdynamics.controller.account': 'postnl',
      'appdynamics.controller.host': 'postnl.saas.appdynamics.com',
      'appdynamics.controller.port': 443,
      'service.namespace': 'emp',
    }),
  });
const exporter = new OTLPTraceExporter(collectorOptions);

provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
provider.register();

// To create a span in a trace, we used the global singleton tracer to start a new span.
const span = opentelemetry.trace.getTracer('default').startSpan('foo');

// Set a span attribute
span.setAttribute('key', 'value');

// We must end the spans so they become available for exporting.
span.end();