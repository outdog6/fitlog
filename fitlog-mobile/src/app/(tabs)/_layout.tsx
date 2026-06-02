import { Tabs } from "expo-router";
import {
  Dumbbell,
  Home,
  ClipboardList,
  BarChart3,
  BookOpen,
} from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#34c759",
        tabBarInactiveTintColor: "#6e6e73",
        tabBarStyle: {
          backgroundColor: "#1d1d1f",
          borderTopColor: "#3a3a3c",
          borderTopWidth: 0.5,
          paddingTop: 4,
          height: 84,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "仪表盘",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: "训练",
          tabBarIcon: ({ color, size }) => (
            <Dumbbell color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: "动作库",
          tabBarIcon: ({ color, size }) => (
            <BookOpen color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="plans"
        options={{
          title: "计划",
          tabBarIcon: ({ color, size }) => (
            <ClipboardList color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: "统计",
          tabBarIcon: ({ color, size }) => (
            <BarChart3 color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
