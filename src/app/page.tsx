import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dumbbell, BarChart3, ClipboardList, Play } from "lucide-react";

const features = [
  {
    icon: ClipboardList,
    color: "text-secondary",
    title: "Plan Your Training",
    description:
      "Design mesocycles, build workout templates, and organize exercises into a structured program that keeps you progressing week after week.",
  },
  {
    icon: Play,
    color: "text-accent",
    title: "Log Every Set",
    description:
      "Record reps, weight, and RPE for every set in real time. Never lose track of your numbers again with a clean, distraction-free logging flow.",
  },
  {
    icon: BarChart3,
    color: "text-primary",
    title: "Analyze Volume",
    description:
      "Visualize your weekly volume load, rep counts, and session totals. Spot trends, avoid overtraining, and make data-driven programming decisions.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Dumbbell className="size-6 text-primary" />
            <span className="text-lg font-semibold tracking-tight">
              FitLog
            </span>
          </Link>
          <Link href="/login">
            <Button variant="outline">Sign In</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-1 items-center justify-center px-4 py-24">
        <div className="max-w-2xl text-center">
          <h1 className="text-5xl font-bold tracking-tight">
            Track Every Rep.{" "}
            <span className="text-primary">Own Your Progress.</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-zinc-400">
            The training log built for serious lifters. Plan your cycles, log
            every set, and watch your volume grow.
          </p>
          <div className="mt-8">
            <Link href="/login">
              <Button size="lg" className="bg-primary hover:bg-primary/80">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-6"
              >
                <feature.icon className={`size-8 ${feature.color}`} />
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
