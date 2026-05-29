import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ExerciseFilter } from "@/components/exercise-filter";
import { ExerciseCard } from "@/components/exercise-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import type { Muscle, Equipment } from "@/generated/prisma/client";

type SearchParams = Promise<{ muscle?: string; equipment?: string }>;

export default async function ExercisesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  const params = await searchParams;
  const muscleFilter = params.muscle;
  const equipmentFilter = params.equipment;

  const validMuscles: Muscle[] = [
    "chest",
    "back",
    "legs",
    "shoulders",
    "arms",
    "core",
  ];
  const validEquipment: Equipment[] = [
    "barbell",
    "dumbbell",
    "cable",
    "bodyweight",
    "machine",
  ];

  // Build WHERE clause
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    OR: [{ isPreset: true }],
  };

  if (session?.user?.id) {
    where.OR.push({ userId: session.user.id });
  }

  if (
    muscleFilter &&
    muscleFilter !== "all" &&
    validMuscles.includes(muscleFilter as Muscle)
  ) {
    where.primaryMuscle = muscleFilter;
  }

  if (
    equipmentFilter &&
    equipmentFilter !== "all" &&
    validEquipment.includes(equipmentFilter as Equipment)
  ) {
    where.equipment = equipmentFilter;
  }

  // Fetch preset exercises and user's custom exercises
  const exercises = await prisma.exercise.findMany({
    where,
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      primaryMuscle: true,
      equipment: true,
      userId: true,
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">动作库</h1>
          <p className="text-muted-foreground">
            浏览和管理训练动作
          </p>
        </div>
        <Link href="/exercises/new">
          <Button>
            <Plus className="size-4" />
            添加动作
          </Button>
        </Link>
      </div>

      <ExerciseFilter />

      {exercises.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <p className="text-lg">未找到动作</p>
          <p className="text-sm">
            尝试调整筛选条件或创建新动作
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              isOwner={exercise.userId === session?.user?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
