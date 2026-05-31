import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Search, X } from "lucide-react-native";
import { db } from "@/db";
import { exercises } from "@/db/schema";

const MUSCLE_LABELS: Record<string, string> = {
  chest: "胸",
  back: "背",
  legs: "腿",
  shoulders: "肩",
  arms: "手臂",
  core: "核心",
};

const EQUIPMENT_LABELS: Record<string, string> = {
  barbell: "杠铃",
  dumbbell: "哑铃",
  cable: "绳索",
  machine: "器械",
  bodyweight: "自重",
};

export default function ExercisesScreen() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string | null>(null);
  const [all, setAll] = useState<
    { id: string; name: string; primaryMuscle: string; equipment: string }[]
  >([]);

  useEffect(() => {
    db.query.exercises.findMany().then((list) => setAll(list as any));
  }, []);

  const filtered = all.filter((ex) => {
    if (filter && ex.primaryMuscle !== filter) return false;
    if (search && !ex.name.includes(search)) return false;
    return true;
  });

  const muscles = [...new Set(all.map((e) => e.primaryMuscle))];

  return (
    <View className="flex-1 bg-canvas">
      <View className="px-xl pt-14 pb-md">
        <Text className="text-ink font-display text-hero mb-sm">动作库</Text>

        {/* Search */}
        <View className="flex-row items-center bg-surface rounded-pill px-lg h-11">
          <Search color="#6e6e73" size={16} />
          <TextInput
            className="flex-1 ml-xs text-ink text-body"
            placeholder="搜索动作..."
            placeholderTextColor="#6e6e73"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <X color="#6e6e73" size={16} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter chips */}
      {muscles.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-xl mb-lg"
        >
          <TouchableOpacity
            onPress={() => setFilter(null)}
            className={`mr-xs px-md py-1.5 rounded-pill ${
              !filter ? "bg-accent" : "bg-surface"
            }`}
          >
            <Text
              className={`text-caption-strong ${
                !filter ? "text-canvas" : "text-ink-muted"
              }`}
            >
              全部
            </Text>
          </TouchableOpacity>
          {muscles.map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => setFilter(m)}
              className={`mr-xs px-md py-1.5 rounded-pill ${
                filter === m ? "bg-accent" : "bg-surface"
              }`}
            >
              <Text
                className={`text-caption-strong ${
                  filter === m ? "text-canvas" : "text-ink-muted"
                }`}
              >
                {MUSCLE_LABELS[m] ?? m}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Exercise list */}
      <ScrollView className="flex-1 px-xl" contentContainerStyle={{ paddingBottom: 100 }}>
        {filtered.length === 0 ? (
          <View className="items-center pt-xxl">
            <Text className="text-ink-muted text-body">
              {all.length === 0 ? "加载中..." : "没有匹配的动作"}
            </Text>
          </View>
        ) : (
          filtered.map((ex) => (
            <View
              key={ex.id}
              className="flex-row items-center justify-between py-md border-b border-hairline"
            >
              <View className="flex-1">
                <Text className="text-ink text-body-strong">{ex.name}</Text>
                <View className="flex-row gap-sm mt-xxs">
                  <Text className="text-ink-dim text-fine-print">
                    {MUSCLE_LABELS[ex.primaryMuscle] ?? ex.primaryMuscle}
                  </Text>
                  <Text className="text-ink-dim text-fine-print">
                    {EQUIPMENT_LABELS[ex.equipment] ?? ex.equipment}
                  </Text>
                </View>
              </View>
              <View className="w-8 h-8 rounded-pill bg-surface-variant items-center justify-center">
                <Text className="text-ink-muted text-fine-print">→</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
