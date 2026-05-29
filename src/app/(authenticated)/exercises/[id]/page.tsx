import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const muscleColors: Record<string, string> = {
  chest: "bg-red-500/20 text-red-400",
  back: "bg-blue-500/20 text-blue-400",
  legs: "bg-green-500/20 text-green-400",
  shoulders: "bg-yellow-500/20 text-yellow-400",
  arms: "bg-purple-500/20 text-purple-400",
  core: "bg-pink-500/20 text-pink-400",
};

const equipmentColors: Record<string, string> = {
  barbell: "bg-orange-500/20 text-orange-400",
  dumbbell: "bg-cyan-500/20 text-cyan-400",
  cable: "bg-emerald-500/20 text-emerald-400",
  bodyweight: "bg-violet-500/20 text-violet-400",
  machine: "bg-slate-500/20 text-slate-400",
};

type Params = Promise<{ id: string }>;

export default async function ExerciseDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;

  const exercise = await prisma.exercise.findUnique({
    where: { id },
  });

  if (!exercise) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <Link href="/exercises">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="size-4" />
          Back to Exercises
        </Button>
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {exercise.name}
        </h1>
        <div className="flex gap-2 mt-3">
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
              muscleColors[exercise.primaryMuscle] || "bg-muted text-muted-foreground"
            }`}
          >
            {exercise.primaryMuscle}
          </span>
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
              equipmentColors[exercise.equipment] || "bg-muted text-muted-foreground"
            }`}
          >
            {exercise.equipment}
          </span>
        </div>
      </div>

      {exercise.imageUrl && (
        <img
          src={exercise.imageUrl}
          alt={exercise.name}
          className="rounded-xl w-full max-h-64 object-cover"
        />
      )}

      {exercise.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{exercise.description}</p>
          </CardContent>
        </Card>
      )}

      {exercise.instructions && (
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-muted-foreground whitespace-pre-wrap font-sans">
              {exercise.instructions}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
