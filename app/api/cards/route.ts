import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/auth"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const listType = req.nextUrl.searchParams.get("list") === "wanted" ? "WANTED" : "OWNED"

  const cards = await prisma.card.findMany({
    where: { userId: session.user.id, listType },
    orderBy: { cardName: "asc" },
  })

  return NextResponse.json(cards)
}