import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Dumbbell } from "lucide-react-native";
import { Link, router } from "expo-router";
import { useState, useEffect } from "react";
import { db } from "@/db";
import { workoutSets, trainingPlans, planExercises, exercises } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getWeekStart } from "@/lib/date";

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
  const [showPlanPicker, setShowPlanPicker] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);

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

      const weekStart = getWeekStart(new Date());
      const weekCount = sessions.filter(
        (s: any) => new Date(s.date) >= weekStart,
      ).length;

      // Recent 3 sessions with exercise names
      const recent = await Promise.all(
        sessions.slice(0, 3).map(async (s: any) => {
          let exerciseIds: string[] = [];
          try {
            const rawSets = await db.query.workoutSets.findMany({
              where: eq(workoutSets.sessionId, s.id),
            });
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

  async function loadPlansForPicker() {
    try {
      const allPlans = await db.query.trainingPlans.findMany();
      const userPlans = allPlans.filter((p: any) => !p.isTemplate);
      const withExercises = await Promise.all(
        userPlans.map(async (plan: any) => {
          const peList = await db.query.planExercises.findMany({
            where: eq(planExercises.planId, plan.id),
          });
          const exIds = [...new Set(peList.map((pe: any) => pe.exerciseId))];
          const exMap: Record<string, string> = {};
          for (const eid of exIds) {
            const ex = await db.query.exercises.findFirst({
              where: eq(exercises.id, eid),
            });
            if (ex) exMap[eid] = (ex as any).name;
          }
          const days: Record<number, any[]> = {};
          for (const pe of peList) {
            if (!days[pe.dayOfWeek]) days[pe.dayOfWeek] = [];
            days[pe.dayOfWeek].push({
              ...pe,
              exerciseName: exMap[pe.exerciseId] || "未知",
            });
          }
          return { ...plan, days };
        }),
      );
      setPlans(withExercises);
    } catch {
      setPlans([]);
    }
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
    <View className="flex-1 bg-canvas">
      <ScrollView className="flex-1">
      {/* ─── 顶部品牌区 ─── */}
      <View className="pt-16 px-xl pb-sm flex-row justify-between items-center">
        <View>
          <Text className="text-ink font-display text-display-lg">
            FitLog
          </Text>
          <Text className="text-ink-dim text-fine-print mt-xxs">
            {new Date().toLocaleDateString("zh-CN", {
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </Text>
        </View>
        <View className="w-11 h-11 rounded-full bg-surface items-center justify-center">
          <Dumbbell color="#34c759" size={20} />
        </View>
      </View>

      {/* ─── 今日训练 Hero Card ─── */}
      <View className="px-xl pb-sm">
        <View
          className="bg-[#0D1A0D] rounded-lg px-lg py-xl"
          style={{ borderColor: "rgba(52,199,89,0.2)", borderWidth: 1 }}
        >
          <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-md">
              <Text className="text-accent text-fine-print font-semibold uppercase mb-xs" style={{ letterSpacing: 2 }}>
                {stats.planName ?? "今日训练"}
              </Text>
              <Text className="text-ink font-display text-headline mb-xxs">
                {stats.todayPlan ?? "开始你的训练"}
              </Text>
              <Text className="text-ink-dim text-caption">
                {stats.todayPlan ? "按计划执行" : "选择动作开始训练"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => { loadPlansForPicker(); setShowPlanPicker(true); }}
              className="w-11 h-11 rounded-full bg-accent items-center justify-center active:scale-95"
              activeOpacity={0.8}
            >
              <Dumbbell color="#000000" size={18} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ─── 统计三卡片 ─── */}
      <View className="px-xl mb-lg">
        <View className="flex-row gap-xs">
          <View className="flex-1 bg-surface rounded-lg px-lg py-xl items-center">
            <Text className="text-accent font-display text-display-lg">
              {stats.weekCount}
            </Text>
            <Text className="text-ink-dim text-fine-print mt-xxs">本周训练</Text>
          </View>
          <View className="flex-1 bg-surface rounded-lg px-lg py-xl items-center">
            <Text className="text-ink font-display text-display-lg">
              {stats.totalCount}
            </Text>
            <Text className="text-ink-dim text-fine-print mt-xxs">总训练次数</Text>
          </View>
          <View className="flex-1 bg-surface rounded-lg px-lg py-xl items-center">
            <Text className="text-[#FF9500] font-display text-display-lg">
              --
            </Text>
            <Text className="text-ink-dim text-fine-print mt-xxs">连续周</Text>
          </View>
        </View>
      </View>

      {/* ─── 最近训练 ─── */}
      <View className="pb-section">
        <View className="px-xl flex-row justify-between items-center mb-md">
          <Text className="text-ink text-body-strong">最近训练</Text>
          <Link href="/(tabs)/analytics" asChild>
            <TouchableOpacity>
              <Text className="text-accent text-caption">查看全部 →</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {stats.recentSessions.length === 0 ? (
          <View className="mx-xl bg-surface rounded-lg px-xl py-xxl items-center">
            <View className="w-16 h-16 rounded-full bg-surface-variant items-center justify-center mb-lg">
              <Dumbbell color="#6e6e73" size={28} />
            </View>
            <Text className="text-ink-muted text-body mb-xxs">
              还没有训练记录
            </Text>
            <Text className="text-ink-dim text-fine-print text-center">
              点击上方训练卡片按钮开始第一次训练
            </Text>
          </View>
        ) : (
          stats.recentSessions.map((s) => (
            <Link
              key={s.id}
              href={{ pathname: "/workout/[id]", params: { id: s.id } }}
              asChild
            >
              <TouchableOpacity className="mx-xl mb-xs bg-surface rounded-lg px-lg py-xl flex-row items-center gap-md">
                <View className="w-10 h-10 rounded-lg bg-accent/15 items-center justify-center">
                  <Dumbbell color="#34c759" size={16} />
                </View>
                <View className="flex-1">
                  <Text className="text-ink text-caption-strong" numberOfLines={1}>
                    {s.exerciseNames.length > 0
                      ? s.exerciseNames.join(" · ")
                      : "训练记录"}
                  </Text>
                  <View className="flex-row items-center gap-xs mt-xxs">
                    <Text className="text-ink-dim text-fine-print">
                      {formatDate(s.date)}
                    </Text>
                    <Text className="text-ink-dim text-fine-print">·</Text>
                    <Text className="text-ink-dim text-fine-print">
                      {formatDuration(s.duration) ?? "--"}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Link>
          ))
        )}
      </View>
    </ScrollView>

      {showPlanPicker && (
        <View
          className="absolute bottom-0 left-0 right-0 bg-canvas-alt rounded-t-2xl px-xl pt-md pb-xxl z-10"
          style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
        >
          <View className="w-8 h-1 bg-hairline rounded-pill self-center mb-lg" />
          <Text className="text-ink text-body-strong mb-md">选择训练计划</Text>

          {plans.length === 0 ? (
            <View className="py-xxl items-center">
              <Text className="text-ink-muted text-caption">还没有训练计划</Text>
              <TouchableOpacity
                onPress={() => { setShowPlanPicker(false); router.push("/plan/new"); }}
                className="mt-md"
              >
                <Text className="text-accent text-caption">创建计划 →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            plans.map((plan: any) => (
              <View key={plan.id} className="mb-md">
                <Text className="text-ink text-caption-strong mb-sm">{plan.name}</Text>
                {Object.entries(plan.days).map(([day, dayExercises]: [string, any]) => {
                  const dayNames = ["", "周一", "周二", "周三", "周四", "周五", "周六", "周日"];
                  const dayNum = parseInt(day);
                  return (
                    <TouchableOpacity
                      key={day}
                      onPress={() => {
                        setShowPlanPicker(false);
                        router.push({
                          pathname: "/(tabs)/workout",
                          params: { planId: plan.id, dayOfWeek: String(dayNum) },
                        });
                      }}
                      className="bg-surface rounded-lg px-lg py-md mb-xs active:scale-[0.98]"
                    >
                      <Text className="text-ink text-body">{dayNames[dayNum]}</Text>
                      <Text className="text-ink-dim text-fine-print mt-xxs">
                        {(dayExercises as any[]).map((e: any) => e.exerciseName).join(" · ")}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))
          )}

          <TouchableOpacity
            onPress={() => {
              setShowPlanPicker(false);
              router.push("/(tabs)/workout");
            }}
            className="mt-md py-md"
          >
            <Text className="text-ink-dim text-caption text-center">自由训练（不选计划）</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowPlanPicker(false)} className="mt-xs py-xs">
            <Text className="text-ink-muted text-caption text-center">取消</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
