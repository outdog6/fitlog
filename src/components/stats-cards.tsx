import { CalendarCheck, TrendingUp, Target, Dumbbell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardsProps {
  weekCompleted: number;
  weekGoal: number;
  totalSessions: number;
  currentPlan: string | null;
  todayName: string | null;
}

export function StatsCards({
  weekCompleted,
  weekGoal,
  totalSessions,
  currentPlan,
  todayName,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* This Week */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2">
            <CalendarCheck className="size-4 text-emerald-500" />
            <p className="text-sm text-muted-foreground">本周</p>
          </div>
          <p className="text-2xl font-bold text-foreground mt-1">
            {weekCompleted}/{weekGoal}
          </p>
        </CardContent>
      </Card>

      {/* Total Sessions */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-cyan-500" />
            <p className="text-sm text-muted-foreground">总训练次数</p>
          </div>
          <p className="text-2xl font-bold text-foreground mt-1">
            {totalSessions}
          </p>
        </CardContent>
      </Card>

      {/* Current Plan */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2">
            <Target className="size-4 text-orange-500" />
            <p className="text-sm text-muted-foreground">当前计划</p>
          </div>
          <p className="text-2xl font-bold text-foreground mt-1">
            {currentPlan ?? "无计划"}
          </p>
        </CardContent>
      </Card>

      {/* Today */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2">
            <Dumbbell className="size-4 text-cyan-500" />
            <p className="text-sm text-muted-foreground">今天</p>
          </div>
          <p className="text-2xl font-bold text-foreground mt-1">
            {todayName ?? "休息"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
