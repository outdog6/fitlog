"use client";

import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  if (process.env.NEXT_PUBLIC_DESKTOP_MODE === "true") {
    return <>{children}</>;
  }
  return <SessionProvider>{children}</SessionProvider>;
}
