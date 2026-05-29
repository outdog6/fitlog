"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const muscles = [
  { value: "all", label: "All Muscles" },
  { value: "chest", label: "Chest" },
  { value: "back", label: "Back" },
  { value: "legs", label: "Legs" },
  { value: "shoulders", label: "Shoulders" },
  { value: "arms", label: "Arms" },
  { value: "core", label: "Core" },
];

const equipment = [
  { value: "all", label: "All Equipment" },
  { value: "barbell", label: "Barbell" },
  { value: "dumbbell", label: "Dumbbell" },
  { value: "cable", label: "Cable" },
  { value: "bodyweight", label: "Bodyweight" },
  { value: "machine", label: "Machine" },
];

export function ExerciseFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentMuscle = searchParams.get("muscle") || "all";
  const currentEquipment = searchParams.get("equipment") || "all";

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/exercises?${params.toString()}`);
  }

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-muted-foreground">Muscle</label>
        <Select
          value={currentMuscle}
          onValueChange={(value) => updateFilter("muscle", value ?? "all")}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {muscles.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-muted-foreground">Equipment</label>
        <Select
          value={currentEquipment}
          onValueChange={(value) => updateFilter("equipment", value ?? "all")}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {equipment.map((e) => (
              <SelectItem key={e.value} value={e.value}>
                {e.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
