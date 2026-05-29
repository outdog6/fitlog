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
  { value: "all", label: "全部肌群" },
  { value: "chest", label: "胸部" },
  { value: "back", label: "背部" },
  { value: "legs", label: "腿部" },
  { value: "shoulders", label: "肩部" },
  { value: "arms", label: "手臂" },
  { value: "core", label: "核心" },
];

const equipment = [
  { value: "all", label: "全部器械" },
  { value: "barbell", label: "杠铃" },
  { value: "dumbbell", label: "哑铃" },
  { value: "cable", label: "绳索" },
  { value: "bodyweight", label: "自重" },
  { value: "machine", label: "器械" },
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
        <label className="text-sm text-muted-foreground">肌群</label>
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
        <label className="text-sm text-muted-foreground">器械</label>
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
