import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dumbbell, BarChart3, ClipboardList, Play } from "lucide-react";

const features = [
  {
    icon: ClipboardList,
    color: "text-secondary",
    title: "制定训练计划",
    description:
      "设计中周期训练、构建训练模板、将动作编排成结构化计划，让你持续进步。",
  },
  {
    icon: Play,
    color: "text-accent",
    title: "记录每一组",
    description:
      "实时记录每组训练的次数、重量和 RPE。简洁无干扰的训练记录流程，让你不再丢失任何数据。",
  },
  {
    icon: BarChart3,
    color: "text-primary",
    title: "分析训练量",
    description:
      "可视化每周训练量、总次数和训练统计。发现趋势、避免过度训练，用数据驱动训练决策。",
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
            <Button variant="outline">登录</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-1 items-center justify-center px-4 py-24">
        <div className="max-w-2xl text-center">
          <h1 className="text-5xl font-bold tracking-tight">
            记录每一次训练。{" "}
            <span className="text-primary">掌控你的进步。</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-zinc-400">
            为认真训练者打造的训练日志。规划周期、记录每组数据，见证你的训练量不断增长。
          </p>
          <div className="mt-8">
            <Link href="/login">
              <Button size="lg" className="bg-primary hover:bg-primary/80">
                开始使用
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
