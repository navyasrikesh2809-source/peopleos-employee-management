import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { redis } from "@/lib/redis";

export const runtime = "nodejs";

export async function GET() {
  try {
    await Promise.all([prisma.$queryRaw`SELECT 1`, redis.ping()]);
    return NextResponse.json({ status: "ok", services: { database: "ok", redis: "ok" } });
  } catch {
    return NextResponse.json(
      { status: "degraded", message: "A required service is unavailable" },
      { status: 503 }
    );
  }
}
