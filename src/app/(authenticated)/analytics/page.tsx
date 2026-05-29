import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VolumeChart } from "@/components/volume-chart";

function getMonday(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

function formatWeekLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function AnalyticsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">Sign in to view your analytics.</p>
      </div>
    );
  }

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const sessions = await prisma.workoutSession.findMany({
    where: {
      userId,
      date: { gte: ninetyDaysAgo },
    },
    include: {
      sets: {
        include: {
          exercise: true,
        },
      },
    },
    orderBy: { date: "asc" },
  });

  const weeklyMap = new Map<string, number>();
  const muscleMap = new Map<string, number>();

  for (const s of sessions) {
    const weekKey = getMonday(s.date);
    for (const set of s.sets) {
      const volume = set.weight * set.reps;
      weeklyMap.set(weekKey, (weeklyMap.get(weekKey) ?? 0) + volume);
      muscleMap.set(
        set.exercise.primaryMuscle,
        (muscleMap.get(set.exercise.primaryMuscle) ?? 0) + volume
      );
    }
  }

  const sortedWeeks = [...weeklyMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12);

  const weeklyData = sortedWeeks.map(([week, volume]) => ({
    label: formatWeekLabel(week),
    volume: Math.round(volume),
  }));

  const muscleData = [...muscleMap.entries()]
    .map(([muscle, volume]) => ({
      label: muscle.charAt(0).toUpperCase() + muscle.slice(1),
      volume: Math.round(volume),
    }))
    .sort((a, b) => b.volume - a.volume);

  const totalVolume = weeklyData.reduce((sum, w) => sum + w.volume, 0);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-foreground">Analytics</h1>

      <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-6">
        <p className="text-sm font-medium text-cyan-400">
          Total Volume (12 weeks)
        </p>
        <p className="text-3xl font-bold text-cyan-300">
          {totalVolume.toLocaleString()} kg
        </p>
      </div>

      <VolumeChart data={weeklyData} title="Weekly Volume (kg)" />
      <VolumeChart data={muscleData} title="Volume by Muscle Group (kg)" />
    </div>
  );
}
