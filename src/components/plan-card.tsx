import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

type PlanCardProps = {
  id: string;
  name: string;
  description: string | null;
  exerciseCount: number;
};

export function PlanCard({ id, name, description, exerciseCount }: PlanCardProps) {
  return (
    <Link href={`/plans/${id}`}>
      <Card className="hover:ring-1 hover:ring-primary/50 transition-all cursor-pointer h-full">
        <CardHeader>
          <CardTitle className="text-base">{name}</CardTitle>
          {description && (
            <CardDescription>{description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground">
            {exerciseCount} 个动作
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
