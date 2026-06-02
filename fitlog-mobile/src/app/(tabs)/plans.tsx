import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Plus } from "lucide-react-native";
import { useState, useCallback } from "react";
import { useFocusEffect, Link } from "expo-router";
import { db } from "@/db";

interface PlanItem {
  id: string;
  name: string;
  description: string | null;
  isTemplate: boolean;
}

export default function PlansScreen() {
  const [templates, setTemplates] = useState<PlanItem[]>([]);
  const [myPlans, setMyPlans] = useState<PlanItem[]>([]);

  const loadPlans = useCallback(() => {
    db.query.trainingPlans.findMany().then((list) => {
      setTemplates(list.filter((p) => p.isTemplate));
      setMyPlans(list.filter((p) => !p.isTemplate));
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPlans();
    }, [loadPlans])
  );

  return (
    <ScrollView className="flex-1 bg-canvas">
      <View className="px-xl pt-14 pb-md flex-row justify-between items-center">
        <View>
          <Text className="text-ink font-display text-hero">训练计划</Text>
          <Text className="text-ink-dim text-fine-print mt-xxs">周期化训练管理</Text>
        </View>
        <Link href="/plan/new" asChild>
          <TouchableOpacity className="bg-accent w-11 h-11 rounded-full items-center justify-center active:scale-95">
            <Plus color="#000000" size={20} />
          </TouchableOpacity>
        </Link>
      </View>

      {/* 模板库 */}
      <View className="px-xl mb-lg">
        <View className="flex-row justify-between items-end mb-md">
          <Text className="text-ink text-body-strong">模板库</Text>
          {templates.length > 0 ? (
            <Link href={{ pathname: "/plan/new", params: { template: templates[0].id } }} asChild>
              <TouchableOpacity>
                <Text className="text-accent text-caption">从模板创建 →</Text>
              </TouchableOpacity>
            </Link>
          ) : (
            <TouchableOpacity disabled>
              <Text className="text-ink-muted text-caption">从模板创建 →</Text>
            </TouchableOpacity>
          )}
        </View>
        {templates.length === 0 ? (
          <View className="bg-surface rounded-lg py-xxl items-center">
            <Text className="text-ink-muted text-caption">暂无模板</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {templates.map((t, i) => {
              const colors = ["#FF453A", "#007AFF", "#34C759"];
              const color = colors[i % 3];
              return (
                <Link
                  key={t.id}
                  href={{ pathname: "/plan/new", params: { template: t.id } }}
                  asChild
                >
                  <TouchableOpacity className="mr-sm bg-surface rounded-lg px-lg py-xl w-36">
                    <View
                      className="w-8 h-8 rounded-lg items-center justify-center mb-md"
                      style={{ backgroundColor: `${color}26` }}
                    >
                      <Text style={{ color }} className="text-caption-strong">
                        {i + 1}
                      </Text>
                    </View>
                    <Text className="text-ink text-caption-strong">{t.name}</Text>
                    <Text className="text-ink-dim text-fine-print mt-xxs">
                      {t.description ?? ""}
                    </Text>
                  </TouchableOpacity>
                </Link>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* 我的计划 */}
      <View className="px-xl pb-section">
        <Text className="text-ink text-body-strong mb-md">我的计划</Text>
        {myPlans.length === 0 ? (
          <View className="bg-surface rounded-lg py-xxl items-center">
            <Text className="text-ink-muted text-caption">还没有自己的计划</Text>
            <Text className="text-ink-dim text-fine-print mt-xxs">
              从模板创建或新建空白计划
            </Text>
          </View>
        ) : (
          myPlans.map((p) => (
            <TouchableOpacity
              key={p.id}
              onPress={() => Alert.alert("计划信息", `名称: ${p.name}\n描述: ${p.description ?? "无"}`)}
              className="mb-xs bg-surface rounded-lg px-lg py-xl"
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="text-ink text-body-strong">{p.name}</Text>
                  <Text className="text-accent text-fine-print font-semibold mt-xxs"
                    style={{ letterSpacing: 1 }}>
                    ● 进行中
                  </Text>
                  {p.description ? (
                    <Text className="text-ink-dim text-fine-print mt-sm">
                      {p.description}
                    </Text>
                  ) : null}
                </View>
                <Text className="text-ink-dim text-caption">→</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}
