import { View, Text, ScrollView } from "react-native";
import { useState, useEffect } from "react";
import { db } from "@/db";
import { MUSCLE_COLORS, MUSCLE_LABELS } from "@/constants/theme";

function getWeekStart(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

interface WeekData {
  label: string;
  volume: number;
}

interface MuscleData {
  muscle: string;
  label: string;
  percent: number;
}

export default function AnalyticsScreen() {
  const [totalVolume, setTotalVolume] = useState(0);
  const [weeks, setWeeks] = useState<WeekData[]>([]);
  const [muscles, setMuscles] = useState<MuscleData[]>([]);
  const [hasData, setHasData] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const sessions = await db.query.workoutSessions.findMany();
      if (sessions.length === 0) {
        setLoaded(true);
        return;
      }

      const now = new Date();
      const twelveWeeksAgo = new Date(now.getTime() - 12 * 7 * 86400000);

      // Batch fetch ALL sets and ALL exercises in 2 queries
      const allSets = await db.query.workoutSets.findMany();
      const allExercises = await db.query.exercises.findMany();

      let total = 0;
      const weekVolumes: Map<string, number> = new Map();
      const muscleVolumes: Map<string, number> = new Map();

      for (const s of sessions) {
        const d = new Date(s.date);
        if (d < twelveWeeksAgo) continue;

        const sets = allSets.filter((rs) => rs.sessionId === s.id);
        for (const rs of sets) {
          const vol = (rs.weight || 0) * (rs.reps || 0);
          total += vol;

          const weekKey = getWeekStart(d).toISOString().slice(0, 10);
          weekVolumes.set(weekKey, (weekVolumes.get(weekKey) || 0) + vol);

          const ex = allExercises.find((e) => e.id === rs.exerciseId);
          if (ex) {
            const m = ex.primaryMuscle;
            muscleVolumes.set(m, (muscleVolumes.get(m) || 0) + vol);
          }
        }
      }

      setHasData(true);
      setTotalVolume(total);

      const weekArr: WeekData[] = [];
      for (let i = 7; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - d.getDay() + 1 - i * 7);
        const key = getWeekStart(d).toISOString().slice(0, 10);
        weekArr.push({ label: `W${8 - i}`, volume: weekVolumes.get(key) || 0 });
      }
      setWeeks(weekArr);

      const maxMuscleVol = Math.max(1, ...Array.from(muscleVolumes.values()));
      const muscleArr: MuscleData[] = Array.from(muscleVolumes.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([m, v]) => ({
          muscle: m,
          label: MUSCLE_LABELS[m] ?? m,
          percent: Math.round((v / maxMuscleVol) * 100),
        }));
      setMuscles(muscleArr);
    } catch (err) {
      console.error("Analytics load failed:", err);
    }
    setLoaded(true);
  }

  if (!hasData) {
    return (
      <View className="flex-1 bg-canvas px-xl pt-14 items-center justify-center">
        <View className="w-20 h-20 rounded-full bg-surface items-center justify-center mb-lg">
          <Text className="text-ink-dim text-3xl">📊</Text>
        </View>
        <Text className="text-ink-muted text-body">训练数据不足</Text>
        <Text className="text-ink-dim text-fine-print mt-xxs">
          完成更多训练后查看统计
        </Text>
      </View>
    );
  }

  const maxWeekVol = Math.max(1, ...weeks.map((w) => w.volume));

  return (
    <ScrollView className="flex-1 bg-canvas">
      <View className="px-xl pt-14 pb-md">
        <Text className="text-ink font-display text-hero">统计分析</Text>
        <Text className="text-ink-dim text-fine-print mt-xxs">过去 12 周数据</Text>
      </View>

      {/* Total Volume */}
      <View className="px-xl mb-lg">
        <View className="bg-surface rounded-lg px-xl py-xxl items-center">
          <Text className="text-ink-dim text-fine-print uppercase mb-sm"
            style={{ letterSpacing: 1.5 }}>
            12 周总训练量
          </Text>
          <Text className="text-accent font-display text-hero font-mono">
            {totalVolume >= 1000
              ? `${(totalVolume / 1000).toFixed(1)}k`
              : totalVolume}
          </Text>
          <Text className="text-ink-dim text-fine-print mt-xxs">kg</Text>
        </View>
      </View>

      {/* Weekly Trend */}
      <View className="px-xl mb-lg">
        <View className="bg-surface rounded-lg px-lg py-xl">
          <Text className="text-ink text-body-strong mb-lg">每周训练量趋势</Text>
          <View className="flex-row items-end gap-xs h-24">
            {weeks.map((w, i) => {
              const h = Math.max(4, (w.volume / maxWeekVol) * 100);
              return (
                <View key={i} className="flex-1 items-center">
                  <View
                    className="w-full bg-accent rounded-sm"
                    style={{
                      height: `${h}%`,
                      opacity: 0.4 + ((i + 1) / weeks.length) * 0.6,
                    }}
                  />
                  <Text className="text-ink-dim text-fine-print mt-xxs">
                    {w.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Muscle Distribution */}
      <View className="px-xl pb-section">
        <View className="bg-surface rounded-lg px-lg py-xl">
          <Text className="text-ink text-body-strong mb-lg">各肌群训练量分布</Text>
          {muscles.map((m) => {
            const color = MUSCLE_COLORS[m.muscle] ?? "#6e6e73";
            return (
              <View key={m.muscle} className="flex-row items-center gap-sm mb-sm">
                <Text className="text-fine-print font-medium w-8" style={{ color }}>
                  {m.label}
                </Text>
                <View className="flex-1 h-2 bg-canvas-alt rounded-pill overflow-hidden">
                  <View
                    className="h-full rounded-pill"
                    style={{ width: `${m.percent}%`, backgroundColor: color }}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}
