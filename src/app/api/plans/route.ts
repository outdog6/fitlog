import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const exercises = await prisma.exercise.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        primaryMuscle: true,
        equipment: true,
        isPreset: true,
      },
    });
    return NextResponse.json(exercises);
  } catch (error) {
    console.error("Error fetching exercises:", error);
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
    const { name, description, templateId } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const plan = await prisma.trainingPlan.create({
      data: {
        name,
        description: description || null,
        userId: session.user.id,
      },
    });

    // If a templateId was provided, clone its PlanExercises
    if (templateId) {
      const templatePlan = await prisma.trainingPlan.findUnique({
        where: { id: templateId },
        include: {
          planExercises: {
            select: {
              exerciseId: true,
              weekNumber: true,
              dayOfWeek: true,
              order: true,
              targetSets: true,
              targetReps: true,
            },
          },
        },
      });

      if (templatePlan && templatePlan.planExercises.length > 0) {
        await prisma.planExercise.createMany({
          data: templatePlan.planExercises.map((pe) => ({
            planId: plan.id,
            exerciseId: pe.exerciseId,
            weekNumber: pe.weekNumber,
            dayOfWeek: pe.dayOfWeek,
            order: pe.order,
            targetSets: pe.targetSets,
            targetReps: pe.targetReps,
          })),
        });
      }
    }

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    console.error("Error creating plan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
