import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PlanCard } from "@/components/plan-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function PlansPage() {
  const session = await auth();
  const userId = session?.user?.id;

  // Fetch template plans (isTemplate: true)
  const templatePlans = await prisma.trainingPlan.findMany({
    where: { isTemplate: true },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { planExercises: true },
      },
    },
  });

  // Fetch user's own plans (exclude system userId)
  const userPlans = userId
    ? await prisma.trainingPlan.findMany({
        where: {
          userId,
          isTemplate: false,
        },
        orderBy: { updatedAt: "desc" },
        include: {
          _count: {
            select: { planExercises: true },
          },
        },
      })
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Training Plans</h1>
          <p className="text-muted-foreground">
            Browse templates and manage your plans
          </p>
        </div>
        <Link href="/plans/new">
          <Button>
            <Plus className="size-4" />
            New Plan
          </Button>
        </Link>
      </div>

      {/* Template Plans */}
      {templatePlans.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Templates
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {templatePlans.map((plan) => (
              <PlanCard
                key={plan.id}
                id={plan.id}
                name={plan.name}
                description={plan.description}
                exerciseCount={plan._count.planExercises}
              />
            ))}
          </div>
        </section>
      )}

      {/* User Plans */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-3">
          {userId ? "Your Plans" : "Plans"}
        </h2>
        {userPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <p className="text-lg">No plans yet</p>
            <p className="text-sm">
              Create your first training plan or start from a template
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {userPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                id={plan.id}
                name={plan.name}
                description={plan.description}
                exerciseCount={plan._count.planExercises}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
