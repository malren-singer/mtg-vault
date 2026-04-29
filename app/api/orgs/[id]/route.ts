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