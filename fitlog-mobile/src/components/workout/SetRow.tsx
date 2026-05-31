import { View, Text, TouchableOpacity } from "react-native";
import { Play, Check, Minus, Plus } from "lucide-react-native";

type SetStatus = "pending" | "active" | "done";

interface SetData {
  weight: number;
  reps: number;
  status: SetStatus;
}

interface Props {
  index: number;
  data: SetData;
  onWeightChange: (w: number) => void;
  onRepsChange: (r: number) => void;
  onToggle: () => void;
  weightStep?: number;
}

const STATUS_BG: Record<SetStatus, string> = {
  pending: "bg-surface",
  active: "bg-[#1a3a24]",
  done: "bg-[#0a2e1a]",
};

export default function SetRow({
  index,
  data,
  onWeightChange,
  onRepsChange,
  onToggle,
  weightStep = 2.5,
}: Props) {
  const bg = STATUS_BG[data.status];
  const isDone = data.status === "done";

  return (
    <View className={`flex-row items-center px-2 py-1.5 rounded-lg mb-1 ${bg}`}>
      {/* Set number */}
      <Text className="text-ink-dim text-xs font-mono w-6">
        {isDone ? "✓" : index + 1}
      </Text>

      {/* Weight [− value +] */}
      <View className="flex-row items-center flex-1 justify-center">
        <TouchableOpacity
          onPress={() => onWeightChange(data.weight - weightStep)}
          className="w-7 h-7 bg-surface-elevated rounded-full items-center justify-center"
        >
          <Minus color="#f5f5f7" size={10} />
        </TouchableOpacity>
        <View className="w-10 items-center mx-0.5">
          <Text className="text-ink text-xs font-semibold">{data.weight}</Text>
          <Text className="text-ink-dim text-[8px] -mt-0.5">kg</Text>
        </View>
        <TouchableOpacity
          onPress={() => onWeightChange(data.weight + weightStep)}
          className="w-7 h-7 bg-surface-elevated rounded-full items-center justify-center"
        >
          <Plus color="#f5f5f7" size={10} />
        </TouchableOpacity>
      </View>

      <Text className="text-ink-dim text-xs mx-0.5">×</Text>

      {/* Reps [− value +] */}
      <View className="flex-row items-center flex-1 justify-center">
        <TouchableOpacity
          onPress={() => onRepsChange(data.reps - 1)}
          className="w-7 h-7 bg-surface-elevated rounded-full items-center justify-center"
        >
          <Minus color="#f5f5f7" size={10} />
        </TouchableOpacity>
        <View className="w-8 items-center mx-0.5">
          <Text className="text-ink text-xs font-semibold">{data.reps}</Text>
          <Text className="text-ink-dim text-[8px] -mt-0.5">次</Text>
        </View>
        <TouchableOpacity
          onPress={() => onRepsChange(data.reps + 1)}
          className="w-7 h-7 bg-surface-elevated rounded-full items-center justify-center"
        >
          <Plus color="#f5f5f7" size={10} />
        </TouchableOpacity>
      </View>

      {/* Action */}
      <TouchableOpacity
        onPress={onToggle}
        className={`w-9 h-9 rounded-full items-center justify-center ml-1 ${
          isDone ? "bg-accent" : "bg-surface-elevated"
        }`}
      >
        {isDone ? (
          <Check color="#000000" size={14} />
        ) : (
          <Play color="#f5f5f7" size={12} />
        )}
      </TouchableOpacity>
    </View>
  );
}
