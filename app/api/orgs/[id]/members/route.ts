import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/auth"

const prisma = new PrismaClient()

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { id } = await params

  const myMembership = await prisma.orgMember.findUnique({
    where: { userId_orgId: { userId: session.user.id, orgId: id } },
  })
  if (!myMembership || myMembership.role !== "ADMIN") {
    return NextResponse.json({ error: "Réservé aux admins" }, { status: 403 })
  }

  const { userId } = await req.json()

  if (userId === session.user.id) {
    return NextResponse.json({ error: "Tu ne peux pas te retirer toi-même" }, { status: 400 })
  }

  await prisma.orgMember.delete({
    where: { userId_orgId: { userId, orgId: id } },
  })

  return NextResponse.json({ ok: true })
}