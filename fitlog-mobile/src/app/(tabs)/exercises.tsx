import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Search, X, Plus } from "lucide-react-native";
import { useFocusEffect, Link } from "expo-router";
import { db } from "@/db";
import type { Exercise } from "@/db/schema";
import { MUSCLE_LABELS, MUSCLE_COLORS, MUSCLE_BG, EQUIPMENT_LABELS } from "@/constants/theme";

export default function ExercisesScreen() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string | null>(null);
  const [all, setAll] = useState<Pick<Exercise, "id" | "name" | "primaryMuscle" | "equipment">[]>([]);
  const [loaded, setLoaded] = useState(false);

  const loadExercises = useCallback(() => {
    db.query.exercises.findMany().then((list) => {
      setAll(list);
      setLoaded(true);
    }).catch(() => {
      setLoaded(true);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadExercises();
    }, [loadExercises])
  );

  const filtered = all.filter((ex) => {
    if (filter && ex.primaryMuscle !== filter) return false;
    if (search && !ex.name.includes(search)) return false;
    return true;
  });

  const muscles = [...new Set(all.map((e) => e.primaryMuscle))];

  return (
    <View className="flex-1 bg-canvas">
      <View className="px-xl pt-14 pb-md">
        <View className="flex-row justify-between items-center mb-sm">
          <View>
            <Text className="text-ink font-display text-hero mb-xxs">动作库</Text>
            <Text className="text-ink-dim text-fine-print">共 {all.length} 个动作</Text>
          </View>
          <Link href="/exercise/new" asChild>
            <TouchableOpacity className="bg-accent w-11 h-11 rounded-full items-center justify-center active:scale-95">
              <Plus color="#000000" size={20} />
            </TouchableOpacity>
          </Link>
        </View>

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
        {!loaded ? (
          <View className="items-center pt-xxl">
            <Text className="text-ink-muted text-body">加载中...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View className="items-center pt-xxl">
            <Text className="text-ink-muted text-body">
              {all.length === 0 ? "暂无动作" : "没有匹配的动作"}
            </Text>
          </View>
        ) : (
          filtered.map((ex) => {
            const mColor = MUSCLE_COLORS[ex.primaryMuscle] ?? "#6e6e73";
            const mBg = MUSCLE_BG[ex.primaryMuscle] ?? "rgba(152,152,157,0.1)";
            return (
              <Link
                key={ex.id}
                href={{ pathname: "/exercise/[id]", params: { id: ex.id } }}
                asChild
              >
                <TouchableOpacity className="flex-row items-center justify-between py-md border-b border-hairline">
                  <View className="flex-1">
                    <Text className="text-ink text-body-strong">{ex.name}</Text>
                    <View className="flex-row gap-xs mt-xxs">
                      <View
                        className="px-xs py-0.5 rounded-pill"
                        style={{ backgroundColor: mBg }}
                      >
                        <Text className="text-fine-print" style={{ color: mColor }}>
                          {MUSCLE_LABELS[ex.primaryMuscle] ?? ex.primaryMuscle}
                        </Text>
                      </View>
                      <View className="px-xs py-0.5 rounded-pill bg-pill-bg">
                        <Text className="text-ink-dim text-fine-print">
                          {EQUIPMENT_LABELS[ex.equipment] ?? ex.equipment}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text className="text-ink-dim text-caption">→</Text>
                </TouchableOpacity>
              </Link>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
