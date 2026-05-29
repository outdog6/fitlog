"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Trash2, Minus, Plus, Timer, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface SetRow {
  setNumber: number;
  weight: string;
  reps: string;
  started: boolean;
  completed: boolean;
  restAfter: number | null;
}

interface SetLoggerProps {
  exerciseName: string;
  exerciseId: string;
  initialWeight?: number;
  initialReps?: string;
  onSetRecorded: (exerciseId: string, weight: number, reps: number, setNumber: number) => void;
}

export function SetLogger({ exerciseName, exerciseId, initialWeight, initialReps, onSetRecorded }: SetLoggerProps) {
  const initWeight = initialWeight && initialWeight > 0 ? String(initialWeight) : "";
  const initReps = initialReps || "";
  const [sets, setSets] = useState<SetRow[]>([
    { setNumber: 1, weight: initWeight, reps: initReps, started: false, completed: false, restAfter: null },
  ]);

  const restStartRef = useRef<number | null>(null);
  const [restElapsed, setRestElapsed] = useState(0);
  const [isResting, setIsResting] = useState(false);

  useEffect(() => {
    if (!isResting) return;
    const timer = setInterval(() => {
      setRestElapsed(Math.floor((Date.now() - (restStartRef.current ?? Date.now())) / 1000));
    }, 200);
    return () => clearInterval(timer);
  }, [isResting]);

  const restMin = Math.floor(restElapsed / 60);
  const restSec = restElapsed % 60;

  function handleStart(index: number) {
    if (sets[index]?.completed || sets[index]?.started) return;

    const now = Date.now();
    let restAfter: number | null = null;
    if (restStartRef.current) {
      restAfter = Math.round((now - restStartRef.current) / 1000);
    }

    restStartRef.current = null;
    setIsResting(false);
    setRestElapsed(0);

    setSets(sets.map((s, i) =>
      i === index ? { ...s, started: true, restAfter } : s
    ));
  }

  function handleCheck(index: number) {
    const setToCheck = sets[index];
    if (!setToCheck || setToCheck.completed) return;

    const weight = parseFloat(setToCheck.weight);
    const reps = parseInt(setToCheck.reps, 10);
    if (isNaN(weight) || weight <= 0) return;
    if (isNaN(reps) || reps <= 0) return;

    onSetRecorded(exerciseId, weight, reps, setToCheck.setNumber);

    const now = Date.now();
    restStartRef.current = now;
    setRestElapsed(0);
    setIsResting(true);

    const updatedSets = sets.map((s, i) =>
      i === index ? { ...s, completed: true } : s
    );

    if (index === sets.length - 1) {
      updatedSets.push({
        setNumber: setToCheck.setNumber + 1,
        weight: setToCheck.weight,
        reps: setToCheck.reps,
        started: false,
        completed: false,
        restAfter: null,
      });
    }

    setSets(updatedSets);
  }

  function handleAddSet() {
    const maxSetNumber = sets.reduce((max, s) => Math.max(max, s.setNumber), 0);
    setSets([...sets, { setNumber: maxSetNumber + 1, weight: "", reps: "", started: false, completed: false, restAfter: null }]);
  }

  function handleDeleteSet(index: number) {
    if (sets.length <= 1) return;
    setSets(sets.filter((_, i) => i !== index));
  }

  function handleWeightChange(index: number, value: string) {
    if (sets[index]?.completed) return;
    setSets(sets.map((s, i) => (i === index ? { ...s, weight: value } : s)));
  }

  function adjustWeight(index: number, delta: number) {
    if (sets[index]?.completed) return;
    const current = parseFloat(sets[index].weight) || 0;
    const next = Math.max(0, current + delta);
    handleWeightChange(index, String(Math.round(next * 100) / 100));
  }

  function adjustReps(index: number, delta: number) {
    if (sets[index]?.completed) return;
    const current = parseInt(sets[index].reps) || 0;
    const next = Math.max(0, current + delta);
    setSets(sets.map((s, i) => (i === index ? { ...s, reps: String(next) } : s)));
  }

  function handleRepsChange(index: number, value: string) {
    if (sets[index]?.completed) return;
    setSets(sets.map((s, i) => (i === index ? { ...s, reps: value } : s)));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold text-foreground">{exerciseName}</h3>
        {isResting && (
          <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-mono tabular-nums",
            restElapsed < 180
              ? "bg-green-900/40 text-green-300"
              : restElapsed < 420
                ? "bg-yellow-900/40 text-yellow-300"
                : restElapsed < 720
                  ? "bg-red-900/40 text-red-300"
                  : "bg-red-900/60 text-red-300 animate-pulse"
          )}>
            <Timer className="size-3.5" />
            休息 {String(restMin).padStart(2, "0")}:{String(restSec).padStart(2, "0")}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {sets.map((set, index) => (
          <div
            key={`${exerciseId}-${set.setNumber}-${index}`}
            className={cn("flex items-end gap-2", set.completed && "opacity-50")}
          >
            <span className="w-6 text-center text-sm text-muted-foreground tabular-nums">{set.setNumber}</span>

            <div className="flex flex-col gap-0.5">
              <Label className="text-xs text-muted-foreground">kg</Label>
              <div className="flex items-center gap-1">
                <Button type="button" variant="ghost" size="icon-xs"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => adjustWeight(index, -2.5)} disabled={set.completed}>
                  <Minus className="size-3" />
                </Button>
                <Input type="number" inputMode="decimal" step="any" min="0"
                  placeholder="0" value={set.weight}
                  onChange={(e) => handleWeightChange(index, e.target.value)} disabled={set.completed}
                  className="w-16 text-center [&::-webkit-inner-spin-button]:appearance-none" />
                <Button type="button" variant="ghost" size="icon-xs"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => adjustWeight(index, 2.5)} disabled={set.completed}>
                  <Plus className="size-3" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-0.5">
              <Label className="text-xs text-muted-foreground">次</Label>
              <div className="flex items-center gap-1">
                <Button type="button" variant="ghost" size="icon-xs"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => adjustReps(index, -1)} disabled={set.completed}>
                  <Minus className="size-3" />
                </Button>
                <Input type="number" inputMode="numeric" step="1" min="0"
                  placeholder="0" value={set.reps}
                  onChange={(e) => handleRepsChange(index, e.target.value)} disabled={set.completed}
                  className="w-14 text-center [&::-webkit-inner-spin-button]:appearance-none" />
                <Button type="button" variant="ghost" size="icon-xs"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => adjustReps(index, 1)} disabled={set.completed}>
                  <Plus className="size-3" />
                </Button>
              </div>
            </div>

            {/* ▶ Start Set */}
            <Button type="button" size="icon-xs" variant="outline"
              className={cn(
                set.started || set.completed
                  ? "border-muted-foreground/30 text-muted-foreground"
                  : "border-cyan-600 text-cyan-600 hover:bg-cyan-600/10"
              )}
              onClick={() => handleStart(index)}
              disabled={set.started || set.completed}
              title={set.completed ? "已完成" : set.started ? "已开始" : "开始本组"}>
              <Play className="size-3" />
            </Button>

            {/* ✓ Complete Set */}
            <Button type="button" size="icon-xs" variant="outline"
              className={cn(
                set.completed
                  ? "border-muted-foreground/30 text-muted-foreground"
                  : "border-green-600 text-green-600 hover:bg-green-600/10"
              )}
              onClick={() => handleCheck(index)}
              disabled={set.completed || !set.started}
              title={set.completed ? "已完成" : "完成本组"}>
              <Check className="size-3.5" />
            </Button>

            <Button type="button" size="icon-xs" variant="ghost"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => handleDeleteSet(index)} disabled={sets.length <= 1}
              title="删除本组">
              <Trash2 className="size-3.5" />
            </Button>

            {set.restAfter != null && (
              <span className="text-xs text-muted-foreground tabular-nums ml-1 min-w-16">
                间歇 {Math.floor(set.restAfter / 60)}:{String(set.restAfter % 60).padStart(2, "0")}
              </span>
            )}
          </div>
        ))}
      </div>

      <Button type="button" variant="ghost" size="sm" onClick={handleAddSet} className="self-start">
        + 添加一组
      </Button>
    </div>
  );
}
