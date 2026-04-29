import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/auth"

const prisma = new PrismaClient()

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const userId = session.user.id as string

  const memberships = await prisma.orgMember.findMany({
    where: { userId },
    include: { org: true },
  })

  return NextResponse.json(memberships)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const userId = session.user.id as string

  const { name } = await req.json()
  if (!name) return NextResponse.json({ error: "Nom manquant" }, { status: 400 })

  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now()

  const org = await prisma.organization.create({
    data: {
      name,
      slug,
      members: {
        create: {
          userId,
          role: "ADMIN",
        },
      },
    },
  })

  return NextResponse.json(org)
}