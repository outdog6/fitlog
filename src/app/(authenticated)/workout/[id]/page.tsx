import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";

type PageParams = Promise<{ id: string }>;

export default async function WorkoutSessionDetailPage({
  params,
}: {
  params: PageParams;
}) {
  const { id } = await params;
  const session = await auth();

  const workoutSession = await prisma.workoutSession.findUnique({
    where: { id },
    include: {
      plan: {
        select: { name: true },
      },
      sets: {
        include: {
          exercise: {
            select: { name: true },
          },
        },
        orderBy: { setNumber: "asc" },
      },
    },
  });

  if (!workoutSession || workoutSession.userId !== session?.user?.id) {
    notFound();
  }

  // Group sets by exercise, preserving insertion order
  const groupedExercises: {
    exerciseId: string;
    exerciseName: string;
    sets: typeof workoutSession.sets;
  }[] = [];
  const seen = new Set<string>();

  for (const s of workoutSession.sets) {
    if (!seen.has(s.exerciseId)) {
      seen.add(s.exerciseId);
      groupedExercises.push({
        exerciseId: s.exerciseId,
        exerciseName: s.exercise.name,
        sets: workoutSession.sets.filter((ws) => ws.exerciseId === s.exerciseId),
      });
    }
  }

  const totalSets = workoutSession.sets.length;
  const totalVolume = workoutSession.sets.reduce(
    (sum, s) => sum + s.weight * s.reps,
    0
  );

  const dateStr = workoutSession.date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/workout">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {workoutSession.plan?.name ?? "Free Workout"}
          </h1>
          <p className="text-muted-foreground">{dateStr}</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Total Sets</p>
            <p className="text-2xl font-bold text-foreground">{totalSets}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Total Volume</p>
            <p className="text-2xl font-bold text-foreground">
              {totalVolume.toLocaleString()} kg
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Duration</p>
            <p className="text-2xl font-bold text-foreground">
              {workoutSession.duration != null
                ? `${workoutSession.duration} min`
                : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Per-exercise cards */}
      {groupedExercises.map((group) => (
        <Card key={group.exerciseId}>
          <CardHeader>
            <CardTitle>{group.exerciseName}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Set #</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Reps</TableHead>
                  <TableHead>Volume</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.sets.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.setNumber}</TableCell>
                    <TableCell>{s.weight} kg</TableCell>
                    <TableCell>{s.reps}</TableCell>
                    <TableCell>{(s.weight * s.reps).toLocaleString()} kg</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      {/* Notes card */}
      {workoutSession.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {workoutSession.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
