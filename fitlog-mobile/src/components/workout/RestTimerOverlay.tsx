import { View, Text, TouchableOpacity, Modal } from "react-native";
import { useEffect, useState } from "react";
import { X } from "lucide-react-native";

interface Props {
  visible: boolean;
  defaultSeconds?: number;
  nextExercise?: string;
  onComplete: () => void;
  onSkip: () => void;
}

export default function RestTimerOverlay({
  visible,
  defaultSeconds = 90,
  nextExercise,
  onComplete,
  onSkip,
}: Props) {
  const [seconds, setSeconds] = useState(defaultSeconds);
  const [target, setTarget] = useState(defaultSeconds);

  useEffect(() => {
    if (!visible) {
      setSeconds(defaultSeconds);
      setTarget(defaultSeconds);
      return;
    }
    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [visible, defaultSeconds, onComplete]);

  const addTime = () => {
    setTarget((t) => t + 30);
    setSeconds((s) => s + 30);
  };

  const progress = target > 0 ? 1 - seconds / target : 0;

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const display = `${mins}:${secs.toString().padStart(2, "0")}`;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View
        className="flex-1 items-center justify-center px-xxl"
        style={{ backgroundColor: "rgba(0,0,0,0.97)" }}
      >
        <TouchableOpacity
          onPress={onSkip}
          className="absolute top-14 right-xl w-11 h-11 items-center justify-center"
        >
          <X color="#6e6e73" size={22} />
        </TouchableOpacity>

        {nextExercise ? (
          <Text className="text-ink-dim text-caption mb-sm">
            下一动作：{nextExercise}
          </Text>
        ) : null}

        <Text
          className="text-accent text-fine-print font-semibold uppercase mb-lg"
          style={{ letterSpacing: 2 }}
        >
          组间休息
        </Text>

        {/* Circular progress ring */}
        <View className="w-40 h-40 rounded-full items-center justify-center mb-lg"
          style={{ borderWidth: 4, borderColor: "#272729" }}
        >
          <View
            className="absolute inset-0 rounded-full"
            style={{
              borderWidth: 4,
              borderTopColor: "#34c759",
              borderRightColor: "#34c759",
              borderBottomColor: "transparent",
              borderLeftColor: "transparent",
              transform: [{ rotate: `${-45 + progress * 360}deg` }],
              opacity: progress > 0 ? 1 : 0,
            }}
          />
          <View className="items-center">
            <Text className="text-ink font-display text-hero font-mono tracking-tight">
              {display}
            </Text>
            <Text className="text-ink-dim text-fine-print mt-xxs">剩余</Text>
          </View>
        </View>

        <View className="flex-row gap-md mt-lg">
          <TouchableOpacity
            onPress={addTime}
            className="px-xl py-md bg-surface rounded-pill active:scale-95"
            activeOpacity={0.7}
          >
            <Text className="text-ink text-body-strong">+30秒</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onSkip}
            className="px-xl py-md bg-accent rounded-pill active:scale-95"
            activeOpacity={0.7}
          >
            <Text className="text-canvas text-body-strong">跳过休息</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
