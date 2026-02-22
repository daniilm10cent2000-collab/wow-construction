import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const result = await prisma.$queryRawUnsafe("SELECT 1");

  return NextResponse.json({
    db: "connected",
    result,
  });
}