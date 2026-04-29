import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const userId = session.user.id as string

  const { token } = await params

  const org = await prisma.organization.findUnique({
    where: { inviteToken: token },
  })
  if (!org) return NextResponse.json({ error: "Lien invalide" }, { status: 404 })

  const existing = await prisma.orgMember.findUnique({
    where: { userId_orgId: { userId, orgId: org.id } },
  })
  if (existing) return NextResponse.json({ error: "Déjà membre" }, { status: 400 })

  await prisma.orgMember.create({
    data: { userId, orgId: org.id, role: "MEMBER" },
  })

  return NextResponse.json({ orgId: org.id })
}