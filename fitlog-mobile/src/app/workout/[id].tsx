import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { ChevronLeft, Clock, Dumbbell } from "lucide-react-native";
import { db } from "@/db";
import { workoutSessions, workoutSets } from "@/db/schema";
import { eq } from "drizzle-orm";

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [session, setSession] = useState<any>(null);
  const [sets, setSets] = useState<any[]>([]);
  const [exerciseMap, setExerciseMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  async function loadData() {
    try {
      const [sessionData, setsData, exercisesData] = await Promise.all([
        db.query.workoutSessions.findFirst({
          where: eq(workoutSessions.id, id),
        }),
        db.query.workoutSets.findMany({
          where: eq(workoutSets.sessionId, id),
        }),
        db.query.exercises.findMany(),
      ]);

      setSession(sessionData);
      setSets(setsData);

      const map: Record<string, string> = {};
      exercisesData.forEach((ex: any) => {
        map[ex.id] = ex.name;
      });
      setExerciseMap(map);
    } catch (err) {
      console.error("Failed to load workout detail", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 bg-canvas items-center justify-center">
        <Text className="text-ink-muted text-body">加载中...</Text>
      </View>
    );
  }

  if (!session) {
    return (
      <View className="flex-1 bg-canvas">
        <View className="px-xl pt-14 pb-md flex-row items-center gap-sm">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-11 h-11 rounded-pill items-center justify-center"
          >
            <ChevronLeft color="#34c759" size={22} />
          </TouchableOpacity>
          <Text className="text-ink font-display text-headline">训练详情</Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-ink-muted text-body">未找到训练记录</Text>
        </View>
      </View>
    );
  }

  // ─── Format helpers ───

  const formattedDate = new Date(session.date).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const totalMinutes = Math.floor((session.duration || 0) / 60);
  const formattedDuration =
    totalMinutes >= 60
      ? `${Math.floor(totalMinutes / 60)}小时${totalMinutes % 60}分钟`
      : `${totalMinutes}分钟`;

  const totalSets = sets.length;

  const totalVolume = sets.reduce(
    (sum: number, s: any) => sum + s.weight * s.reps,
    0,
  );
  const formattedVolume =
    totalVolume >= 1000
      ? `${(totalVolume / 1000).toFixed(1)}k kg`
      : `${totalVolume} kg`;

  // ─── Group sets by exercise ───

  const groupedSets: Record<string, any[]> = {};
  sets.forEach((s: any) => {
    if (!groupedSets[s.exerciseId]) {
      groupedSets[s.exerciseId] = [];
    }
    groupedSets[s.exerciseId].push(s);
  });

  return (
    <View className="flex-1 bg-canvas">
      {/* Header */}
      <View className="px-xl pt-14 pb-md flex-row items-center gap-sm">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-11 h-11 rounded-pill items-center justify-center"
        >
          <ChevronLeft color="#34c759" size={22} />
        </TouchableOpacity>
        <Text className="text-ink font-display text-headline">训练详情</Text>
      </View>

      <ScrollView className="flex-1 px-xl">
        {/* Summary Card */}
        <View className="bg-surface rounded-lg p-lg mb-md">
          <Text className="text-ink text-body-strong mb-sm">
            {formattedDate}
          </Text>
          <View className="flex-row gap-lg">
            <View className="flex-row items-center gap-xs">
              <Clock color="#6e6e73" size={16} />
              <Text className="text-ink-dim text-caption">
                {formattedDuration}
              </Text>
            </View>
            <View className="flex-row items-center gap-xs">
              <Dumbbell color="#6e6e73" size={16} />
              <Text className="text-ink-dim text-caption">{totalSets}组</Text>
            </View>
          </View>
          <View className="mt-sm">
            <Text className="text-ink-dim text-fine-print">总容量</Text>
            <Text className="text-accent text-headline font-display">
              {formattedVolume}
            </Text>
          </View>
        </View>

        {/* Exercise Sections */}
        {Object.entries(groupedSets).map(([exerciseId, exerciseSets]) => {
          const exerciseName = exerciseMap[exerciseId] || "未知动作";
          exerciseSets.sort(
            (a: any, b: any) => a.setNumber - b.setNumber,
          );

          return (
            <View
              key={exerciseId}
              className="bg-surface rounded-lg p-lg mb-md"
            >
              <Text className="text-ink text-body-strong mb-sm">
                {exerciseName}
              </Text>
              {exerciseSets.map((set: any) => {
                const vol = set.weight * set.reps;
                const volStr =
                  vol >= 1000
                    ? `${(vol / 1000).toFixed(1)}k`
                    : `${vol}`;
                return (
                  <View
                    key={set.id}
                    className="flex-row items-center py-sm border-b border-hairline"
                  >
                    <Text className="text-ink-muted text-caption w-12">
                      组{set.setNumber}
                    </Text>
                    <Text className="text-ink text-body flex-1">
                      {set.weight}kg × {set.reps}
                    </Text>
                    <Text className="text-ink-dim text-caption">
                      = {volStr}kg
                    </Text>
                  </View>
                );
              })}
            </View>
          );
        })}

        {/* Edge case: session exists but no sets */}
        {sets.length === 0 && (
          <View className="items-center py-xxl">
            <Text className="text-ink-muted text-body">暂无训练组记录</Text>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
