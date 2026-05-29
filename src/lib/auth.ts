const DESKTOP_MODE = process.env.DESKTOP_MODE === "true";

export const LOCAL_USER = {
  id: "local-user",
  email: "local@fitlog.app",
  name: "本地用户",
};

export function auth() {
  if (DESKTOP_MODE) {
    return Promise.resolve({ user: LOCAL_USER });
  }
  const _auth = require("./auth.server").auth;
  return _auth();
}

export function signIn(...args: any[]) {
  if (DESKTOP_MODE) return Promise.resolve({ ok: true });
  const { signIn: s } = require("./auth.server");
  return s(...args);
}

export function signOut(...args: any[]) {
  if (DESKTOP_MODE) return Promise.resolve({ ok: true });
  const { signOut: s } = require("./auth.server");
  return s(...args);
}

export const handlers = DESKTOP_MODE
  ? { GET: () => new Response("ok"), POST: () => new Response("ok") }
  : require("./auth.server").handlers;
