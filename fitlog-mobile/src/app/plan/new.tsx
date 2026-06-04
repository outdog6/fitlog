import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import AlertModal from "@/components/ui/AlertModal";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { db, expoDb } from "@/db";
import { planExercises } from "@/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "expo-crypto";
import { getOrCreateLocalUser } from "@/lib/auth";

const DAY_NAMES = ["", "周一", "周二", "周三", "周四", "周五", "周六", "周日"];

interface PlanExEntry {
  exerciseId: string;
  exerciseName: string;
  dayOfWeek: number;
  targetSets: number;
  targetReps: string;
}

export default function CreatePlanScreen() {
  const { template } = useLocalSearchParams<{ template: string }>();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<any>(null);
  const [templateExercises, setTemplateExercises] = useState<any[]>([]);
  const [myExercises, setMyExercises] = useState<PlanExEntry[]>([]);
  const [allExercises, setAllExercises] = useState<{ id: string; name: string }[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState<number | null>(null);

  useEffect(() => {
    db.query.exercises.findMany().then((list: any[]) =>
      setAllExercises(list.map((e: any) => ({ id: e.id, name: e.name })))
    );
    if (template) {
      db.query.planExercises.findMany({ where: eq(planExercises.planId, template) })
        .then((exercises: any[]) => setTemplateExercises(exercises));
    }
  }, [template]);

  const addExercise = (ex: { id: string; name: string }) => {
    setMyExercises((prev) => {
      if (prev.some((p) => p.exerciseId === ex.id)) return prev;
      return [...prev, { exerciseId: ex.id, exerciseName: ex.name, dayOfWeek: 1, targetSets: 3, targetReps: "8-12" }];
    });
  };

  const removeExercise = (idx: number) => {
    setMyExercises((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateDay = (idx: number, day: number) => {
    setMyExercises((prev) => prev.map((e, i) => (i === idx ? { ...e, dayOfWeek: day } : e)));
    setShowDayPicker(null);
  };

  async function handleSave() {
    if (!name.trim()) {
      setAlert({ title: "请输入计划名称" });
      return;
    }
    if (myExercises.length === 0 && templateExercises.length === 0) {
      setAlert({ title: "请至少添加一个训练动作" });
      return;
    }

    setSaving(true);
    try {
      const user: any = await getOrCreateLocalUser();
      const planId = randomUUID();

      expoDb.execSync(`CREATE TABLE IF NOT EXISTS TrainingPlan (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, isTemplate INTEGER NOT NULL DEFAULT 0, userId TEXT NOT NULL, createdAt INTEGER NOT NULL, updatedAt INTEGER NOT NULL)`);
      expoDb.runSync(
        `INSERT INTO TrainingPlan (id, name, description, isTemplate, userId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [planId, name.trim(), description.trim() || null, 0, user.id, Date.now(), Date.now()]
      );

      expoDb.execSync(`CREATE TABLE IF NOT EXISTS PlanExercise (id TEXT PRIMARY KEY, planId TEXT NOT NULL, exerciseId TEXT NOT NULL, weekNumber INTEGER NOT NULL, dayOfWeek INTEGER NOT NULL, "order" INTEGER NOT NULL, targetSets INTEGER NOT NULL, targetReps TEXT NOT NULL DEFAULT '8-12')`);

      // Save user's exercises
      for (let i = 0; i < myExercises.length; i++) {
        const pe = myExercises[i];
        expoDb.runSync(
          `INSERT INTO "PlanExercise" (id, planId, exerciseId, weekNumber, dayOfWeek, "order", targetSets, targetReps) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [randomUUID(), planId, pe.exerciseId, 1, pe.dayOfWeek, i + 1, pe.targetSets, pe.targetReps]
        );
      }

      // Clone template exercises if any
      for (const pe of templateExercises) {
        expoDb.runSync(
          `INSERT INTO "PlanExercise" (id, planId, exerciseId, weekNumber, dayOfWeek, "order", targetSets, targetReps) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [randomUUID(), planId, pe.exerciseId, pe.weekNumber, pe.dayOfWeek, pe.order, pe.targetSets, pe.targetReps]
        );
      }

      setAlert({ title: "创建成功", buttons: [{ text: "确定", onPress: () => router.back(), style: "primary" }] });
    } catch (e: any) {
      setAlert({ title: "创建失败", message: e?.message ?? "请稍后重试" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <View className="flex-1 bg-canvas">
      <View className="px-xl pt-14 pb-md flex-row items-center gap-sm">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-11 h-11 rounded-pill items-center justify-center"
        >
          <ChevronLeft color="#34c759" size={22} />
        </TouchableOpacity>
        <Text className="text-ink font-display text-headline">创建计划</Text>
      </View>

      <ScrollView className="flex-1 px-xl" contentContainerStyle={{ paddingBottom: 100 }}>
        <Text className="text-ink-dim text-caption mb-xs">计划名称 *</Text>
        <TextInput
          className="bg-surface rounded-lg px-lg py-sm text-ink text-body mb-lg"
          placeholder="例如: 增肌训练计划"
          placeholderTextColor="#6e6e73"
          value={name}
          onChangeText={setName}
        />

        <Text className="text-ink-dim text-caption mb-xs">计划描述</Text>
        <TextInput
          className="bg-surface rounded-lg px-lg py-sm text-ink text-body mb-lg min-h-[80px]"
          placeholder="简要描述这个计划..."
          placeholderTextColor="#6e6e73"
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
        />

        {/* Template info */}
        {template && (
          <View className="bg-accent/10 rounded-lg px-lg py-md mb-lg">
            <Text className="text-accent text-caption-strong">
              基于模板创建，将克隆 {templateExercises.length} 个动作
            </Text>
          </View>
        )}

        {/* Exercises */}
        <View className="flex-row justify-between items-center mb-md">
          <Text className="text-ink text-body-strong">训练动作</Text>
          <TouchableOpacity onPress={() => setShowPicker(true)}>
            <Text className="text-accent text-caption">+ 添加动作</Text>
          </TouchableOpacity>
        </View>

        {myExercises.length === 0 ? (
          <View className="bg-surface rounded-lg py-xxl items-center mb-lg">
            <Text className="text-ink-muted text-caption">还没添加动作</Text>
          </View>
        ) : (
          myExercises.map((pe, idx) => (
            <View key={idx} className="bg-surface rounded-lg px-lg py-md mb-xs">
              <View className="flex-row justify-between items-center mb-sm">
                <Text className="text-ink text-caption-strong flex-1">{pe.exerciseName}</Text>
                <TouchableOpacity onPress={() => removeExercise(idx)}>
                  <Text className="text-danger text-fine-print">删除</Text>
                </TouchableOpacity>
              </View>
              <View className="flex-row items-center gap-sm">
                <Text className="text-ink-dim text-fine-print">训练日:</Text>
                <TouchableOpacity
                  onPress={() => setShowDayPicker(showDayPicker === idx ? null : idx)}
                  className="bg-canvas-alt rounded-pill px-md py-1"
                >
                  <Text className="text-ink text-fine-print">{DAY_NAMES[pe.dayOfWeek]}</Text>
                </TouchableOpacity>
                {showDayPicker === idx && (
                  <View className="absolute left-16 top-8 bg-canvas-alt rounded-lg p-sm z-10 flex-row gap-xs">
                    {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                      <TouchableOpacity
                        key={d}
                        onPress={() => updateDay(idx, d)}
                        className={`rounded-pill px-sm py-1 ${pe.dayOfWeek === d ? "bg-accent" : "bg-surface"}`}
                      >
                        <Text className={`text-fine-print ${pe.dayOfWeek === d ? "text-canvas" : "text-ink-muted"}`}>
                          {d}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              <View className="flex-row gap-sm mt-sm">
                <View className="flex-1">
                  <Text className="text-ink-dim text-fine-print mb-xxs">目标组数</Text>
                  <View className="flex-row items-center gap-xs">
                    <TouchableOpacity
                      onPress={() => setMyExercises((prev) => prev.map((e, i) =>
                        i === idx ? { ...e, targetSets: Math.max(1, e.targetSets - 1) } : e))}
                      className="w-7 h-7 bg-canvas-alt rounded-full items-center justify-center"
                    >
                      <Text className="text-ink-muted text-caption">−</Text>
                    </TouchableOpacity>
                    <Text className="text-ink text-body-strong">{pe.targetSets}</Text>
                    <TouchableOpacity
                      onPress={() => setMyExercises((prev) => prev.map((e, i) =>
                        i === idx ? { ...e, targetSets: Math.min(10, e.targetSets + 1) } : e))}
                      className="w-7 h-7 bg-canvas-alt rounded-full items-center justify-center"
                    >
                      <Text className="text-ink-muted text-caption">+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="text-ink-dim text-fine-print mb-xxs">目标次数</Text>
                  <TextInput
                    className="bg-canvas-alt rounded-lg px-sm py-1 text-ink text-caption text-center"
                    value={pe.targetReps}
                    onChangeText={(v) => setMyExercises((prev) =>
                      prev.map((e, i) => i === idx ? { ...e, targetReps: v } : e))}
                    placeholder="8-12"
                    placeholderTextColor="#6e6e73"
                  />
                </View>
              </View>
            </View>
          ))
        )}

        {/* Exercise picker */}
        {showPicker && (
          <View className="bg-canvas-alt rounded-lg p-lg mb-lg">
            <Text className="text-ink text-caption-strong mb-sm">选择动作</Text>
            <ScrollView className="max-h-56">
              {allExercises.map((ex) => (
                <TouchableOpacity
                  key={ex.id}
                  onPress={() => addExercise(ex)}
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

        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          className={`rounded-pill py-md items-center active:scale-95 ${saving ? "bg-accent/50" : "bg-accent"}`}
        >
          <Text className="text-canvas text-body-strong">{saving ? "保存中..." : "保存"}</Text>
        </TouchableOpacity>
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
