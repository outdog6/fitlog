import { View, Text, ScrollView } from "react-native";
import { BarChart3 } from "lucide-react-native";

export default function AnalyticsScreen() {
  return (
    <ScrollView className="flex-1 bg-canvas">
      <View className="px-xl pt-14 pb-md">
        <Text className="text-ink font-display text-hero">统计分析</Text>
        <Text className="text-ink-muted text-body mt-xxs">
          追踪你的训练量变化
        </Text>
      </View>

      <View className="px-xl items-center pt-section">
        <BarChart3 color="#6e6e73" size={44} />
        <Text className="text-ink-muted text-body mt-lg">训练数据不足</Text>
        <Text className="text-ink-dim text-fine-print mt-xxs">
          完成更多训练后查看统计
        </Text>
      </View>
    </ScrollView>
  );
}
