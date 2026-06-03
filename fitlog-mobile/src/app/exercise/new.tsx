import { useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { db } from "@/db";
import { exercises } from "@/db/schema";
import { MUSCLE_LABELS, EQUIPMENT_LABELS } from "@/constants/theme";

const MUSCLES = ["chest", "back", "legs", "shoulders", "arms", "core"] as const;
const EQUIPMENT = ["barbell", "dumbbell", "cable", "machine", "bodyweight"] as const;

export default function CreateExerciseScreen() {
  const [name, setName] = useState("");
  const [primaryMuscle, setPrimaryMuscle] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert("提示", "请输入动作名称");
      return;
    }
    if (!primaryMuscle) {
      Alert.alert("提示", "请选择主肌群");
      return;
    }
    if (!equipment) {
      Alert.alert("提示", "请选择器材");
      return;
    }

    setSaving(true);

    try {
      await db.insert(exercises).values({
        name: name.trim(),
        primaryMuscle,
        secondaryMuscles: "[]",
        equipment,
        description: description.trim(),
        instructions: instructions.trim(),
        isPreset: false,
      });
      Alert.alert("创建成功", "", [
        { text: "确定", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert("创建失败", e?.message ?? "请稍后重试");
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
        <Text className="text-ink font-display text-headline">创建动作</Text>
      </View>

      <ScrollView
        className="flex-1 px-xl"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Name */}
        <Text className="text-ink-dim text-caption mb-xs">动作名称 *</Text>
        <TextInput
          className="bg-surface rounded-lg px-lg py-sm text-ink text-body mb-lg"
          placeholder="例如: 杠铃卧推"
          placeholderTextColor="#6e6e73"
          value={name}
          onChangeText={setName}
        />

        {/* Primary Muscle */}
        <Text className="text-ink-dim text-caption mb-xs">主肌群 *</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-lg"
        >
          {MUSCLES.map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => setPrimaryMuscle(m)}
              className={`mr-xs px-md py-1.5 rounded-pill ${
                primaryMuscle === m ? "bg-accent" : "bg-surface"
              }`}
            >
              <Text
                className={`text-caption-strong ${
                  primaryMuscle === m ? "text-canvas" : "text-ink-muted"
                }`}
              >
                {MUSCLE_LABELS[m]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Equipment */}
        <Text className="text-ink-dim text-caption mb-xs">器材 *</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-lg"
        >
          {EQUIPMENT.map((e) => (
            <TouchableOpacity
              key={e}
              onPress={() => setEquipment(e)}
              className={`mr-xs px-md py-1.5 rounded-pill ${
                equipment === e ? "bg-accent" : "bg-surface"
              }`}
            >
              <Text
                className={`text-caption-strong ${
                  equipment === e ? "text-canvas" : "text-ink-muted"
                }`}
              >
                {EQUIPMENT_LABELS[e]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Description */}
        <Text className="text-ink-dim text-caption mb-xs">动作描述</Text>
        <TextInput
          className="bg-surface rounded-lg px-lg py-sm text-ink text-body mb-lg min-h-[80px]"
          placeholder="简要描述这个动作..."
          placeholderTextColor="#6e6e73"
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
        />

        {/* Instructions */}
        <Text className="text-ink-dim text-caption mb-xs">
          动作要领（每行一步）
        </Text>
        <TextInput
          className="bg-surface rounded-lg px-lg py-sm text-ink text-body mb-xl min-h-[120px]"
          placeholder={"1. 躺在平凳上\n2. 握住杠铃\n3. 推起杠铃"}
          placeholderTextColor="#6e6e73"
          value={instructions}
          onChangeText={setInstructions}
          multiline
          textAlignVertical="top"
        />

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
