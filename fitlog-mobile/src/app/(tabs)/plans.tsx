import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Plus, ClipboardList } from "lucide-react-native";

export default function PlansScreen() {
  return (
    <ScrollView className="flex-1 bg-canvas">
      <View className="px-xl pt-14 pb-md flex-row justify-between items-center">
        <Text className="text-ink font-display text-hero">训练计划</Text>
        <TouchableOpacity className="bg-accent w-11 h-11 rounded-pill items-center justify-center active:scale-95">
          <Plus color="#000000" size={20} />
        </TouchableOpacity>
      </View>

      <View className="px-xl">
        <Text className="text-ink text-headline mb-md">模板计划</Text>
        <View className="bg-surface rounded-lg px-lg py-xxl items-center mb-xl">
          <ClipboardList color="#6e6e73" size={32} />
          <Text className="text-ink-muted text-body mt-sm">暂无计划模板</Text>
        </View>

        <Text className="text-ink text-headline mb-md">我的计划</Text>
        <View className="bg-surface rounded-lg px-lg py-xxl items-center pb-section">
          <ClipboardList color="#6e6e73" size={32} />
          <Text className="text-ink-muted text-body mt-sm">还没有自己的计划</Text>
        </View>
      </View>
    </ScrollView>
  );
}
