import "server-only";

import pino from "pino";

const defaultLogLevel =
  process.env.NODE_ENV === "production" ? "info" : "debug";

export const logger = pino({
  name: "interview-track",
  level: process.env.LOG_LEVEL ?? defaultLogLevel,

  timestamp: pino.stdTimeFunctions.isoTime,

  serializers: {
    err: pino.stdSerializers.err,
  },

  redact: {
    paths: [
      "password",
      "*.password",
      "token",
      "*.token",
      "accessToken",
      "*.accessToken",
      "refreshToken",
      "*.refreshToken",
      "authorization",
      "headers.authorization",
      "req.headers.authorization",
      "cookie",
      "headers.cookie",
      "req.headers.cookie",
      "email",
      "*.email",
      "phone",
      "*.phone",
    ],
    censor: "[REDACTED]",
  },

  base: {
    service: "interview-track",
    environment: process.env.NODE_ENV ?? "development",
  },
});