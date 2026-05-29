import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Exercise = {
  id: string;
  name: string;
  primaryMuscle: string;
  equipment: string;
};

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

const muscleLabels: Record<string, string> = {
  chest: "胸部",
  back: "背部",
  legs: "腿部",
  shoulders: "肩部",
  arms: "手臂",
  core: "核心",
};

const equipmentLabels: Record<string, string> = {
  barbell: "杠铃",
  dumbbell: "哑铃",
  cable: "绳索",
  bodyweight: "自重",
  machine: "器械",
};

export function ExerciseCard({
  exercise,
  isOwner,
}: {
  exercise: Exercise;
  isOwner?: boolean;
}) {
  return (
    <Link href={`/exercises/${exercise.id}`}>
      <Card className="hover:ring-1 hover:ring-primary/50 transition-all cursor-pointer h-full">
        <CardHeader>
          <CardTitle className="text-base">{exercise.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                muscleColors[exercise.primaryMuscle] || "bg-muted text-muted-foreground"
              }`}
            >
              {muscleLabels[exercise.primaryMuscle] || exercise.primaryMuscle}
            </span>
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                equipmentColors[exercise.equipment] || "bg-muted text-muted-foreground"
              }`}
            >
              {equipmentLabels[exercise.equipment] || exercise.equipment}
            </span>
            {isOwner && (
              <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-accent/20 text-accent">
                自定义
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
