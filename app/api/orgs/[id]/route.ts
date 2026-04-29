import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const userId = session.user.id as string

  const { id } = await params

  const membership = await prisma.orgMember.findUnique({
    where: { userId_orgId: { userId, orgId: id } },
  })
  if (!membership || membership.role !== "ADMIN") {
    return NextResponse.json({ error: "Réservé aux admins" }, { status: 403 })
  }

  await prisma.orgMember.deleteMany({ where: { orgId: id } })
  await prisma.organization.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const userId = session.user.id as string

  const { id } = await params

  const membership = await prisma.orgMember.findUnique({
    where: { userId_orgId: { userId, orgId: id } },
  })
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 })

  const org = await prisma.organization.findUnique({
    where: { id },
    include: {
      members: {
        include: { user: { select: { id: true, username: true, email: true } } },
      },
    },
  })

  return NextResponse.json({ org, myRole: membership.role })
}