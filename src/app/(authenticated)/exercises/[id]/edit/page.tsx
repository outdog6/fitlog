"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Save } from "lucide-react";

const muscles = ["chest", "back", "legs", "shoulders", "arms", "core"];
const equipmentList = ["barbell", "dumbbell", "cable", "bodyweight", "machine"];

export default function EditExercisePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", primaryMuscle: "", equipment: "", description: "", instructions: "" });

  useEffect(() => {
    fetch(`/api/exercises?id=${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) {
          setForm({
            name: data.name || "",
            primaryMuscle: data.primaryMuscle || "",
            equipment: data.equipment || "",
            description: data.description || "",
            instructions: data.instructions || "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/exercises/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      router.push(`/exercises/${id}`);
      router.refresh();
    }
    setSaving(false);
  }

  if (loading) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="size-6 animate-spin" /></div>;
  }

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href={`/exercises/${id}`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="size-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold">编辑动作</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>{form.name}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>动作名称</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label>主要肌群</Label>
              <Select value={form.primaryMuscle} onValueChange={(v) => setForm({ ...form, primaryMuscle: v ?? "" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card">
                  {muscles.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>器械</Label>
              <Select value={form.equipment} onValueChange={(v) => setForm({ ...form, equipment: v ?? "" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card">
                  {equipmentList.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>描述</Label>
              <textarea className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 outline-none focus-visible:border-ring text-sm" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>步骤说明</Label>
              <textarea className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 outline-none focus-visible:border-ring text-sm" value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} rows={5} />
            </div>
            <Button type="submit" disabled={saving} className="bg-orange-600 hover:bg-orange-700">
              {saving && <Loader2 className="size-4 animate-spin" />}
              <Save className="size-4" />保存修改
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
