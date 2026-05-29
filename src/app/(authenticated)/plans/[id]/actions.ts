"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function deletePlanExercise(id: string) {
  await prisma.planExercise.delete({
    where: { id },
  });
  revalidatePath("/plans");
}
