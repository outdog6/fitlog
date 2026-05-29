"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import { addPlanExercise } from "@/app/(authenticated)/plans/[id]/actions";

interface Exercise { id: string; name: string }

export function AddExerciseDialog({ planId }: { planId: string }) {
  const [open, setOpen] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [exerciseId, setExerciseId] = useState("");
  const [weekNumber, setWeekNumber] = useState("1");
  const [dayOfWeek, setDayOfWeek] = useState("1");
  const [targetSets, setTargetSets] = useState("3");
  const [targetReps, setTargetReps] = useState("8-12");

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetch("/api/exercises").then((r) => r.json()).then(setExercises).catch(() => {}).finally(() => setLoading(false));
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData();
    formData.set("planId", planId);
    formData.set("exerciseId", exerciseId);
    formData.set("weekNumber", weekNumber);
    formData.set("dayOfWeek", dayOfWeek);
    formData.set("targetSets", targetSets);
    formData.set("targetReps", targetReps);
    await addPlanExercise(formData);
    setOpen(false);
    setExerciseId("");
    setSubmitting(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant="outline"><Plus className="size-4" />添加动作</Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>添加训练动作</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>选择动作</Label>
            <Select value={exerciseId} onValueChange={(v) => setExerciseId(v ?? "")}>
              <SelectTrigger><SelectValue placeholder={loading ? "加载中..." : "选择动作"} /></SelectTrigger>
              <SelectContent className="bg-card border-border max-h-48">
                {exercises.map((ex) => (<SelectItem key={ex.id} value={ex.id}>{ex.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label>周数</Label>
              <Input type="number" min="1" max="12" value={weekNumber} onChange={(e) => setWeekNumber(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>星期</Label>
              <Select value={dayOfWeek} onValueChange={(v) => setDayOfWeek(v ?? "1")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {["周一","周二","周三","周四","周五","周六","周日"].map((d, i) => (
                    <SelectItem key={i+1} value={String(i+1)}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>组数</Label>
              <Input type="number" min="1" max="10" value={targetSets} onChange={(e) => setTargetSets(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>次数</Label>
              <Input value={targetReps} onChange={(e) => setTargetReps(e.target.value)} placeholder="8-12" />
            </div>
          </div>
          <Button type="submit" disabled={!exerciseId || submitting} className="bg-orange-600 hover:bg-orange-700">
            {submitting && <Loader2 className="size-4 animate-spin" />}添加
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
