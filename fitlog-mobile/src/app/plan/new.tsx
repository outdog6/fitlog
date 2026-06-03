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
import { db } from "@/db";
import { trainingPlans, planExercises } from "@/db/schema";
import { eq } from "drizzle-orm";
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

      const [inserted] = await db.insert(trainingPlans).values({
        name: name.trim(),
        description: description.trim() || null,
        isTemplate: false,
        userId: user.id,
      }).returning();

      // Clone template exercises if any
      if (templateExercises.length > 0 && inserted) {
        const clonedExercises = templateExercises.map((pe) => ({
          planId: inserted.id,
          exerciseId: pe.exerciseId,
          weekNumber: pe.weekNumber,
          dayOfWeek: pe.dayOfWeek,
          order: pe.order,
          targetSets: pe.targetSets,
          targetReps: pe.targetReps,
        }));
        await db.insert(planExercises).values(clonedExercises);
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
