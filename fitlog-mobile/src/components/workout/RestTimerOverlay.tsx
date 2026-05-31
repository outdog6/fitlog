import { View, Text, TouchableOpacity, Modal } from "react-native";
import { useEffect, useState } from "react";
import { X, Timer } from "lucide-react-native";

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

  const progress = target > 0 ? seconds / target : 0;
  const barColor =
    progress > 0.66 ? "bg-accent" : progress > 0.33 ? "bg-[#ff9f0a]" : "bg-danger";

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const display = `${mins}:${secs.toString().padStart(2, "0")}`;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View className="flex-1 bg-canvas/95 items-center justify-center px-xxl">
        {/* Close */}
        <TouchableOpacity
          onPress={onSkip}
          className="absolute top-14 right-xl w-11 h-11 items-center justify-center"
        >
          <X color="#6e6e73" size={22} />
        </TouchableOpacity>

        <Timer color="#34c759" size={44} />
        <Text className="text-ink-muted text-caption mt-sm">组间休息</Text>

        {/* Timer */}
        <Text className="text-ink font-display text-6xl font-semibold mt-xl tracking-widest">
          {display}
        </Text>

        {/* Progress bar */}
        <View className="w-64 h-1 bg-surface rounded-pill mt-xl overflow-hidden">
          <View
            className={`h-full ${barColor} rounded-pill`}
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </View>

        {nextExercise && (
          <Text className="text-ink-muted text-caption mt-lg">
            下一个: {nextExercise}
          </Text>
        )}

        {/* Actions */}
        <View className="flex-row gap-md mt-xxl">
          <TouchableOpacity
            onPress={addTime}
            className="px-xl py-md bg-surface rounded-pill active:scale-95"
            activeOpacity={0.7}
          >
            <Text className="text-ink text-body-strong">+30s</Text>
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
