import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const loggerMocks = vi.hoisted(() => {
  const loggerInstance = {
    info: vi.fn(),
    error: vi.fn(),
  };

  return {
    loggerInstance,
    factory: vi.fn((configuration: unknown) => {
      void configuration;
      return loggerInstance;
    }),
    isoTime: vi.fn(),
    errorSerializer: vi.fn(),
  };
});

vi.mock("server-only", () => ({}));

vi.mock("pino", () => ({
  default: Object.assign(
    loggerMocks.factory,
    {
      stdTimeFunctions: {
        isoTime: loggerMocks.isoTime,
      },
      stdSerializers: {
        err: loggerMocks.errorSerializer,
      },
    },
  ),
}));

type LoggerConfiguration = {
  name: string;
  level: string;
  timestamp: unknown;
  serializers: {
    err: unknown;
  };
  redact: {
    paths: string[];
    censor: string;
  };
  base: {
    service: string;
    environment: string;
  };
};

async function loadLoggerConfiguration() {
  const { logger } = await import(
    "@/lib/logging/logger"
  );

  const configuration =
    loggerMocks.factory.mock.calls[0]?.[0];

  return {
    logger,
    configuration:
      configuration as LoggerConfiguration,
  };
}

describe("logger", () => {
  beforeEach(() => {
    vi.resetModules();
    loggerMocks.factory.mockClear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses debug logging in development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("LOG_LEVEL", undefined);

    const {
      logger,
      configuration,
    } = await loadLoggerConfiguration();

    expect(logger).toBe(
      loggerMocks.loggerInstance,
    );

    expect(configuration).toMatchObject({
      name: "interview-track",
      level: "debug",
      base: {
        service: "interview-track",
        environment: "development",
      },
    });

    expect(configuration.timestamp).toBe(
      loggerMocks.isoTime,
    );

    expect(configuration.serializers.err).toBe(
      loggerMocks.errorSerializer,
    );
  });

  it("uses info logging in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("LOG_LEVEL", undefined);

    const { configuration } =
      await loadLoggerConfiguration();

    expect(configuration.level).toBe("info");
    expect(configuration.base.environment).toBe(
      "production",
    );
  });

  it("uses development when NODE_ENV is missing", async () => {
    vi.stubEnv("NODE_ENV", undefined);
    vi.stubEnv("LOG_LEVEL", undefined);

    const { configuration } =
      await loadLoggerConfiguration();

    expect(configuration.level).toBe("debug");
    expect(configuration.base.environment).toBe(
      "development",
    );
  });

  it("allows LOG_LEVEL to override the default", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("LOG_LEVEL", "warn");

    const { configuration } =
      await loadLoggerConfiguration();

    expect(configuration.level).toBe("warn");
  });

  it("redacts sensitive data", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("LOG_LEVEL", undefined);

    const { configuration } =
      await loadLoggerConfiguration();

    expect(configuration.redact.censor).toBe(
      "[REDACTED]",
    );

    expect(
      configuration.redact.paths,
    ).toEqual(
      expect.arrayContaining([
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
      ]),
    );
  });
});