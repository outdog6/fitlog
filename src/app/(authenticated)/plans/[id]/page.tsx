import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ArrowLeft, Trash2 } from "lucide-react";
import { deletePlanExercise } from "./actions";

type PageParams = Promise<{ id: string }>;

const dayNames: Record<number, string> = {
  1: "周一",
  2: "周二",
  3: "周三",
  4: "周四",
  5: "周五",
  6: "周六",
  7: "周日",
};

export default async function PlanDetailPage({
  params,
}: {
  params: PageParams;
}) {
  const { id } = await params;
  const session = await auth();

  const plan = await prisma.trainingPlan.findUnique({
    where: { id },
    include: {
      planExercises: {
        include: {
          exercise: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [{ weekNumber: "asc" }, { dayOfWeek: "asc" }, { order: "asc" }],
      },
    },
  });

  if (!plan) {
    notFound();
  }

  const isOwner = session?.user?.id === plan.userId;
  const isTemplate = plan.isTemplate;

  // Group exercises by week
  const weeksMap = new Map<number, Map<number, typeof plan.planExercises>>();
  for (const pe of plan.planExercises) {
    if (!weeksMap.has(pe.weekNumber)) {
      weeksMap.set(pe.weekNumber, new Map());
    }
    const daysMap = weeksMap.get(pe.weekNumber)!;
    if (!daysMap.has(pe.dayOfWeek)) {
      daysMap.set(pe.dayOfWeek, []);
    }
    daysMap.get(pe.dayOfWeek)!.push(pe);
  }

  const weeks = Array.from(weeksMap.entries()).sort(([a], [b]) => a - b);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/plans">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{plan.name}</h1>
          {plan.description && (
            <p className="text-muted-foreground">{plan.description}</p>
          )}
          {isTemplate && (
            <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-accent/20 text-accent mt-1">
              模板
            </span>
          )}
        </div>
      </div>

      {weeks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            该计划尚未添加动作。
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue={`week-${weeks[0][0]}`}>
          <TabsList>
            {weeks.map(([weekNumber]) => (
              <TabsTrigger key={weekNumber} value={`week-${weekNumber}`}>
                第{weekNumber}周
              </TabsTrigger>
            ))}
          </TabsList>

          {weeks.map(([weekNumber, daysMap]) => (
            <TabsContent key={weekNumber} value={`week-${weekNumber}`}>
              <div className="flex flex-col gap-4">
                {Array.from(daysMap.entries())
                  .sort(([a], [b]) => a - b)
                  .map(([dayOfWeek, exercises]) => (
                    <Card key={dayOfWeek}>
                      <CardHeader>
                        <CardTitle className="text-base">
                          {dayNames[dayOfWeek] ?? `第${dayOfWeek}天`}
                        </CardTitle>
                        <CardDescription>
                          {exercises.length} 个动作
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-12">#</TableHead>
                              <TableHead>动作</TableHead>
                              <TableHead>目标</TableHead>
                              {isOwner && (
                                <TableHead className="w-12" />
                              )}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {exercises.map((pe) => (
                              <TableRow key={pe.id}>
                                <TableCell className="text-muted-foreground">
                                  {pe.order}
                                </TableCell>
                                <TableCell className="font-medium">
                                  {pe.exercise.name}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {pe.targetSets} &times; {pe.targetReps}
                                </TableCell>
                                {isOwner && (
                                  <TableCell>
                                    <form
                                      action={async () => {
                                        "use server";
                                        await deletePlanExercise(pe.id);
                                      }}
                                    >
                                      <Button
                                        type="submit"
                                        variant="ghost"
                                        size="icon-xs"
                                        className="text-muted-foreground hover:text-destructive"
                                      >
                                        <Trash2 className="size-3.5" />
                                      </Button>
                                    </form>
                                  </TableCell>
                                )}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
