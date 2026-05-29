"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const muscleOptions = [
  { value: "chest", label: "胸部" },
  { value: "back", label: "背部" },
  { value: "legs", label: "腿部" },
  { value: "shoulders", label: "肩部" },
  { value: "arms", label: "手臂" },
  { value: "core", label: "核心" },
];

const equipmentOptions = [
  { value: "barbell", label: "杠铃" },
  { value: "dumbbell", label: "哑铃" },
  { value: "cable", label: "绳索" },
  { value: "bodyweight", label: "自重" },
  { value: "machine", label: "器械" },
];

export default function NewExercisePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [primaryMuscle, setPrimaryMuscle] = useState("");
  const [equipment, setEquipment] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          primaryMuscle,
          equipment,
          description,
          instructions,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "创建动作失败");
        setLoading(false);
        return;
      }

      router.push(`/exercises/${data.id}`);
      router.refresh();
    } catch {
      setError("出了点问题，请重试");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          创建动作
        </h1>
        <p className="text-muted-foreground">
          添加自定义动作到你的动作库
        </p>
      </div>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">动作名称</Label>
              <Input
                id="name"
                placeholder="例如：上斜哑铃卧推"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>主要肌群</Label>
              <Select
                value={primaryMuscle}
                onValueChange={(value) => setPrimaryMuscle(value ?? "")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择肌群..." />
                </SelectTrigger>
                <SelectContent>
                  {muscleOptions.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label>器械</Label>
              <Select
                value={equipment}
                onValueChange={(value) => setEquipment(value ?? "")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择器械..." />
                </SelectTrigger>
                <SelectContent>
                  {equipmentOptions.map((e) => (
                    <SelectItem key={e.value} value={e.value}>
                      {e.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">描述</Label>
              <textarea
                id="description"
                rows={3}
                placeholder="动作简介..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="instructions">动作说明</Label>
              <textarea
                id="instructions"
                rows={4}
                placeholder="分步动作说明..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="flex min-h-24 w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                取消
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "创建中..." : "创建动作"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
