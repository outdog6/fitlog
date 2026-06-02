import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { db } from "@/db";
import { exercises } from "@/db/schema";
import { eq } from "drizzle-orm";
import { MUSCLE_COLORS, MUSCLE_LABELS, MUSCLE_BG, EQUIPMENT_LABELS } from "@/constants/theme";
import type { Exercise } from "@/db/schema";

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("无效的动作 ID");
      setLoading(false);
      return;
    }

    db.query.exercises
      .findFirst({ where: eq(exercises.id, id) })
      .then((result) => {
        if (result) {
          setExercise(result as Exercise);
        } else {
          setError("动作未找到");
        }
      })
      .catch(() => {
        setError("加载失败");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const mColor = MUSCLE_COLORS[exercise?.primaryMuscle ?? ""] ?? "#6e6e73";
  const mBg = MUSCLE_BG[exercise?.primaryMuscle ?? ""] ?? "rgba(152,152,157,0.1)";

  let secondaryMuscles: string[] = [];
  if (exercise) {
    try {
      secondaryMuscles = JSON.parse(exercise.secondaryMuscles);
    } catch {
      secondaryMuscles = [];
    }
  }

  const instructionsSteps = (exercise?.instructions ?? "")
    .split("\n")
    .filter((s) => s.trim().length > 0);

  if (loading) {
    return (
      <View className="flex-1 bg-canvas">
        <Header />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#34c759" size="large" />
        </View>
      </View>
    );
  }

  if (error || !exercise) {
    return (
      <View className="flex-1 bg-canvas">
        <Header />
        <View className="flex-1 items-center justify-center px-xl">
          <Text className="text-ink-muted text-body mb-lg">
            {error ?? "动作未找到"}
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-accent px-xl py-sm rounded-pill"
          >
            <Text className="text-canvas text-caption-strong">返回</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-canvas">
      <Header />

      <ScrollView
        className="flex-1 px-xl"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Exercise name */}
        <Text className="text-ink font-display text-hero mb-md">
          {exercise.name}
        </Text>

        {/* Tags row */}
        <View className="flex-row flex-wrap gap-xs mb-lg">
          {/* Primary muscle tag */}
          <View
            className="px-sm py-1 rounded-pill"
            style={{ backgroundColor: mBg }}
          >
            <Text className="text-fine-print" style={{ color: mColor }}>
              {MUSCLE_LABELS[exercise.primaryMuscle] ?? exercise.primaryMuscle}
            </Text>
          </View>

          {/* Equipment tag */}
          <View className="px-sm py-1 rounded-pill bg-pill-bg">
            <Text className="text-ink-dim text-fine-print">
              {EQUIPMENT_LABELS[exercise.equipment] ?? exercise.equipment}
            </Text>
          </View>

          {/* Preset / Custom badge */}
          <View
            className={`px-sm py-1 rounded-pill ${
              exercise.isPreset ? "bg-accent/20" : "bg-surface"
            }`}
          >
            <Text
              className={`text-fine-print ${
                exercise.isPreset ? "text-accent" : "text-ink-dim"
              }`}
            >
              {exercise.isPreset ? "预设" : "自定义"}
            </Text>
          </View>
        </View>

        {/* Secondary muscles */}
        {secondaryMuscles.length > 0 && (
          <View className="mb-lg">
            <Text className="text-ink-dim text-caption mb-xs">副肌群</Text>
            <View className="flex-row flex-wrap gap-xs">
              {secondaryMuscles.map((m) => {
                const sColor = MUSCLE_COLORS[m] ?? "#6e6e73";
                const sBg = MUSCLE_BG[m] ?? "rgba(152,152,157,0.1)";
                return (
                  <View
                    key={m}
                    className="px-xs py-0.5 rounded-pill"
                    style={{ backgroundColor: sBg }}
                  >
                    <Text className="text-fine-print" style={{ color: sColor }}>
                      {MUSCLE_LABELS[m] ?? m}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Description */}
        {exercise.description ? (
          <View className="mb-lg">
            <Text className="text-ink-dim text-caption mb-xs">动作描述</Text>
            <Text className="text-ink text-body">{exercise.description}</Text>
          </View>
        ) : null}

        {/* Instructions (numbered steps) */}
        {instructionsSteps.length > 0 && (
          <View>
            <Text className="text-ink-dim text-caption mb-sm">动作要领</Text>
            {instructionsSteps.map((step, index) => (
              <View key={index} className="flex-row mb-sm">
                <View className="w-6 h-6 rounded-full bg-accent/20 items-center justify-center mr-sm mt-xxs">
                  <Text className="text-accent text-fine-print font-semibold">
                    {index + 1}
                  </Text>
                </View>
                <Text className="flex-1 text-ink text-body">{step}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function Header() {
  return (
    <View className="px-xl pt-14 pb-md flex-row items-center gap-sm">
      <TouchableOpacity
        onPress={() => router.back()}
        className="w-11 h-11 rounded-pill items-center justify-center"
      >
        <ChevronLeft color="#34c759" size={22} />
      </TouchableOpacity>
      <Text className="text-ink font-display text-headline">动作详情</Text>
    </View>
  );
}
