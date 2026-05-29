"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SetLogger } from "@/components/set-logger";
import { Loader2 } from "lucide-react";

interface PlanExercise {
  id: string;
  exerciseId: string;
  exercise: { name: string };
}

interface RecordedSet {
  exerciseId: string;
  weight: number;
  reps: number;
  setNumber: number;
}

function WorkoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("plan");

  const [exercises, setExercises] = useState<PlanExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [recordedSets, setRecordedSets] = useState<RecordedSet[]>([]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!planId) {
      setLoading(false);
      return;
    }

    async function fetchExercises() {
      try {
        const res = await fetch(`/api/workout?planId=${encodeURIComponent(planId!)}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to fetch plan exercises");
        }
        const data: PlanExercise[] = await res.json();
        setExercises(data);
      } catch (err) {
        setFetchError(
          err instanceof Error ? err.message : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchExercises();
  }, [planId]);

  const handleSetRecorded = useCallback(
    (exerciseId: string, weight: number, reps: number, setNumber: number) => {
      setRecordedSets((prev) => [
        ...prev,
        { exerciseId, weight, reps, setNumber },
      ]);
    },
    []
  );

  async function handleFinish() {
    if (recordedSets.length === 0) return;
    setSubmitting(true);
    setFetchError(null);

    try {
      const res = await fetch("/api/workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: planId || null,
          sets: recordedSets,
          notes: notes.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save workout");
      }

      const session = await res.json();
      router.push(`/workout/${session.id}`);
    } catch (err) {
      setFetchError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setSubmitting(false);
    }
  }

  // No planId: show guidance message
  if (!planId) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-foreground">Start Workout</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Select a plan from the{" "}
              <Link href="/plans" className="text-primary underline">
                Plans page
              </Link>{" "}
              to start a guided workout.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Loading workout...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Active Workout</h1>
        <p className="text-muted-foreground">Record your sets as you go</p>
      </div>

      {fetchError && (
        <p className="text-sm text-destructive">{fetchError}</p>
      )}

      {exercises.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            This plan has no exercises assigned yet.
          </CardContent>
        </Card>
      ) : (
        exercises.map((pe) => (
          <Card key={pe.id}>
            <CardContent className="pt-4">
              <SetLogger
                exerciseName={pe.exercise.name}
                exerciseId={pe.exerciseId}
                onSetRecorded={handleSetRecorded}
              />
            </CardContent>
          </Card>
        ))
      )}

      {exercises.length > 0 && (
        <>
          <Separator />

          <div className="flex flex-col gap-2">
            <label
              htmlFor="workout-notes"
              className="text-sm font-medium leading-none"
            >
              Notes
            </label>
            <textarea
              id="workout-notes"
              placeholder="How did it feel? Any notes for this session..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 md:text-sm dark:bg-input/30"
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleFinish}
              disabled={recordedSets.length === 0 || submitting}
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              Finish Workout
              {recordedSets.length > 0 && ` (${recordedSets.length} sets)`}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function WorkoutLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  );
}

export default function WorkoutPage() {
  return (
    <Suspense fallback={<WorkoutLoading />}>
      <WorkoutContent />
    </Suspense>
  );
}
