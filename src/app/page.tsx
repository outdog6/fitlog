import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BarChart3, ClipboardList, Dumbbell, Play } from "lucide-react";

const features = [
  { icon: ClipboardList, color: "text-secondary", title: "制定训练计划", description: "设计训练周期、构建训练模板、将动作编排成结构化计划。" },
  { icon: Play, color: "text-accent", title: "记录每一组", description: "实时记录每组训练的次数和重量，简洁高效。" },
  { icon: BarChart3, color: "text-primary", title: "分析训练量", description: "可视化每周训练量和肌肉群分布，用数据驱动进步。" },
];

export default function LandingPage() {
  if (process.env.DESKTOP_MODE === "true") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link className="flex items-center gap-2" href="/">
            <Dumbbell className="size-6 text-primary" />
            <span className="text-lg font-semibold tracking-tight">FitLog</span>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="sm">登录</Button>
          </Link>
        </div>
      </header>

      <section className="flex flex-1 items-center justify-center px-4 py-24">
        <div className="max-w-2xl text-center">
          <h1 className="text-5xl font-bold tracking-tight">记录每一次训练。<span className="text-primary">掌控你的进步。</span></h1>
          <p className="mt-6 text-lg leading-relaxed text-zinc-400">为认真训练者打造的训练日志。规划周期、记录每组数据，见证训练量不断增长。</p>
          <div className="mt-8">
            <Link href="/login"><Button className="bg-primary hover:bg-primary/80">开始使用</Button></Link>
          </div>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                <feature.icon className={`size-8 ${feature.color}`} />
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
