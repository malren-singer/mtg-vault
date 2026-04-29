import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const userId = session.user!.id as string

  const listType = req.nextUrl.searchParams.get("list") === "wanted" ? "WANTED" : "OWNED"

  const cards = await prisma.card.findMany({
    where: { userId, listType },
    orderBy: { cardName: "asc" },
  })

  return NextResponse.json(cards)
}