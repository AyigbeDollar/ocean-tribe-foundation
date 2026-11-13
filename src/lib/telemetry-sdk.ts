import { HoneycombWebSDK } from '@honeycombio/opentelemetry-web';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import type { Span } from '@opentelemetry/api';

/**
 * Loaded on demand by telemetry.ts. Captures page loads, Core Web Vitals,
 * uncaught errors and every fetch (Supabase REST/Auth/Storage/Edge Functions,
 * Paystack), tagged with which Supabase resource was called.
 */
export function startSdk(opts: { apiKey: string; serviceName: string; endpoint?: string }) {
  const sdk = new HoneycombWebSDK({
    apiKey: opts.apiKey,
    serviceName: opts.serviceName,
    ...(opts.endpoint ? { endpoint: opts.endpoint } : {}),
    resourceAttributes: {
      'deployment.environment': import.meta.env.MODE,
    },
    instrumentations: [
      getWebAutoInstrumentations({
        // Clicks generate a lot of low-value spans; page loads and fetches
        // carry the useful signal.
        '@opentelemetry/instrumentation-user-interaction': { enabled: false },
        '@opentelemetry/instrumentation-xml-http-request': { enabled: false },
        '@opentelemetry/instrumentation-fetch': {
          // Trace headers are NOT sent to other origins (keeps Supabase/
          // Paystack CORS untouched); spans are still recorded client-side.
          applyCustomAttributesOnSpan: (span: Span, request: Request | RequestInit) => {
            // fetch(url, init) only hands us `init`; the instrumentation has
            // already put the URL on the span, so read it back from there.
            const attrs = (span as unknown as { attributes?: Record<string, unknown> }).attributes;
            const url =
              request instanceof Request
                ? request.url
                : String(attrs?.['url.full'] ?? attrs?.['http.url'] ?? '');
            if (url) tagRequest(span, url);
          },
        },
      }),
    ],
  });
  sdk.start();
}

/** Group fetch spans by Supabase API + resource, and drop query strings. */
function tagRequest(span: Span, rawUrl: string) {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return;
  }
  const clean = `${url.origin}${url.pathname}`;
  span.setAttributes({ 'http.url': clean, 'url.full': clean });

  const m = url.pathname.match(/^\/(rest|auth|functions|storage|realtime)\/v1\/([^/]+)/);
  if (m) {
    span.setAttributes({ 'app.supabase.api': m[1], 'app.supabase.resource': m[2] });
    span.updateName(`supabase ${m[1]} ${m[2]}`);
  }
}
