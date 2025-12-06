import * as Sentry from "@sentry/bun";
import config from "./config";

if (config.sentry.dsn) {
  Sentry.init({
    dsn: config.sentry.dsn,
    sendDefaultPii: true,
    enableLogs: true,
    integrations: [
      Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
    ],
    tracesSampleRate: 1.0, // Capture 100% of the transactions
  });
} else {
  console.log("No Sentry DSN set, not initializing Sentry");
}
