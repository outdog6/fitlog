"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Trash2, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface SetRow {
  setNumber: number;
  weight: string;
  reps: string;
  completed: boolean;
}

interface SetLoggerProps {
  exerciseName: string;
  exerciseId: string;
  initialWeight?: number;
  initialReps?: string;
  onSetRecorded: (
    exerciseId: string,
    weight: number,
    reps: number,
    setNumber: number
  ) => void;
}

export function SetLogger({
  exerciseName,
  exerciseId,
  initialWeight,
  initialReps,
  onSetRecorded,
}: SetLoggerProps) {
  const initWeight = initialWeight && initialWeight > 0 ? String(initialWeight) : "";
  const initReps = initialReps || "";
  const [sets, setSets] = useState<SetRow[]>([
    { setNumber: 1, weight: initWeight, reps: initReps, completed: false },
  ]);

  function handleCheck(index: number) {
    const setToCheck = sets[index];
    if (!setToCheck) return;

    const weight = parseFloat(setToCheck.weight);
    const reps = parseInt(setToCheck.reps, 10);

    if (isNaN(weight) || weight <= 0) return;
    if (isNaN(reps) || reps <= 0) return;

    // Notify parent
    onSetRecorded(exerciseId, weight, reps, setToCheck.setNumber);

    // Mark as completed
    const updatedSets = sets.map((s, i) =>
      i === index ? { ...s, completed: true } : s
    );

    // Auto-add next empty set if this was the last row, carry forward weight & reps
    if (index === sets.length - 1) {
      updatedSets.push({
        setNumber: setToCheck.setNumber + 1,
        weight: setToCheck.weight,
        reps: setToCheck.reps,
        completed: false,
      });
    }

    setSets(updatedSets);
  }

  function handleAddSet() {
    const maxSetNumber = sets.reduce((max, s) => Math.max(max, s.setNumber), 0);
    const last = sets[sets.length - 1];
    setSets([
      ...sets,
      {
        setNumber: maxSetNumber + 1,
        weight: last?.weight ?? "",
        reps: last?.reps ?? "",
        completed: false,
      },
    ]);
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
    const fixed = Math.round(next * 100) / 100;
    setSets(sets.map((s, i) => (i === index ? { ...s, weight: String(fixed) } : s)));
  }

  function adjustReps(index: number, delta: number) {
    if (sets[index]?.completed) return;
    const current = parseInt(sets[index].reps) || 0;
    const next = Math.max(0, current + delta);
    handleRepsChange(index, String(next));
  }

  function handleRepsChange(index: number, value: string) {
    if (sets[index]?.completed) return;
    setSets(sets.map((s, i) => (i === index ? { ...s, reps: value } : s)));
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-lg font-semibold text-foreground">{exerciseName}</h3>

      <div className="flex flex-col gap-2">
        {sets.map((set, index) => (
          <div
            key={`${exerciseId}-${set.setNumber}-${index}`}
            className={cn(
              "flex items-end gap-2",
              set.completed && "opacity-50 pointer-events-none"
            )}
          >
            <span className="w-6 text-center text-sm text-muted-foreground tabular-nums">
              {set.setNumber}
            </span>

            <div className="flex flex-col gap-0.5">
              <Label className="text-xs text-muted-foreground">kg</Label>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => adjustWeight(index, -2.5)}
                  disabled={set.completed}
                >
                  <Minus className="size-3" />
                </Button>
                <Input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="0"
                  placeholder="0"
                  value={set.weight}
                  onChange={(e) => handleWeightChange(index, e.target.value)}
                  disabled={set.completed}
                  className="w-16 text-center [&::-webkit-inner-spin-button]:appearance-none"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => adjustWeight(index, 2.5)}
                  disabled={set.completed}
                >
                  <Plus className="size-3" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-0.5">
              <Label className="text-xs text-muted-foreground">次</Label>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => adjustReps(index, -1)}
                  disabled={set.completed}
                >
                  <Minus className="size-3" />
                </Button>
                <Input
                  type="number"
                  inputMode="numeric"
                  step="1"
                  min="0"
                  placeholder="0"
                  value={set.reps}
                  onChange={(e) => handleRepsChange(index, e.target.value)}
                  disabled={set.completed}
                  className="w-14 text-center [&::-webkit-inner-spin-button]:appearance-none"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => adjustReps(index, 1)}
                  disabled={set.completed}
                >
                  <Plus className="size-3" />
                </Button>
              </div>
            </div>

            <Button
              type="button"
              size="icon-xs"
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-600/10"
              onClick={() => handleCheck(index)}
              disabled={set.completed}
              title="记录本组"
            >
              <Check className="size-3.5" />
            </Button>

            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => handleDeleteSet(index)}
              disabled={sets.length <= 1}
              title="删除本组"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleAddSet}
        className="self-start"
      >
        + 添加一组
      </Button>
    </div>
  );
}
