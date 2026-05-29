"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isRegister) {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "注册失败");
          setLoading(false);
          return;
        }

        // Auto sign-in after successful registration
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError("账户已创建但登录失败，请重试");
        } else {
          router.push("/dashboard");
          router.refresh();
        }
      } catch {
        setError("出了点问题，请重试");
      }
    } else {
      try {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError("邮箱或密码错误");
        } else {
          router.push("/dashboard");
          router.refresh();
        }
      } catch {
        setError("出了点问题，请重试");
      }
    }

    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 text-zinc-100">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            {isRegister ? "创建账户" : "欢迎回来"}
          </CardTitle>
          <CardDescription className="text-zinc-400">
            {isRegister
              ? "输入信息创建账户"
              : "输入信息登录账户"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isRegister && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="name" className="text-zinc-300">
                  姓名
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="你的姓名"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className={cn(
                    "border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500",
                    "focus-visible:ring-zinc-500"
                  )}
                />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-zinc-300">
                邮箱
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={cn(
                  "border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500",
                  "focus-visible:ring-zinc-500"
                )}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-zinc-300">
                密码
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className={cn(
                  "border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500",
                  "focus-visible:ring-zinc-500"
                )}
              />
            </div>

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="mt-2 w-full"
            >
              {loading
                ? "加载中..."
                : isRegister
                  ? "创建账户"
                  : "登录"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-zinc-400">
            {isRegister ? (
              <>
                已有账户？{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setError("");
                  }}
                  className="font-medium text-zinc-200 hover:text-white underline underline-offset-4"
                >
                  登录
                </button>
              </>
            ) : (
              <>
                还没有账户？{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    setError("");
                  }}
                  className="font-medium text-zinc-200 hover:text-white underline underline-offset-4"
                >
                  创建一个
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
