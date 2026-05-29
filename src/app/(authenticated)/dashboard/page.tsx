import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { StatsCards } from "@/components/stats-cards";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play } from "lucide-react";

function getMonday(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.getFullYear(), now.getMonth(), diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Sign in to view your dashboard.</p>
      </div>
    );
  }

  const monday = getMonday();

  // Batch 1: independent queries
  const [thisWeekCount, totalSessions, latestPlan] = await Promise.all([
    prisma.workoutSession.count({
      where: { userId, date: { gte: monday } },
    }),
    prisma.workoutSession.count({
      where: { userId },
    }),
    prisma.trainingPlan.findFirst({
      where: { userId, isTemplate: false },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  let weekGoal = 0;
  let todayName: string | null = null;
  let recentSessions;

  if (latestPlan) {
    const planStart = latestPlan.createdAt;
    const diffMs = Date.now() - planStart.getTime();
    const weekNumber =
      Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1;
    const todayJsDay = new Date().getDay();
    const todayDayOfWeek = todayJsDay === 0 ? 7 : todayJsDay;

    // Batch 2: plan-specific queries + recent sessions
    const [weekExercises, todayExercise, sessions] = await Promise.all([
      prisma.planExercise.findMany({
        where: { planId: latestPlan.id, weekNumber },
        select: { dayOfWeek: true },
        distinct: ["dayOfWeek"],
      }),
      prisma.planExercise.findFirst({
        where: {
          planId: latestPlan.id,
          weekNumber,
          dayOfWeek: todayDayOfWeek,
        },
      }),
      prisma.workoutSession.findMany({
        where: { userId },
        orderBy: { date: "desc" },
        take: 5,
        include: {
          plan: { select: { name: true } },
        },
      }),
    ]);

    weekGoal = weekExercises.length;
    todayName = todayExercise ? latestPlan.name : null;
    recentSessions = sessions;
  } else {
    recentSessions = await prisma.workoutSession.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 5,
      include: {
        plan: { select: { name: true } },
      },
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Your fitness overview</p>
        </div>
        {latestPlan ? (
          <Link href={`/workout?plan=${latestPlan.id}`}>
            <Button>
              <Play className="size-4" />
              Start Workout
            </Button>
          </Link>
        ) : (
          <Link href="/plans">
            <Button>
              <Play className="size-4" />
              Create a Plan
            </Button>
          </Link>
        )}
      </div>

      <StatsCards
        weekCompleted={thisWeekCount}
        weekGoal={weekGoal}
        totalSessions={totalSessions}
        currentPlan={latestPlan?.name ?? null}
        todayName={todayName}
      />

      {/* Recent Workouts */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-3">
          Recent Workouts
        </h2>
        {recentSessions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No workouts yet.{" "}
              {latestPlan ? (
                <Link
                  href={`/workout?plan=${latestPlan.id}`}
                  className="text-primary underline"
                >
                  Start your first workout
                </Link>
              ) : (
                <Link href="/plans" className="text-primary underline">
                  Create a plan to get started
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {recentSessions.map((session) => {
              const dateStr = session.date.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              });
              return (
                <Link key={session.id} href={`/workout/${session.id}`}>
                  <Card className="hover:bg-muted/50 transition-colors">
                    <CardContent className="py-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">
                          {session.plan?.name ?? "Free Workout"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {dateStr}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {session.duration != null
                          ? `${session.duration} min`
                          : "—"}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
