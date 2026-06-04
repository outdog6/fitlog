import { View, Text, TouchableOpacity, Modal } from "react-native";

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive" | "primary";
}

interface Props {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  onDismiss?: () => void;
}

export default function AlertModal({ visible, title, message, buttons = [], onDismiss }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View
        className="flex-1 items-center justify-center px-xxl"
        style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      >
        <View className="bg-surface rounded-2xl w-full max-w-sm overflow-hidden">
          <View className="px-xl pt-xxl pb-lg items-center">
            <Text className="text-ink text-body-strong text-center mb-xs">{title}</Text>
            {message ? (
              <Text className="text-ink-dim text-caption text-center">{message}</Text>
            ) : null}
          </View>
          <View className="border-t border-hairline">
            {buttons.length === 0 ? (
              <TouchableOpacity
                onPress={onDismiss}
                className="py-md items-center active:bg-surface-variant"
              >
                <Text className="text-accent text-body-strong">确定</Text>
              </TouchableOpacity>
            ) : buttons.length <= 2 ? (
              <View className="flex-row">
                {buttons.map((btn, i) => {
                  const isPrimary = btn.style === "primary";
                  const isDestructive = btn.style === "destructive";
                  return (
                    <TouchableOpacity
                      key={i}
                      onPress={btn.onPress}
                      className={`flex-1 py-md items-center active:bg-surface-variant ${
                        i > 0 ? "border-l border-hairline" : ""
                      }`}
                    >
                      <Text
                        className={`text-body-strong ${
                          isDestructive ? "text-danger" : isPrimary ? "text-accent" : "text-ink"
                        }`}
                      >
                        {btn.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              buttons.map((btn, i) => {
                const isPrimary = btn.style === "primary";
                const isDestructive = btn.style === "destructive";
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={btn.onPress}
                    className={`py-md items-center active:bg-surface-variant border-t border-hairline`}
                  >
                    <Text
                      className={`text-body-strong ${
                        isDestructive ? "text-danger" : isPrimary ? "text-accent" : "text-ink"
                      }`}
                    >
                      {btn.text}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
