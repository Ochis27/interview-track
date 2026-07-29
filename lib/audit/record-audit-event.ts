import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import {
  AuditLevel,
} from "@/generated/prisma/enums";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logging/logger";

export type RecordAuditEventInput = {
  action: string;
  entityType: string;
  entityId?: string | null;
  message: string;
  level?: AuditLevel;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string | null;
  userId?: string | null;
};

export async function recordAuditEvent({
  action,
  entityType,
  entityId,
  message,
  level = AuditLevel.INFO,
  metadata,
  ipAddress,
  userId,
}: RecordAuditEventInput): Promise<void> {
  try {
    const auditLog = await prisma.auditLog.create({
      data: {
        action,
        entityType,
        entityId: entityId ?? null,
        message,
        level,
        metadata,
        ipAddress: ipAddress ?? null,
        userId: userId ?? null,
      },
      select: {
        id: true,
      },
    });

    logger.debug(
      {
        action: "audit_event_recorded",
        auditAction: action,
        auditLogId: auditLog.id,
        entityId: entityId ?? null,
        entityType,
      },
      "Audit event recorded.",
    );
  } catch (error) {
    /*
     * Audit persistence is intentionally best-effort.
     * A failed audit write must not make an already
     * completed business operation appear unsuccessful.
     */
    logger.error(
      {
        action: "audit_event_failed",
        auditAction: action,
        entityId: entityId ?? null,
        entityType,
        err: error,
      },
      "Unable to record audit event.",
    );
  }
}