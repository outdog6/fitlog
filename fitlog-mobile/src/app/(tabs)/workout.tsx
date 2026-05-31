import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { Dumbbell, Plus, Timer, Trash2 } from "lucide-react-native";
import SetRow from "@/components/workout/SetRow";
import RestTimerOverlay from "@/components/workout/RestTimerOverlay";
import { getOrCreateLocalUser } from "@/lib/auth";
import { db } from "@/db";
import { exercises, workoutSessions, workoutSets } from "@/db/schema";
import { eq } from "drizzle-orm";

type SetData = {
  weight: number;
  reps: number;
  status: "pending" | "active" | "done";
};

type ExerciseSlot = {
  exerciseId: string;
  exerciseName: string;
  sets: SetData[];
};

export default function WorkoutScreen() {
  const [slots, setSlots] = useState<ExerciseSlot[]>([]);
  const [activeExerciseIdx, setActiveExerciseIdx] = useState(0);
  const [isResting, setResting] = useState(false);
  const [nextExerciseName, setNextExerciseName] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [allExercises, setAllExercises] = useState<
    { id: string; name: string }[]
  >([]);

  useEffect(() => {
    db.query.exercises.findMany().then((list) =>
      setAllExercises(list.map((e: any) => ({ id: e.id, name: e.name }))),
    );
  }, []);

  useEffect(() => {
    if (!isStarted) return;
    const iv = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(iv);
  }, [isStarted]);

  const activeSlot = slots[activeExerciseIdx];

  const addExercise = (ex: { id: string; name: string }) => {
    setSlots((prev) => [
      ...prev,
      {
        exerciseId: ex.id,
        exerciseName: ex.name,
        sets: [{ weight: 20, reps: 10, status: "pending" }],
      },
    ]);
    setShowExercisePicker(false);
    if (!isStarted) setIsStarted(true);
  };

  const addSet = () => {
    if (!activeSlot) return;
    const lastSet = activeSlot.sets[activeSlot.sets.length - 1];
    setSlots((prev) =>
      prev.map((s, i) =>
        i === activeExerciseIdx
          ? {
              ...s,
              sets: [
                ...s.sets,
                {
                  weight: lastSet?.weight ?? 20,
                  reps: lastSet?.reps ?? 10,
                  status: "pending" as const,
                },
              ],
            }
          : s,
      ),
    );
  };

  const toggleSet = (setIdx: number) => {
    setSlots((prev) =>
      prev.map((s, i) =>
        i === activeExerciseIdx
          ? {
              ...s,
              sets: s.sets.map((set, j) => {
                if (j !== setIdx) return set;
                if (set.status === "pending")
                  return { ...set, status: "active" as const };
                if (set.status === "active") {
                  const nextPending = s.sets.findIndex(
                    (x) => x.status === "pending",
                  );
                  if (nextPending !== -1) {
                    setNextExerciseName(s.exerciseName);
                    setResting(true);
                  }
                  return { ...set, status: "done" as const };
                }
                return set;
              }),
            }
          : s,
      ),
    );
  };

  const updateSet = (
    setIdx: number,
    field: "weight" | "reps",
    value: number,
  ) => {
    setSlots((prev) =>
      prev.map((s, i) =>
        i === activeExerciseIdx
          ? {
              ...s,
              sets: s.sets.map((set, j) =>
                j === setIdx ? { ...set, [field]: value } : set,
              ),
            }
          : s,
      ),
    );
  };

  const finishWorkout = useCallback(async () => {
    const totalSets = slots.reduce(
      (sum, s) => sum + s.sets.filter((x) => x.status === "done").length,
      0,
    );
    if (totalSets === 0) {
      Alert.alert("提示", "请至少完成一组训练");
      return;
    }
    try {
      const user = await getOrCreateLocalUser();
      const [session] = await db
        .insert(workoutSessions)
        .values({ userId: user.id, date: new Date(), duration: elapsed })
        .returning();

      const allSets = slots.flatMap((slot) =>
        slot.sets
          .filter((s) => s.status === "done")
          .map((s, idx) => ({
            sessionId: session.id,
            exerciseId: slot.exerciseId,
            setNumber: idx + 1,
            weight: s.weight,
            reps: s.reps,
          })),
      );

      await db.insert(workoutSets).values(allSets);
      Alert.alert("完成", `记录了 ${totalSets} 组训练`, [
        { text: "好的", onPress: () => setSlots([]) },
      ]);
      setIsStarted(false);
      setElapsed(0);
    } catch (err) {
      Alert.alert("错误", "保存失败");
    }
  }, [slots, elapsed]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    return `${m}:${(s % 60).toString().padStart(2, "0")}`;
  };

  return (
    <View className="flex-1 bg-canvas">
      {/* Header */}
      <View className="px-xl pt-14 pb-md flex-row justify-between items-center">
        <View>
          <Text className="text-ink font-display text-hero">训练</Text>
          {isStarted && (
            <Text className="text-ink-muted text-caption font-mono mt-xxs">
              {formatTime(elapsed)}
            </Text>
          )}
        </View>
        {slots.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              Alert.alert("结束训练", "确定要结束当前训练吗？", [
                { text: "取消", style: "cancel" },
                {
                  text: "结束",
                  onPress: () => {
                    setSlots([]);
                    setIsStarted(false);
                    setElapsed(0);
                  },
                },
              ]);
            }}
            className="p-xs"
          >
            <Trash2 color="#ff453a" size={20} />
          </TouchableOpacity>
        )}
      </View>

      {slots.length === 0 ? (
        <View className="flex-1 px-xl">
          {/* Quick Start CTA */}
          <TouchableOpacity
            onPress={() => setShowExercisePicker(true)}
            className="bg-accent py-md px-lg rounded-pill items-center mb-lg active:scale-95"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center gap-xs">
              <Dumbbell color="#000000" size={20} />
              <View>
                <Text className="text-canvas text-body-strong">
                  快速开始
                </Text>
                <Text className="text-canvas/70 text-fine-print">
                  选择动作，立即开始记录
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {showExercisePicker && (
            <View className="bg-surface rounded-lg p-lg mb-lg">
              <Text className="text-ink text-body-strong mb-md">
                选择训练动作
              </Text>
              <View className="flex-row flex-wrap gap-xs">
                {allExercises.map((ex) => (
                  <TouchableOpacity
                    key={ex.id}
                    onPress={() => addExercise(ex)}
                    className="px-md py-sm bg-surface-variant rounded-pill active:scale-95"
                    activeOpacity={0.7}
                  >
                    <Text className="text-ink text-caption">{ex.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                onPress={() => setShowExercisePicker(false)}
                className="mt-md py-xs"
              >
                <Text className="text-ink-muted text-caption text-center">
                  取消
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            <Text className="text-ink text-caption-strong mb-sm mt-lg">
              可选动作 ({allExercises.length})
            </Text>
            <View className="flex-row flex-wrap gap-xs">
              {allExercises.map((ex) => (
                <TouchableOpacity
                  key={ex.id}
                  onPress={() => addExercise(ex)}
                  className="px-md py-sm bg-surface rounded-pill active:scale-95"
                  activeOpacity={0.7}
                >
                  <Text className="text-ink-muted text-fine-print">
                    {ex.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      ) : (
        <View className="flex-1">
          {/* Exercise tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-xl mb-md"
          >
            {slots.map((slot, idx) => {
              const done = slot.sets.filter((s) => s.status === "done").length;
              const isActive = idx === activeExerciseIdx;
              return (
                <TouchableOpacity
                  key={slot.exerciseId}
                  onPress={() => setActiveExerciseIdx(idx)}
                  className={`mr-xs px-2.5 py-0 rounded-pill ${
                    isActive ? "bg-accent" : "bg-surface"
                  }`}
                >
                  <Text
                    className={`text-fine-print ${
                      isActive ? "text-canvas" : "text-ink-muted"
                    }`}
                  >
                    {slot.exerciseName} {done}/{slot.sets.length}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Set list */}
          <FlatList
            className="flex-1"
            data={activeSlot?.sets ?? []}
            keyExtractor={(_, i) => `${activeExerciseIdx}-${i}`}
            renderItem={({ item, index }) => (
              <View className="px-xl">
                <SetRow
                  index={index}
                  data={item}
                  onWeightChange={(w) => updateSet(index, "weight", w)}
                  onRepsChange={(r) => updateSet(index, "reps", r)}
                  onToggle={() => toggleSet(index)}
                />
              </View>
            )}
            ListFooterComponent={
              <TouchableOpacity
                onPress={addSet}
                className="mx-xl mt-1 mb-4 py-2 bg-surface rounded-lg items-center border border-hairline"
              >
                <Plus color="#6e6e73" size={18} />
                <Text className="text-ink-muted text-fine-print mt-xxs">
                  添加一组
                </Text>
              </TouchableOpacity>
            }
            contentContainerStyle={{ paddingBottom: 120 }}
          />
        </View>
      )}

      {/* FAB: add exercise */}
      {slots.length > 0 && (
        <TouchableOpacity
          onPress={() => setShowExercisePicker(!showExercisePicker)}
          className="absolute bottom-28 right-xl w-11 h-11 bg-surface-elevated rounded-full items-center justify-center"
        >
          <Plus color="#34c759" size={22} />
        </TouchableOpacity>
      )}

      {/* Inline exercise picker */}
      {slots.length > 0 && showExercisePicker && (
        <View className="absolute bottom-48 right-xl left-xl bg-surface rounded-lg p-lg border border-hairline">
          <Text className="text-ink text-caption-strong mb-sm">添加动作</Text>
          <ScrollView className="max-h-48">
            <View className="flex-row flex-wrap gap-xs">
              {allExercises
                .filter((ex) => !slots.find((s) => s.exerciseId === ex.id))
                .map((ex) => (
                  <TouchableOpacity
                    key={ex.id}
                    onPress={() => addExercise(ex)}
                    className="px-md py-sm bg-surface-variant rounded-pill active:scale-95"
                  >
                    <Text className="text-ink-muted text-fine-print">
                      {ex.name}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Finish button */}
      {slots.length > 0 && (
        <View className="absolute bottom-4 left-xl right-xl z-10">
          <TouchableOpacity
            onPress={finishWorkout}
            className="bg-accent py-md rounded-pill items-center active:scale-95"
            activeOpacity={0.8}
          >
            <Text className="text-canvas text-body-strong">
              完成训练
              {(() => {
                const done = slots.reduce(
                  (sum, s) =>
                    sum + s.sets.filter((x) => x.status === "done").length,
                  0,
                );
                const total = slots.reduce(
                  (sum, s) => sum + s.sets.length,
                  0,
                );
                return total > 0 ? ` (${done}/${total})` : "";
              })()}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Rest timer */}
      <RestTimerOverlay
        visible={isResting}
        defaultSeconds={90}
        nextExercise={nextExerciseName}
        onComplete={() => setResting(false)}
        onSkip={() => setResting(false)}
      />
    </View>
  );
}
