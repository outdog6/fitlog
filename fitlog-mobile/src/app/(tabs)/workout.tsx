import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
} from "react-native";
import { Dumbbell, Plus, Trash2 } from "lucide-react-native";
import SetRow from "@/components/workout/SetRow";
import RestTimerOverlay from "@/components/workout/RestTimerOverlay";
import { getOrCreateLocalUser } from "@/lib/auth";
import { db } from "@/db";
import { workoutSessions, workoutSets } from "@/db/schema";

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
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerFilter, setPickerFilter] = useState<string | null>(null);
  const [allExercises, setAllExercises] = useState<
    { id: string; name: string; primaryMuscle: string }[]
  >([]);

  useEffect(() => {
    db.query.exercises.findMany().then((list) =>
      setAllExercises(list.map((e: any) => ({ id: e.id, name: e.name, primaryMuscle: e.primaryMuscle }))),
    );
  }, []);

  useEffect(() => {
    if (!isStarted) return;
    const iv = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(iv);
  }, [isStarted]);

  const filteredPickerExercises = allExercises.filter((ex) => {
    if (pickerFilter && ex.primaryMuscle !== pickerFilter) return false;
    if (pickerSearch && !ex.name.includes(pickerSearch)) return false;
    return true;
  });

  const activeSlot = slots[activeExerciseIdx];

  const openExercisePicker = () => {
    setPickerSearch("");
    setPickerFilter(null);
    setShowExercisePicker(true);
  };

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

      {slots.length === 0 ? (
        <View className="flex-1 px-xl">
          {/* Big play button */}
          <View className="items-center mt-xxl mb-lg">
            <TouchableOpacity
              onPress={openExercisePicker}
              className="w-20 h-20 rounded-full bg-accent items-center justify-center mb-lg active:scale-95"
              activeOpacity={0.8}
            >
              <Dumbbell color="#000000" size={28} />
            </TouchableOpacity>
            <Text className="text-ink text-body-strong mb-xxs">
              点击添加第一个训练动作
            </Text>
            <Text className="text-ink-dim text-fine-print">
              选择下方常用动作或浏览全部
            </Text>
          </View>

          {/* Quick pick */}
          <Text className="text-ink-dim text-fine-print uppercase mb-sm"
            style={{ letterSpacing: 1.5 }}>
            常用动作
          </Text>
          <View className="flex-row flex-wrap gap-xs mb-lg">
            {allExercises.slice(0, 6).map((ex) => (
              <TouchableOpacity
                key={ex.id}
                onPress={() => addExercise(ex)}
                className="px-md py-sm bg-surface rounded-pill active:scale-95"
                activeOpacity={0.7}
              >
                <Text className="text-ink text-caption">{ex.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="items-center">
            <TouchableOpacity onPress={openExercisePicker}>
              <Text className="text-accent text-caption-strong">浏览全部动作 →</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom sheet picker */}
          {showExercisePicker && (
            <View
              className="absolute bottom-0 left-0 right-0 bg-canvas-alt rounded-t-2xl px-xl pt-md pb-xxl z-10"
              style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
            >
              <View className="w-8 h-1 bg-hairline rounded-pill self-center mb-lg" />
              <Text className="text-ink text-body-strong mb-md">选择训练动作</Text>

              {/* Search input */}
              <View className="flex-row items-center bg-surface rounded-lg px-lg h-11 mb-md">
                <TextInput
                  className="flex-1 text-ink text-caption"
                  placeholder="搜索动作..."
                  placeholderTextColor="#6e6e73"
                  value={pickerSearch}
                  onChangeText={setPickerSearch}
                />
              </View>

              {/* Muscle filter */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-md">
                {["全部", "胸", "背", "腿", "肩", "手臂"].map((label) => {
                  const muscleKeyMap: Record<string, string | null> = {
                    "全部": null, "胸": "chest", "背": "back", "腿": "legs", "肩": "shoulders", "手臂": "arms"
                  };
                  const key = muscleKeyMap[label];
                  const isSelected = pickerFilter === key;
                  return (
                    <TouchableOpacity
                      key={label}
                      onPress={() => setPickerFilter(key)}
                      className={`mr-xs px-md py-1.5 rounded-pill ${isSelected ? "bg-accent" : "bg-surface"}`}
                    >
                      <Text className={`text-caption-strong ${isSelected ? "text-canvas" : "text-ink-muted"}`}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <ScrollView className="max-h-56">
                {filteredPickerExercises.length === 0 && pickerSearch && (
                  <Text className="text-ink-muted text-caption text-center py-lg">没有匹配的动作</Text>
                )}
                {filteredPickerExercises.map((ex) => (
                  <TouchableOpacity
                    key={ex.id}
                    onPress={() => addExercise(ex)}
                    className="flex-row justify-between items-center py-md border-b border-hairline"
                  >
                    <Text className="text-ink text-caption">{ex.name}</Text>
                    <Text className="text-ink-muted text-fine-print">添加 +</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity onPress={() => setShowExercisePicker(false)} className="mt-lg py-xs">
                <Text className="text-ink-muted text-caption text-center">取消</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <View className="flex-1">
          {/* Compact header */}
          <View className="px-xl pt-14 pb-sm flex-row justify-between items-center">
            <View>
              <Text className="text-ink-dim text-fine-print">训练中</Text>
              <Text className="text-accent font-display text-display-lg font-mono">
                {formatTime(elapsed)}
              </Text>
            </View>
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
                      setActiveExerciseIdx(0);
                      setShowExercisePicker(false);
                    },
                  },
                ]);
              }}
              className="w-9 h-9 rounded-full bg-surface items-center justify-center"
            >
              <Trash2 color="#ff453a" size={16} />
            </TouchableOpacity>
          </View>

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
                  className={`mr-xs px-2.5 rounded-pill ${
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

      {/* Bottom bar: finish + add */}
      {slots.length > 0 && (
        <View className="absolute bottom-4 left-xl right-xl flex-row gap-sm">
          <TouchableOpacity
            onPress={finishWorkout}
            className="flex-1 bg-accent py-md rounded-pill items-center active:scale-95"
            activeOpacity={0.8}
          >
            <Text className="text-canvas text-body-strong">
              完成训练
              {(() => {
                const done = slots.reduce(
                  (sum, s) => sum + s.sets.filter((x) => x.status === "done").length, 0
                );
                const total = slots.reduce((sum, s) => sum + s.sets.length, 0);
                return total > 0 ? ` ${done}/${total}` : "";
              })()}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowExercisePicker(!showExercisePicker)}
            className="w-12 h-12 rounded-full bg-surface items-center justify-center"
          >
            <Plus color="#34c759" size={22} />
          </TouchableOpacity>

          {/* Inline picker for adding exercise during workout */}
          {showExercisePicker && (
            <View className="absolute bottom-16 right-0 left-0 bg-canvas-alt rounded-lg p-lg border border-hairline">
              <Text className="text-ink text-caption-strong mb-sm">添加动作</Text>

              {/* Search */}
              <View className="flex-row items-center bg-surface rounded-lg px-md h-9 mb-sm">
                <TextInput
                  className="flex-1 text-ink text-fine-print"
                  placeholder="搜索..."
                  placeholderTextColor="#6e6e73"
                  value={pickerSearch}
                  onChangeText={setPickerSearch}
                />
              </View>

              {/* Muscle filter chips */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-sm">
                {["全部", "胸", "背", "腿", "肩", "手臂"].map((label) => {
                  const muscleKeyMap: Record<string, string | null> = {
                    "全部": null, "胸": "chest", "背": "back", "腿": "legs", "肩": "shoulders", "手臂": "arms"
                  };
                  const key = muscleKeyMap[label];
                  const isSelected = pickerFilter === key;
                  return (
                    <TouchableOpacity
                      key={label}
                      onPress={() => setPickerFilter(key)}
                      className={`mr-xs px-sm py-1 rounded-pill ${isSelected ? "bg-accent" : "bg-surface"}`}
                    >
                      <Text className={`text-fine-print ${isSelected ? "text-canvas" : "text-ink-muted"}`}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <ScrollView className="max-h-48">
                <View className="flex-row flex-wrap gap-xs">
                  {filteredPickerExercises
                    .filter((ex) => !slots.find((s) => s.exerciseId === ex.id))
                    .map((ex) => (
                      <TouchableOpacity
                        key={ex.id}
                        onPress={() => addExercise(ex)}
                        className="px-md py-sm bg-surface rounded-pill active:scale-95"
                      >
                        <Text className="text-ink-muted text-fine-print">{ex.name}</Text>
                      </TouchableOpacity>
                    ))}
                </View>
                {filteredPickerExercises.filter((ex) => !slots.find((s) => s.exerciseId === ex.id)).length === 0 && pickerSearch && (
                  <Text className="text-ink-muted text-fine-print text-center py-md">没有匹配的动作</Text>
                )}
              </ScrollView>
            </View>
          )}
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
