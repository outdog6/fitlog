import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { db, expoDb } from "@/db";
import { planExercises } from "@/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "expo-crypto";
import { getOrCreateLocalUser } from "@/lib/auth";

export default function CreatePlanScreen() {
  const { template } = useLocalSearchParams<{ template: string }>();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(!!template);
  const [templateExercises, setTemplateExercises] = useState<any[]>([]);

  useEffect(() => {
    if (template) {
      db.query.planExercises
        .findMany({
          where: eq(planExercises.planId, template),
        })
        .then((exercises: any[]) => {
          setTemplateExercises(exercises);
          setLoadingTemplate(false);
        })
        .catch(() => {
          setLoadingTemplate(false);
        });
    }
  }, [template]);

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert("提示", "请输入计划名称");
      return;
    }

    setSaving(true);

    try {
      const user = await getOrCreateLocalUser();
      const planId = randomUUID();

      expoDb.execSync(`CREATE TABLE IF NOT EXISTS TrainingPlan (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, isTemplate INTEGER NOT NULL DEFAULT 0, userId TEXT NOT NULL, createdAt INTEGER NOT NULL, updatedAt INTEGER NOT NULL)`);
      expoDb.runSync(
        `INSERT INTO TrainingPlan (id, name, description, isTemplate, userId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [planId, name.trim(), description.trim() || null, 0, user.id, Date.now(), Date.now()]
      );

      // Clone template exercises if any
      if (templateExercises.length > 0) {
        expoDb.execSync(`CREATE TABLE IF NOT EXISTS PlanExercise (id TEXT PRIMARY KEY, planId TEXT NOT NULL, exerciseId TEXT NOT NULL, weekNumber INTEGER NOT NULL, dayOfWeek INTEGER NOT NULL, "order" INTEGER NOT NULL, targetSets INTEGER NOT NULL, targetReps TEXT NOT NULL DEFAULT '8-12')`);
        for (const pe of templateExercises) {
          const cloneId = randomUUID();
          expoDb.runSync(
            `INSERT INTO "PlanExercise" (id, planId, exerciseId, weekNumber, dayOfWeek, "order", targetSets, targetReps) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [cloneId, planId, pe.exerciseId, pe.weekNumber, pe.dayOfWeek, pe.order, pe.targetSets, pe.targetReps]
          );
        }
      }

      Alert.alert("创建成功", "", [
        { text: "确定", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert("创建失败", e?.message ?? "请稍后重试");
    } finally {
      setSaving(false);
    }
  }

  if (loadingTemplate) {
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
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#34c759" size="large" />
        </View>
      </View>
    );
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

      <ScrollView
        className="flex-1 px-xl"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Name */}
        <Text className="text-ink-dim text-caption mb-xs">计划名称 *</Text>
        <TextInput
          className="bg-surface rounded-lg px-lg py-sm text-ink text-body mb-lg"
          placeholder="例如: 增肌训练计划"
          placeholderTextColor="#6e6e73"
          value={name}
          onChangeText={setName}
        />

        {/* Description */}
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

        {/* Save button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          className={`rounded-pill py-md items-center active:scale-95 ${
            saving ? "bg-accent/50" : "bg-accent"
          }`}
        >
          <Text className="text-canvas text-body-strong">
            {saving ? "保存中..." : "保存"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
