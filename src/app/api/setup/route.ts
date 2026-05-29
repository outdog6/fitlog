import { NextResponse } from "next/server";
import { execSync } from "child_process";

export async function GET() {
  try {
    const output = execSync("npx prisma db push --accept-data-loss", {
      encoding: "utf-8",
      timeout: 30000,
    });
    return NextResponse.json({ ok: true, output });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message, stderr: e.stderr?.toString() }, { status: 500 });
  }
}
