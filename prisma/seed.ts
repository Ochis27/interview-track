import dotenv from "dotenv";
import { resolve } from "node:path";
import { PrismaNeon } from "@prisma/adapter-neon";

import { PrismaClient } from "../generated/prisma/client";
import * as data from "./seed/data";

dotenv.config({
  path: resolve(process.cwd(), ".env"),
});

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function seedUser() {
  await prisma.user.upsert({
    where: { id: data.USER.id },
    update: {
      name: data.USER.name,
      email: data.USER.email,
      role: data.USER.role,
    },
    create: {
      id: data.USER.id,
      name: data.USER.name,
      email: data.USER.email,
      role: data.USER.role,
    },
  });
}

async function seedCandidates() {
  await Promise.all(
    data.CANDIDATES.map((candidate) =>
      prisma.candidate.upsert({
        where: { id: candidate.id },
        update: {
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          email: candidate.email,
          targetRole: candidate.targetRole,
          seniority: candidate.seniority,
          yearsExperience: candidate.yearsExperience,
          createdById: data.USER.id,
        },
        create: {
          id: candidate.id,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          email: candidate.email,
          targetRole: candidate.targetRole,
          seniority: candidate.seniority,
          yearsExperience: candidate.yearsExperience,
          createdById: data.USER.id,
        },
      }),
    ),
  );
}

async function seedInterviews() {
  await Promise.all(
    data.INTERVIEWS.map((interview) => {
      const scheduledAt = data.daysFromNow(
        interview.scheduledAtOffset,
      );

      const completedAt =
        interview.status === "COMPLETED"
          ? new Date(
              scheduledAt.getTime() +
                interview.durationMinutes * 60 * 1000,
            )
          : null;

      return prisma.interviewSession.upsert({
        where: { id: interview.id },
        update: {
          title: interview.title,
          type: interview.type,
          status: interview.status,
          scheduledAt,
          durationMinutes: interview.durationMinutes,
          notes: interview.notes,
          candidateId: interview.candidateId,
          interviewerId: interview.interviewerId,
          completedAt,
        },
        create: {
          id: interview.id,
          title: interview.title,
          type: interview.type,
          status: interview.status,
          scheduledAt,
          durationMinutes: interview.durationMinutes,
          notes: interview.notes,
          candidateId: interview.candidateId,
          interviewerId: interview.interviewerId,
          completedAt,
        },
      });
    }),
  );
}

async function seedFeedback() {
  await Promise.all(
    data.FEEDBACKS.map((feedback) =>
      prisma.feedback.upsert({
        where: { id: feedback.id },
        update: {
          strengths: feedback.strengths,
          improvementAreas: feedback.improvementAreas,
          recommendation: feedback.recommendation,
          overallScore: feedback.overallScore,
          technicalScore: feedback.technicalScore,
          communicationScore: feedback.communicationScore,
          additionalNotes: feedback.additionalNotes,
          interviewSessionId: feedback.interviewSessionId,
          authorId: feedback.authorId,
        },
        create: {
          id: feedback.id,
          strengths: feedback.strengths,
          improvementAreas: feedback.improvementAreas,
          recommendation: feedback.recommendation,
          overallScore: feedback.overallScore,
          technicalScore: feedback.technicalScore,
          communicationScore: feedback.communicationScore,
          additionalNotes: feedback.additionalNotes,
          interviewSessionId: feedback.interviewSessionId,
          authorId: feedback.authorId,
        },
      }),
    ),
  );
}

async function seedAuditLogs() {
  await Promise.all(
    data.AUDIT_LOGS.map((auditLog) =>
      prisma.auditLog.upsert({
        where: { id: auditLog.id },
        update: {
          level: auditLog.level,
          action: auditLog.action,
          entityType: auditLog.entityType,
          entityId: auditLog.entityId,
          message: auditLog.message,
          userId: auditLog.userId,
        },
        create: {
          id: auditLog.id,
          level: auditLog.level,
          action: auditLog.action,
          entityType: auditLog.entityType,
          entityId: auditLog.entityId,
          message: auditLog.message,
          userId: auditLog.userId,
        },
      }),
    ),
  );
}

async function getEntityCounts() {
  const [
    users,
    candidates,
    interviews,
    feedback,
    auditLogs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.candidate.count(),
    prisma.interviewSession.count(),
    prisma.feedback.count(),
    prisma.auditLog.count(),
  ]);

  return {
    users,
    candidates,
    interviews,
    feedback,
    auditLogs,
  };
}

async function main() {
  try {
    await seedUser();
    await seedCandidates();
    await seedInterviews();
    await seedFeedback();
    await seedAuditLogs();

    const counts = await getEntityCounts();

    console.log("Database seed completed successfully.");
    console.table(counts);
  } catch (error: unknown) {
    console.error("Database seed failed.", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void main();