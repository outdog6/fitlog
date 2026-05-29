import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VolumeChart } from "@/components/volume-chart";

const muscleLabels: Record<string, string> = {
  chest: "胸部",
  back: "背部",
  legs: "腿部",
  shoulders: "肩部",
  arms: "手臂",
  core: "核心",
};

function getMonday(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

function formatWeekLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
}

export default async function AnalyticsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-foreground">数据分析</h1>
        <p className="text-muted-foreground">请登录后查看数据分析。</p>
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
      label: muscleLabels[muscle] || muscle,
      volume: Math.round(volume),
    }))
    .sort((a, b) => b.volume - a.volume);

  const totalVolume = weeklyData.reduce((sum, w) => sum + w.volume, 0);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-foreground">数据分析</h1>

      <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-6">
        <p className="text-sm font-medium text-cyan-400">
          总训练量（12周）
        </p>
        <p className="text-3xl font-bold text-cyan-300">
          {totalVolume.toLocaleString()} kg
        </p>
      </div>

      <VolumeChart data={weeklyData} title="每周训练量（kg）" />
      <VolumeChart data={muscleData} title="各肌群训练量（kg）" />
    </div>
  );
}
