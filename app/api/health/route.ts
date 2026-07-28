import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logging/logger";

const ROUTE = "/api/health";

export async function GET() {
  const startedAt = performance.now();

  try {
    await prisma.$queryRaw`SELECT 1`;

    logger.debug(
      {
        route: ROUTE,
        durationMs: Math.round(performance.now() - startedAt),
      },
      "Database health check completed.",
    );

    return NextResponse.json({
      status: "ok",
      database: "connected",
    });
  } catch (error: unknown) {
    logger.error(
      {
        err: error,
        route: ROUTE,
        durationMs: Math.round(performance.now() - startedAt),
      },
      "Database health check failed.",
    );

    return NextResponse.json(
      {
        status: "error",
        database: "unavailable",
      },
      { status: 503 },
    );
  }
}