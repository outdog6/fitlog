"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function deleteWorkoutSession(sessionId: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  const workout = await prisma.workoutSession.findUnique({
    where: { id: sessionId },
    select: { userId: true },
  });

  if (!workout || workout.userId !== session.user.id) return;

  await prisma.workoutSession.delete({ where: { id: sessionId } });
  revalidatePath("/dashboard");
}
