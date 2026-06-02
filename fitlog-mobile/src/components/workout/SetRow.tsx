import { View, Text, TouchableOpacity } from "react-native";
import { Play, Check } from "lucide-react-native";

type SetStatus = "pending" | "active" | "done";

interface SetData {
  weight: number;
  reps: number;
  status: SetStatus;
  restAfter?: number;
}

interface Props {
  index: number;
  data: SetData;
  onWeightChange: (w: number) => void;
  onRepsChange: (r: number) => void;
  onToggle: () => void;
  weightStep?: number;
}

export default function SetRow({
  index,
  data,
  onWeightChange,
  onRepsChange,
  onToggle,
  weightStep = 2.5,
}: Props) {
  const isDone = data.status === "done";
  const isActive = data.status === "active";

  // Done state
  if (isDone) {
    return (
      <View className="flex-row items-center bg-accent/10 border border-accent/15 rounded-lg px-md py-sm mb-xs">
        <View className="w-6 h-6 rounded-full bg-accent items-center justify-center mr-sm">
          <Check color="#000000" size={12} />
        </View>
        <Text className="text-ink-muted text-caption flex-1">
          <Text className="text-ink-muted">{data.weight} kg</Text>
          {"  x  "}
          <Text className="text-ink-muted">{data.reps} 次</Text>
        </Text>
        {data.restAfter != null && data.restAfter > 0 && (
          <Text className="text-ink-dim text-fine-print">
            组间 {Math.floor(data.restAfter / 60)}:{String(data.restAfter % 60).padStart(2, "0")}
          </Text>
        )}
      </View>
    );
  }

  // Active state
  if (isActive) {
    return (
      <View className="bg-surface border border-accent rounded-lg px-md py-md mb-xs">
        <View className="flex-row items-center gap-sm mb-md">
          <View className="w-6 h-6 rounded-full bg-accent items-center justify-center">
            <Play color="#000000" size={10} />
          </View>
          <Text className="text-ink text-body-strong">组 {index + 1}</Text>
        </View>
        <View className="flex-row gap-sm">
          {/* Weight */}
          <View className="flex-1 bg-canvas-alt rounded-lg px-sm py-sm items-center">
            <Text className="text-ink-dim text-fine-print mb-xxs">重量</Text>
            <View className="flex-row items-center gap-sm">
              <TouchableOpacity
                onPress={() => onWeightChange(data.weight - weightStep)}
                className="w-7 h-7 rounded-full bg-surface items-center justify-center"
              >
                <Text className="text-ink-muted text-caption">−</Text>
              </TouchableOpacity>
              <Text className="text-ink font-display text-headline">
                {data.weight}
              </Text>
              <TouchableOpacity
                onPress={() => onWeightChange(data.weight + weightStep)}
                className="w-7 h-7 rounded-full bg-surface items-center justify-center"
              >
                <Text className="text-ink-muted text-caption">+</Text>
              </TouchableOpacity>
            </View>
            <Text className="text-ink-dim text-fine-print mt-xxs">kg</Text>
          </View>
          {/* Reps */}
          <View className="flex-1 bg-canvas-alt rounded-lg px-sm py-sm items-center">
            <Text className="text-ink-dim text-fine-print mb-xxs">次数</Text>
            <View className="flex-row items-center gap-sm">
              <TouchableOpacity
                onPress={() => onRepsChange(data.reps - 1)}
                className="w-7 h-7 rounded-full bg-surface items-center justify-center"
              >
                <Text className="text-ink-muted text-caption">−</Text>
              </TouchableOpacity>
              <Text className="text-ink font-display text-headline">
                {data.reps}
              </Text>
              <TouchableOpacity
                onPress={() => onRepsChange(data.reps + 1)}
                className="w-7 h-7 rounded-full bg-surface items-center justify-center"
              >
                <Text className="text-ink-muted text-caption">+</Text>
              </TouchableOpacity>
            </View>
            <Text className="text-ink-dim text-fine-print mt-xxs">次</Text>
          </View>
        </View>
        {/* Done button */}
        <TouchableOpacity
          onPress={onToggle}
          className="mt-md bg-accent rounded-lg py-sm items-center active:scale-[0.98]"
          activeOpacity={0.8}
        >
          <Text className="text-canvas text-caption-strong">完成这组</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Pending state
  return (
    <View className="flex-row items-center bg-surface border border-hairline rounded-lg px-md py-sm mb-xs">
      <View className="w-6 h-6 rounded-full bg-surface-elevated items-center justify-center mr-sm">
        <Text className="text-ink-dim text-fine-print">{index + 1}</Text>
      </View>
      <Text className="text-ink-dim text-caption flex-1">
        {data.weight} kg x {data.reps} 次
      </Text>
      <TouchableOpacity
        onPress={onToggle}
        className="w-9 h-9 rounded-full bg-surface-elevated items-center justify-center"
      >
        <Play color="#f5f5f7" size={12} />
      </TouchableOpacity>
    </View>
  );
}
