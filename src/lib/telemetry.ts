import { trace, SpanStatusCode, type Attributes, type Span } from '@opentelemetry/api';

/**
 * Browser tracing → Honeycomb (OpenTelemetry).
 *
 * This file is tiny and always bundled. The SDK itself lives in
 * telemetry-sdk.ts and is only downloaded when VITE_HONEYCOMB_API_KEY is set,
 * so without a key nothing is loaded or sent.
 *
 * Never put customer PII (names, phone numbers, emails, addresses) in
 * attributes.
 */
const SERVICE_NAME = 'ocean-tribe-foundation';
const tracer = trace.getTracer(SERVICE_NAME);

export function telemetryEnabled(): boolean {
  return Boolean(import.meta.env.VITE_HONEYCOMB_API_KEY);
}

/** Starts the SDK if configured. Resolves quickly either way; never throws. */
export async function initTelemetry(): Promise<void> {
  const apiKey = import.meta.env.VITE_HONEYCOMB_API_KEY as string | undefined;
  if (!apiKey) return;
  try {
    const { startSdk } = await import('./telemetry-sdk');
    startSdk({
      apiKey,
      serviceName: (import.meta.env.VITE_OTEL_SERVICE_NAME as string) || SERVICE_NAME,
      endpoint: import.meta.env.VITE_HONEYCOMB_ENDPOINT as string | undefined,
    });
  } catch (err) {
    console.warn('Telemetry failed to start', err);
  }
}

/**
 * Wrap a business step (e.g. payment verification) in a span. Marks the span
 * as an error when `fn` throws; use `fail()` inside `fn` for handled failures.
 */
export async function withSpan<T>(
  name: string,
  attributes: Attributes,
  fn: (span: Span) => Promise<T>
): Promise<T> {
  return tracer.startActiveSpan(name, { attributes }, async (span) => {
    try {
      return await fn(span);
    } catch (err) {
      fail(span, `${name}.exception`, err);
      throw err;
    } finally {
      span.end();
    }
  });
}

/** Mark a span as failed with a stable, groupable slug. */
export function fail(span: Span, slug: string, err?: unknown): void {
  span.setAttributes({ error: true, 'exception.slug': slug });
  if (err instanceof Error) {
    span.recordException(err);
    span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
  } else {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: typeof err === 'string' ? err : slug,
    });
  }
}

/** Record a one-off moment (e.g. a customer closing the payment popup). */
export function recordEvent(name: string, attributes: Attributes = {}): void {
  tracer.startSpan(name, { attributes }).end();
}
