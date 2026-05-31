import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Minus, Plus } from "lucide-react-native";

interface Props {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  suffix?: string;
}

export default function StepperControl({ value, onChange, step = 1, suffix }: Props) {
  return (
    <View className="flex-row items-center gap-xxs">
      <TouchableOpacity
        onPress={() => onChange(value - step)}
        className="w-11 h-11 bg-surface-elevated rounded-pill items-center justify-center active:scale-95"
        activeOpacity={0.6}
      >
        <Minus color="#f5f5f7" size={16} />
      </TouchableOpacity>

      <View className="w-16 h-11 bg-surface rounded-md items-center justify-center">
        <View className="flex-row items-baseline gap-0.5">
          <TextInput
            className="text-ink text-body-strong text-center w-12"
            value={String(value)}
            keyboardType="numeric"
            onChangeText={(t) => {
              const n = parseFloat(t);
              if (!isNaN(n)) onChange(n);
            }}
          />
          {suffix && <Text className="text-ink-muted text-fine-print">{suffix}</Text>}
        </View>
      </View>

      <TouchableOpacity
        onPress={() => onChange(value + step)}
        className="w-11 h-11 bg-surface-elevated rounded-pill items-center justify-center active:scale-95"
        activeOpacity={0.6}
      >
        <Plus color="#f5f5f7" size={16} />
      </TouchableOpacity>
    </View>
  );
}
