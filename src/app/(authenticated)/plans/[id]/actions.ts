"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function deletePlanExercise(id: string) {
  await prisma.planExercise.delete({ where: { id } });
  revalidatePath("/plans");
}

export async function addPlanExercise(formData: FormData) {
  const planId = formData.get("planId") as string;
  const exerciseId = formData.get("exerciseId") as string;
  const weekNumber = parseInt(formData.get("weekNumber") as string);
  const dayOfWeek = parseInt(formData.get("dayOfWeek") as string);
  const targetSets = parseInt(formData.get("targetSets") as string);
  const targetReps = formData.get("targetReps") as string;

  if (!planId || !exerciseId || isNaN(weekNumber) || isNaN(dayOfWeek) || isNaN(targetSets) || !targetReps) {
    return;
  }

  const last = await prisma.planExercise.findFirst({
    where: { planId, weekNumber, dayOfWeek },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const nextOrder = (last?.order ?? -1) + 1;

  await prisma.planExercise.create({
    data: { planId, exerciseId, weekNumber, dayOfWeek, order: nextOrder, targetSets, targetReps },
  });

  revalidatePath("/plans");
}
