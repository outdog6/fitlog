import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Muscle, Equipment } from "@/generated/prisma/client";

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
    const { name, primaryMuscle, equipment, description, instructions } = body;

    if (!name || !primaryMuscle || !equipment) {
      return NextResponse.json(
        { error: "Name, primary muscle, and equipment are required" },
        { status: 400 }
      );
    }

    // Validate muscle enum
    const validMuscles: Muscle[] = [
      "chest",
      "back",
      "legs",
      "shoulders",
      "arms",
      "core",
    ];
    if (!validMuscles.includes(primaryMuscle as Muscle)) {
      return NextResponse.json(
        { error: "Invalid muscle group" },
        { status: 400 }
      );
    }

    // Validate equipment enum
    const validEquipment: Equipment[] = [
      "barbell",
      "dumbbell",
      "cable",
      "bodyweight",
      "machine",
    ];
    if (!validEquipment.includes(equipment as Equipment)) {
      return NextResponse.json(
        { error: "Invalid equipment type" },
        { status: 400 }
      );
    }

    const exercise = await prisma.exercise.create({
      data: {
        name,
        primaryMuscle: primaryMuscle as Muscle,
        equipment: equipment as Equipment,
        description: description || "",
        instructions: instructions || "",
        isPreset: false,
        userId: session.user.id,
      },
    });

    return NextResponse.json(exercise, { status: 201 });
  } catch (error) {
    console.error("Error creating exercise:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
