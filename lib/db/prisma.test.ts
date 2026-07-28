import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const prismaMocks = vi.hoisted(() => ({
  adapterInstance: {
    name: "mock-neon-adapter",
  },
  clientInstance: {
    name: "mock-prisma-client",
  },
  createAdapter: vi.fn(),
  createClient: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@prisma/adapter-neon", () => ({
  PrismaNeon: function PrismaNeon(
    options: { connectionString: string },
  ) {
    prismaMocks.createAdapter(options);
    return prismaMocks.adapterInstance;
  },
}));

vi.mock("@/generated/prisma/client", () => ({
  PrismaClient: function PrismaClient(
    options: { adapter: unknown },
  ) {
    prismaMocks.createClient(options);
    return prismaMocks.clientInstance;
  },
}));

type GlobalWithPrisma = typeof globalThis & {
  prisma?: unknown;
};

const prismaGlobal = globalThis as GlobalWithPrisma;

describe("Prisma client", () => {
  beforeEach(() => {
    vi.resetModules();
    prismaMocks.createAdapter.mockClear();
    prismaMocks.createClient.mockClear();
    delete prismaGlobal.prisma;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    delete prismaGlobal.prisma;
  });

  it("throws when DATABASE_URL is missing", async () => {
    vi.stubEnv("DATABASE_URL", undefined);
    vi.stubEnv("NODE_ENV", "development");

    await expect(
      import("@/lib/db/prisma"),
    ).rejects.toThrow(
      "DATABASE_URL is not configured.",
    );

    expect(
      prismaMocks.createAdapter,
    ).not.toHaveBeenCalled();

    expect(
      prismaMocks.createClient,
    ).not.toHaveBeenCalled();
  });

  it("creates a client using the Neon adapter", async () => {
    const connectionString =
      "postgresql://test:test@localhost:5432/test";

    vi.stubEnv("DATABASE_URL", connectionString);
    vi.stubEnv("NODE_ENV", "development");

    const { prisma } = await import("@/lib/db/prisma");

    expect(
      prismaMocks.createAdapter,
    ).toHaveBeenCalledWith({
      connectionString,
    });

    expect(
      prismaMocks.createClient,
    ).toHaveBeenCalledWith({
      adapter: prismaMocks.adapterInstance,
    });

    expect(prisma).toBe(
      prismaMocks.clientInstance,
    );

    expect(prismaGlobal.prisma).toBe(
      prismaMocks.clientInstance,
    );
  });

  it("reuses the global client", async () => {
    const existingClient = {
      name: "existing-prisma-client",
    };

    prismaGlobal.prisma = existingClient;

    vi.stubEnv("DATABASE_URL", undefined);
    vi.stubEnv("NODE_ENV", "development");

    const { prisma } = await import("@/lib/db/prisma");

    expect(prisma).toBe(existingClient);

    expect(
      prismaMocks.createAdapter,
    ).not.toHaveBeenCalled();

    expect(
      prismaMocks.createClient,
    ).not.toHaveBeenCalled();
  });

  it("does not cache the client in production", async () => {
    vi.stubEnv(
      "DATABASE_URL",
      "postgresql://test:test@localhost:5432/test",
    );
    vi.stubEnv("NODE_ENV", "production");

    const { prisma } = await import("@/lib/db/prisma");

    expect(prisma).toBe(
      prismaMocks.clientInstance,
    );

    expect(
      prismaGlobal.prisma,
    ).toBeUndefined();
  });
});