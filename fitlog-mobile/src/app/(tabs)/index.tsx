import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import {
  Dumbbell,
  TrendingUp,
  Calendar,
  Target,
  Clock,
} from "lucide-react-native";
import { Link } from "expo-router";
import { useState, useEffect } from "react";
import { db } from "@/db";
import { workoutSessions, workoutSets, exercises } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";

function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

interface DashboardStats {
  weekCount: number;
  totalCount: number;
  planName: string | null;
  todayPlan: string | null;
  recentSessions: {
    id: string;
    date: Date;
    duration: number | null;
    exerciseNames: string[];
  }[];
}

export default function DashboardScreen() {
  const [stats, setStats] = useState<DashboardStats>({
    weekCount: 0,
    totalCount: 0,
    planName: null,
    todayPlan: null,
    recentSessions: [],
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const sessions = await db.query.workoutSessions.findMany();
      // Sort by date desc
      sessions.sort(
        (a: any, b: any) =>
          new Date(b.date).getTime() - new Date(a.date).getTime(),
      );

      const weekStart = getWeekStart();
      const weekCount = sessions.filter(
        (s: any) => new Date(s.date) >= weekStart,
      ).length;

      // Recent 3 sessions with exercise names
      const recent = await Promise.all(
        sessions.slice(0, 3).map(async (s: any) => {
          let exerciseIds: string[] = [];
          try {
            const rawSets = (await (
              db as any
            ).select?.()
              ?.from?.(workoutSets)
              ?.where?.(eq(workoutSets.sessionId, s.id))) || [];
            exerciseIds = [...new Set(rawSets.map((r: any) => r.exerciseId))] as string[];
          } catch {
            // Fallback: just show duration
          }

          let exerciseNames: string[] = [];
          try {
            for (const eid of exerciseIds.slice(0, 3)) {
              const ex = await db.query.exercises.findFirst({
                where: { id: eid } as any,
              });
              if (ex) exerciseNames.push((ex as any).name);
            }
          } catch {
            // ignore
          }

          return {
            id: s.id,
            date: new Date(s.date),
            duration: s.duration,
            exerciseNames,
          };
        }),
      );

      setStats({
        weekCount,
        totalCount: sessions.length,
        planName: null,
        todayPlan: null,
        recentSessions: recent,
      });
    } catch (err) {
      // DB not ready or empty — stay at defaults
    }
    setLoaded(true);
  }

  function formatDate(d: Date) {
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diff === 0) return "今天";
    if (diff === 1) return "昨天";
    return `${d.getMonth() + 1}/${d.getDate()}`;
  }

  function formatDuration(secs: number | null) {
    if (!secs) return null;
    const m = Math.floor(secs / 60);
    if (m < 60) return `${m}分钟`;
    return `${Math.floor(m / 60)}小时${m % 60}分钟`;
  }

  return (
    <ScrollView className="flex-1 bg-canvas">
      {/* ─── Hero ─── */}
      <View className="pt-20 pb-section px-xl bg-canvas">
        <Text className="text-accent text-caption-strong mb-sm tracking-wider uppercase">
          力量训练
        </Text>
        <Text className="text-ink font-display text-hero mb-xxs">
          今天练点什么？
        </Text>
        <Text className="text-ink-muted text-body">
          本周已训练 {stats.weekCount} 次 · 继续保持
        </Text>
      </View>

      {/* ─── CTA Tile ─── */}
      <View className="mx-xl mb-xxl">
        <Link href="/(tabs)/workout" asChild>
          <TouchableOpacity
            className="bg-accent rounded-lg overflow-hidden active:scale-[0.98]"
            activeOpacity={1}
          >
            <View className="px-xl py-xxl flex-row items-end justify-between">
              <View>
                <Text className="text-canvas/80 text-caption mb-xxs">
                  快速开始
                </Text>
                <Text className="text-canvas font-display text-display-lg">
                  开始训练
                </Text>
              </View>
              <View className="bg-canvas/20 w-11 h-11 rounded-pill items-center justify-center">
                <Dumbbell color="#000000" size={20} />
              </View>
            </View>
          </TouchableOpacity>
        </Link>
      </View>

      {/* ─── Stats ─── */}
      <View className="mb-xxl">
        <Text className="px-xl text-ink-dim text-fine-print mb-md uppercase tracking-wider">
          本周概览
        </Text>
        <View className="px-xl flex-row gap-sm mb-sm">
          <View className="flex-1 bg-surface rounded-lg px-lg py-xl">
            <View className="w-8 h-8 rounded-pill bg-accent/20 items-center justify-center mb-md">
              <TrendingUp color="#34c759" size={16} />
            </View>
            <Text className="text-ink font-display text-display-lg mb-xxs">
              {stats.weekCount}
            </Text>
            <Text className="text-ink-muted text-caption">本周完成</Text>
          </View>
          <View className="flex-1 bg-surface rounded-lg px-lg py-xl">
            <View className="w-8 h-8 rounded-pill bg-accent/20 items-center justify-center mb-md">
              <Calendar color="#34c759" size={16} />
            </View>
            <Text className="text-ink font-display text-display-lg mb-xxs">
              {stats.totalCount}
            </Text>
            <Text className="text-ink-muted text-caption">总训练次数</Text>
          </View>
        </View>
        <View className="px-xl flex-row gap-sm">
          <View className="flex-1 bg-surface rounded-lg px-lg py-xl">
            <View className="w-8 h-8 rounded-pill bg-accent/20 items-center justify-center mb-md">
              <Target color="#34c759" size={16} />
            </View>
            <Text className="text-ink font-display text-display-lg mb-xxs">
              {stats.planName ?? "--"}
            </Text>
            <Text className="text-ink-muted text-caption">当前计划</Text>
          </View>
          <View className="flex-1 bg-surface rounded-lg px-lg py-xl">
            <View className="w-8 h-8 rounded-pill bg-accent/20 items-center justify-center mb-md">
              <Calendar color="#34c759" size={16} />
            </View>
            <Text className="text-ink font-display text-display-lg mb-xxs">
              {stats.todayPlan ?? "--"}
            </Text>
            <Text className="text-ink-muted text-caption">今日安排</Text>
          </View>
        </View>
      </View>

      {/* ─── Recent Sessions ─── */}
      <View className="pb-section">
        <View className="px-xl flex-row justify-between items-end mb-md">
          <Text className="text-ink-dim text-fine-print uppercase tracking-wider">
            最近训练
          </Text>
        </View>

        {stats.recentSessions.length === 0 ? (
          <View className="mx-xl bg-surface rounded-lg overflow-hidden">
            <View className="px-xl py-xxl items-center">
              <View className="w-16 h-16 rounded-full bg-surface-variant items-center justify-center mb-lg">
                <Dumbbell color="#6e6e73" size={28} />
              </View>
              <Text className="text-ink-muted text-body mb-xxs">
                还没有训练记录
              </Text>
              <Text className="text-ink-dim text-fine-print text-center">
                点击上方「开始训练」记录你的第一次训练
              </Text>
            </View>
            <View className="h-0.5 bg-accent/50" />
          </View>
        ) : (
          stats.recentSessions.map((s) => (
            <View
              key={s.id}
              className="mx-xl mb-xs bg-surface rounded-lg px-lg py-xl"
            >
              <View className="flex-row justify-between items-start mb-sm">
                <Text className="text-ink text-body-strong">
                  {s.exerciseNames.length > 0
                    ? s.exerciseNames.join(" · ")
                    : "训练记录"}
                </Text>
                <Text className="text-ink-dim text-fine-print">
                  {formatDate(s.date)}
                </Text>
              </View>
              <View className="flex-row items-center gap-xs">
                <Clock color="#6e6e73" size={12} />
                <Text className="text-ink-muted text-fine-print">
                  {formatDuration(s.duration) ?? "--"}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
