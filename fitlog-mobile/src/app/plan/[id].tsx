import { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import AlertModal from "@/components/ui/AlertModal";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { db, expoDb } from "@/db";
import { planExercises, exercises } from "@/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "expo-crypto";

const DAY_NAMES = ["", "周一", "周二", "周三", "周四", "周五", "周六", "周日"];

export default function PlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [plan, setPlan] = useState<any>(null);
  const [dayExercises, setDayExercises] = useState<Record<number, any[]>>({});
  const [allExercises, setAllExercises] = useState<{ id: string; name: string }[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerDay, setPickerDay] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const [alert, setAlert] = useState<any>(null);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const plans = await db.query.trainingPlans.findMany();
      const p = plans.find((pl: any) => pl.id === id);
      setPlan(p || null);

      const peList = await db.query.planExercises.findMany({ where: eq(planExercises.planId, id) });
      peList.sort((a: any, b: any) => a.dayOfWeek - b.dayOfWeek || a.order - b.order);

      const allEx = await db.query.exercises.findMany();
      setAllExercises(allEx.map((e: any) => ({ id: e.id, name: e.name })));
      const exMap: Record<string, string> = {};
      for (const e of allEx) exMap[(e as any).id] = (e as any).name;

      const grouped: Record<number, any[]> = {};
      for (const pe of peList) {
        if (!grouped[pe.dayOfWeek]) grouped[pe.dayOfWeek] = [];
        grouped[pe.dayOfWeek].push({ ...pe, exerciseName: exMap[pe.exerciseId] || "未知" });
      }
      setDayExercises(grouped);
    } catch {}
    setLoaded(true);
  }, [id]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const addToDay = (ex: { id: string; name: string }) => {
    const peId = randomUUID();
    expoDb.execSync(`CREATE TABLE IF NOT EXISTS PlanExercise (id TEXT PRIMARY KEY, planId TEXT NOT NULL, exerciseId TEXT NOT NULL, weekNumber INTEGER NOT NULL, dayOfWeek INTEGER NOT NULL, "order" INTEGER NOT NULL, targetSets INTEGER NOT NULL, targetReps TEXT NOT NULL DEFAULT '8-12')`);
    const order = (dayExercises[pickerDay]?.length || 0) + 1;
    expoDb.runSync(
      `INSERT INTO "PlanExercise" (id, planId, exerciseId, weekNumber, dayOfWeek, "order", targetSets, targetReps) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [peId, id!, ex.id, 1, pickerDay, order, 3, "8-12"]
    );
    setDayExercises((prev) => ({
      ...prev,
      [pickerDay]: [...(prev[pickerDay] || []), { id: peId, exerciseId: ex.id, exerciseName: ex.name, dayOfWeek: pickerDay, targetSets: 3, targetReps: "8-12", order }],
    }));
  };

  const removeFromDay = (peId: string, day: number) => {
    setAlert({ title: "删除", message: "确定移除此动作？", buttons: [{ text: "取消", style: "cancel" }, { text: "删除", style: "destructive", onPress: () => { expoDb.runSync(`DELETE FROM "PlanExercise" WHERE id = ?`, [peId]); setDayExercises((prev) => ({ ...prev, [day]: (prev[day] || []).filter((pe: any) => pe.id !== peId) })); } }] });
  };

  if (!loaded) {
    return (
      <View className="flex-1 bg-canvas px-xl pt-14 items-center justify-center">
        <Text className="text-ink-muted text-body">加载中...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-canvas">
      <View className="px-xl pt-14 pb-md flex-row items-center gap-sm">
        <TouchableOpacity onPress={() => router.back()} className="w-11 h-11 rounded-pill items-center justify-center">
          <ChevronLeft color="#34c759" size={22} />
        </TouchableOpacity>
        <Text className="text-ink font-display text-headline">{plan?.name || "计划详情"}</Text>
      </View>

      <ScrollView className="flex-1 px-xl" contentContainerStyle={{ paddingBottom: 100 }}>
        {plan?.description ? (
          <Text className="text-ink-muted text-caption mb-lg">{plan.description}</Text>
        ) : null}

        {/* Add exercise bar */}
        <View className="flex-row items-center gap-sm mb-md">
          <View className="flex-row items-center bg-surface rounded-pill px-md py-1">
            <Text className="text-ink-dim text-fine-print mr-xs">添加到:</Text>
            {[1, 2, 3, 4, 5, 6, 7].map((d) => (
              <TouchableOpacity
                key={d}
                onPress={() => setPickerDay(d)}
                className={`rounded-full w-7 h-7 items-center justify-center ${pickerDay === d ? "bg-accent" : ""}`}
              >
                <Text className={`text-fine-print ${pickerDay === d ? "text-canvas" : "text-ink-muted"}`}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity onPress={() => setShowPicker(!showPicker)} className="bg-accent rounded-pill px-md py-1.5">
            <Text className="text-canvas text-caption-strong">+ 添加动作</Text>
          </TouchableOpacity>
        </View>

        {showPicker && (
          <View className="bg-canvas-alt rounded-lg p-md mb-md">
            <ScrollView className="max-h-48">
              {allExercises.map((ex) => (
                <TouchableOpacity
                  key={ex.id}
                  onPress={() => { addToDay(ex); setShowPicker(false); }}
                  className="flex-row justify-between items-center py-sm border-b border-hairline"
                >
                  <Text className="text-ink text-caption">{ex.name}</Text>
                  <Text className="text-ink-muted text-fine-print">添加 +</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setShowPicker(false)} className="mt-sm py-xs">
              <Text className="text-ink-muted text-caption text-center">取消</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Exercises grouped by day */}
        {[1, 2, 3, 4, 5, 6, 7].map((day) => {
          const exs = dayExercises[day] || [];
          if (exs.length === 0) return null;
          return (
            <View key={day} className="mb-lg">
              <Text className="text-ink text-caption-strong mb-sm">{DAY_NAMES[day]}</Text>
              {exs.map((pe: any) => (
                <View key={pe.id} className="bg-surface rounded-lg px-lg py-md mb-xs flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-ink text-body">{pe.exerciseName}</Text>
                    <Text className="text-ink-dim text-fine-print mt-xxs">
                      {pe.targetSets} 组 × {pe.targetReps} 次
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => removeFromDay(pe.id, day)}>
                    <Text className="text-danger text-fine-print">删除</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          );
        })}

        {Object.keys(dayExercises).length === 0 && (
          <View className="items-center py-xxl">
            <Text className="text-ink-muted text-caption">暂无训练动作</Text>
          </View>
        )}
      </ScrollView>
      <AlertModal
        visible={alert !== null}
        title={alert?.title ?? ""}
        message={alert?.message}
        buttons={alert?.buttons}
        onDismiss={() => setAlert(null)}
      />
    </View>
  );
}
