import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const userId = session.user.id as string

  const { id } = await params

  const myMembership = await prisma.orgMember.findUnique({
    where: { userId_orgId: { userId, orgId: id } },
  })
  if (!myMembership || myMembership.role !== "ADMIN") {
    return NextResponse.json({ error: "Réservé aux admins" }, { status: 403 })
  }

  const { userId: targetUserId } = await req.json()

  if (targetUserId === userId) {
    return NextResponse.json({ error: "Tu ne peux pas te retirer toi-même" }, { status: 400 })
  }

  await prisma.orgMember.delete({
    where: { userId_orgId: { userId: targetUserId, orgId: id } },
  })

  return NextResponse.json({ ok: true })
}