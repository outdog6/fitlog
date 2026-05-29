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
  lastWeight?: number;
  lastReps?: string;
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
          throw new Error(data.error || "获取计划动作失败");
        }
        const data: PlanExercise[] = await res.json();
        setExercises(data);
      } catch (err) {
        setFetchError(
          err instanceof Error ? err.message : "出了点问题"
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
        throw new Error(data.error || "保存训练失败");
      }

      const session = await res.json();
      router.push(`/workout/${session.id}`);
    } catch (err) {
      setFetchError(
        err instanceof Error ? err.message : "出了点问题"
      );
    } finally {
      setSubmitting(false);
    }
  }

  // No planId: show guidance message
  if (!planId) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-foreground">开始训练</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              从{" "}
              <Link href="/plans" className="text-primary underline">
                训练计划
              </Link>{" "}
              页面选择计划开始指导训练。
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
        <p className="text-muted-foreground">加载训练中...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">当前训练</h1>
        <p className="text-muted-foreground">记录每一组训练</p>
      </div>

      {fetchError && (
        <p className="text-sm text-destructive">{fetchError}</p>
      )}

      {exercises.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            该计划尚未分配动作。
          </CardContent>
        </Card>
      ) : (
        exercises.map((pe) => (
          <Card key={pe.id}>
            <CardContent className="pt-4">
              <SetLogger
                exerciseName={pe.exercise.name}
                exerciseId={pe.exerciseId}
                initialWeight={pe.lastWeight}
                initialReps={pe.lastReps}
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
              备注
            </label>
            <textarea
              id="workout-notes"
              placeholder="感受如何？记录本次训练..."
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
              完成训练
              {recordedSets.length > 0 && ` (${recordedSets.length} 组)`}
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
      <p className="text-muted-foreground">加载中...</p>
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
