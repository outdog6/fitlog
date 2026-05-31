import { View, Text, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View className="flex-1 bg-canvas">
      <View className="px-xl pt-14 pb-md flex-row items-center gap-sm">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-11 h-11 rounded-pill items-center justify-center"
        >
          <ChevronLeft color="#34c759" size={22} />
        </TouchableOpacity>
        <Text className="text-ink font-display text-headline">动作详情</Text>
      </View>
      <View className="flex-1 items-center justify-center">
        <Text className="text-ink-muted text-body">{id}</Text>
      </View>
    </View>
  );
}
