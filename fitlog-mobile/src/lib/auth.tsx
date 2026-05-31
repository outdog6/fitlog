import { createContext, useContext, type ReactNode } from "react";
import type { User } from "@/db/schema";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const LOCAL_USER_ID = "local-user-0000-0000-000000000000";
const LOCAL_USER_EMAIL = "local@fitlog.app";

export interface AuthState {
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthState>({ user: null, isLoading: true });

export function useAuth() {
  return useContext(AuthContext);
}

export async function getOrCreateLocalUser(): Promise<User> {
  const existing = await db.query.users.findFirst({
    where: eq(users.id, LOCAL_USER_ID),
  });

  if (existing) return existing;

  const [user] = await db
    .insert(users)
    .values({
      id: LOCAL_USER_ID,
      email: LOCAL_USER_EMAIL,
      name: "本地用户",
      passwordHash: "desktop-mode-no-password",
    })
    .returning();

  return user;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Mobile uses local-first auth — same as desktop mode
  // Login/signup will be added later if cloud sync is needed
  return <>{children}</>;
}
