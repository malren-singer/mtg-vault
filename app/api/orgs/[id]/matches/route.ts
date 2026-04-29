import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/auth"

const prisma = new PrismaClient()

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { id } = await params

  const membership = await prisma.orgMember.findUnique({
    where: { userId_orgId: { userId: session.user.id, orgId: id } },
  })
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 })

  const myWishlist = await prisma.card.findMany({
    where: { userId: session.user.id, listType: "WANTED" },
  })

  if (myWishlist.length === 0) return NextResponse.json([])

  const otherMembers = await prisma.orgMember.findMany({
    where: { orgId: id, userId: { not: session.user.id } },
    include: { user: { select: { id: true, username: true } } },
  })

  const wishlistNames = myWishlist.map(c => c.cardName.toLowerCase())

  const matches = []

  for (const member of otherMembers) {
    const owned = await prisma.card.findMany({
      where: {
        userId: member.userId,
        listType: "OWNED",
        cardName: { in: myWishlist.map(c => c.cardName), mode: "insensitive" },
      },
    })

    if (owned.length > 0) {
      matches.push({
        member: member.user,
        cards: owned,
      })
    }
  }

  return NextResponse.json(matches)
}