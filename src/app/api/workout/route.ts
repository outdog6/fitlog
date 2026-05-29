import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const planId = searchParams.get("planId");

    if (!planId) {
      return NextResponse.json(
        { error: "planId query parameter is required" },
        { status: 400 }
      );
    }

    const planExercises = await prisma.planExercise.findMany({
      where: { planId },
      include: {
        exercise: {
          select: { name: true },
        },
      },
      orderBy: [{ dayOfWeek: "asc" }, { order: "asc" }],
    });

    return NextResponse.json(planExercises);
  } catch (error) {
    console.error("Error fetching plan exercises:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { planId, sets, notes } = body;

    if (!sets || !Array.isArray(sets) || sets.length === 0) {
      return NextResponse.json(
        { error: "At least one set is required" },
        { status: 400 }
      );
    }

    // Validate each set
    for (const s of sets) {
      if (
        !s.exerciseId ||
        typeof s.weight !== "number" ||
        typeof s.reps !== "number" ||
        typeof s.setNumber !== "number"
      ) {
        return NextResponse.json(
          {
            error:
              "Each set must have exerciseId (string), weight (number), reps (number), and setNumber (number)",
          },
          { status: 400 }
        );
      }
      if (s.weight <= 0 || s.reps <= 0 || s.setNumber <= 0) {
        return NextResponse.json(
          { error: "weight, reps, and setNumber must be positive" },
          { status: 400 }
        );
      }
    }

    // Create the workout session
    const workoutSession = await prisma.workoutSession.create({
      data: {
        userId: session.user.id,
        planId: planId || null,
        notes: notes || null,
      },
    });

    // Create all workout sets
    await prisma.workoutSet.createMany({
      data: sets.map((s: { exerciseId: string; weight: number; reps: number; setNumber: number }) => ({
        sessionId: workoutSession.id,
        exerciseId: s.exerciseId,
        setNumber: s.setNumber,
        weight: s.weight,
        reps: s.reps,
      })),
    });

    return NextResponse.json(workoutSession, { status: 201 });
  } catch (error) {
    console.error("Error creating workout session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
