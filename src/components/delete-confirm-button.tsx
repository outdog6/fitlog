"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2, Loader2 } from "lucide-react";
import { deleteWorkoutSession } from "@/app/(authenticated)/dashboard/actions";

export function DeleteConfirmButton({ sessionId, sessionName }: { sessionId: string; sessionName: string }) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setDeleting(true);
    await deleteWorkoutSession(sessionId);
    setDeleting(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive shrink-0 h-9 w-9"
        aria-label="删除此记录"
      >
        <Trash2 className="size-4" />
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>删除训练记录</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            确定要删除 <span className="text-foreground font-medium">{sessionName}</span> 吗？此操作不可撤销。
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={deleting}>
            取消
          </Button>
          <Button onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
            {deleting && <Loader2 className="size-4 animate-spin" />}
            确定删除
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
