"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";

interface TemplatePlan {
  id: string;
  name: string;
  description: string | null;
}

export default function NewPlanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("template");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchingTemplate, setFetchingTemplate] = useState(false);

  const fetchTemplate = useCallback(async (id: string) => {
    setFetchingTemplate(true);
    try {
      const res = await fetch(`/api/plans/${id}`);
      if (res.ok) {
        const data: TemplatePlan = await res.json();
        setName(data.name);
        if (data.description) {
          setDescription(data.description);
        }
      }
    } catch {
      // Template fetch failed, allow manual entry
    } finally {
      setFetchingTemplate(false);
    }
  }, []);

  useEffect(() => {
    if (templateId) {
      fetchTemplate(templateId);
    }
  }, [templateId, fetchTemplate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const body: { name: string; description: string; templateId?: string } = {
        name,
        description,
      };
      if (templateId) {
        body.templateId = templateId;
      }

      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create plan");
      }

      const plan = await res.json();
      router.push(`/plans/${plan.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/plans">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">New Plan</h1>
          <p className="text-muted-foreground">
            {templateId
              ? "Create a plan from a template"
              : "Create a new training plan"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {fetchingTemplate && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading template...
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. My Push Pull Legs"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. A 6-day split for hypertrophy"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex gap-2 justify-end">
              <Link href="/plans">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="size-4 animate-spin" />}
                Create Plan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
