import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const plan = await prisma.trainingPlan.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        isTemplate: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        planExercises: {
          select: {
            id: true,
            exerciseId: true,
            weekNumber: true,
            dayOfWeek: true,
            order: true,
            targetSets: true,
            targetReps: true,
            exercise: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: [
            { weekNumber: "asc" },
            { dayOfWeek: "asc" },
            { order: "asc" },
          ],
        },
      },
    });

    if (!plan) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error("Error fetching plan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
