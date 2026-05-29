import { NextResponse } from "next/server";

const sql = `
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Session" (
  "id" TEXT PRIMARY KEY,
  "sessionToken" TEXT NOT NULL UNIQUE,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "expires" TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "Exercise" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "primaryMuscle" TEXT NOT NULL,
  "secondaryMuscles" TEXT NOT NULL DEFAULT '[]',
  "equipment" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "instructions" TEXT NOT NULL DEFAULT '',
  "imageUrl" TEXT,
  "isPreset" BOOLEAN NOT NULL DEFAULT false,
  "userId" TEXT REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "TrainingPlan" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "isTemplate" BOOLEAN NOT NULL DEFAULT false,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "PlanExercise" (
  "id" TEXT PRIMARY KEY,
  "planId" TEXT NOT NULL REFERENCES "TrainingPlan"("id") ON DELETE CASCADE,
  "exerciseId" TEXT NOT NULL REFERENCES "Exercise"("id"),
  "weekNumber" INTEGER NOT NULL,
  "dayOfWeek" INTEGER NOT NULL,
  "order" INTEGER NOT NULL,
  "targetSets" INTEGER NOT NULL,
  "targetReps" TEXT NOT NULL DEFAULT '8-12'
);

CREATE TABLE IF NOT EXISTS "WorkoutSession" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "planId" TEXT REFERENCES "TrainingPlan"("id"),
  "date" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "duration" INTEGER,
  "notes" TEXT
);

CREATE TABLE IF NOT EXISTS "WorkoutSet" (
  "id" TEXT PRIMARY KEY,
  "sessionId" TEXT NOT NULL REFERENCES "WorkoutSession"("id") ON DELETE CASCADE,
  "exerciseId" TEXT NOT NULL REFERENCES "Exercise"("id"),
  "setNumber" INTEGER NOT NULL,
  "weight" DOUBLE PRECISION NOT NULL,
  "reps" INTEGER NOT NULL,
  "rpe" DOUBLE PRECISION
);
`;

export async function GET() {
  try {
    const { prisma } = await import("@/lib/prisma");
    for (const stmt of sql.split(";").filter(s => s.trim())) {
      await prisma.$executeRawUnsafe(stmt.trim() + ";");
    }
    return NextResponse.json({ ok: true, message: "Tables created" });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
