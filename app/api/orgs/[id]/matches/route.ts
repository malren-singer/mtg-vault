import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const userId = session.user.id as string

  const { id } = await params

  const membership = await prisma.orgMember.findUnique({
    where: { userId_orgId: { userId, orgId: id } },
  })
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 })

  const myWishlist = await prisma.card.findMany({
    where: { userId, listType: "WANTED" },
  })

  if (myWishlist.length === 0) return NextResponse.json([])

  const otherMembers = await prisma.orgMember.findMany({
    where: { orgId: id, userId: { not: userId } },
    include: { user: { select: { id: true, username: true } } },
  })

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
      matches.push({ member: member.user, cards: owned })
    }
  }

  return NextResponse.json(matches)
}