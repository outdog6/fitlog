"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pencil, Trash2, Loader2 } from "lucide-react";

export function ExerciseActions({ exerciseId }: { exerciseId: string }) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/exercises/${exerciseId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/exercises");
      router.refresh();
    }
    setDeleting(false);
    setDeleteOpen(false);
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <Link href={`/exercises/${exerciseId}/edit`}>
        <Button variant="outline" size="sm">
          <Pencil className="size-3.5" />
          编辑
        </Button>
      </Link>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogTrigger>
          <Button variant="outline" size="sm" className="text-red-500 border-red-500/30 hover:bg-red-500/10">
            <Trash2 className="size-3.5" />
            删除
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>删除动作</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              确定要删除这个动作吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>取消</Button>
            <Button onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
              {deleting && <Loader2 className="size-4 animate-spin" />}确定删除
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
