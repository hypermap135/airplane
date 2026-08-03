import * as Sentry from "@sentry/nextjs";

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (DSN) {
  Sentry.init({
    dsn: DSN,
    // Sampling — sur un shop naissant on garde 100% pour ne rien rater.
    // Passer à 0.2 (20%) quand le trafic dépassera 10k pageviews/jour.
    tracesSampleRate: 1.0,
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0,
    environment: process.env.NODE_ENV,
    // Ignore les erreurs de scripts tiers (adblockers, extensions Chrome)
    ignoreErrors: [
      "ResizeObserver loop limit exceeded",
      "Non-Error promise rejection captured",
      "top.GLOBALS",
    ],
    denyUrls: [
      /extensions\//i,
      /^chrome:\/\//i,
      /^moz-extension:\/\//i,
    ],
  });
}
