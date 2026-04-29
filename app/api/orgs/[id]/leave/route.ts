import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const userId = session.user.id as string

  const { id } = await params

  const membership = await prisma.orgMember.findUnique({
    where: { userId_orgId: { userId, orgId: id } },
  })
  if (!membership) return NextResponse.json({ error: "Tu n'es pas membre" }, { status: 404 })

  if (membership.role === "ADMIN") {
    const memberCount = await prisma.orgMember.count({ where: { orgId: id } })
    if (memberCount > 1) {
      return NextResponse.json(
        { error: "Tu es le seul admin. Supprime la guilde ou nomme un autre admin d'abord." },
        { status: 400 }
      )
    }
    // Dernier membre : supprimer l'org entière
    await prisma.orgMember.deleteMany({ where: { orgId: id } })
    await prisma.organization.delete({ where: { id } })
    return NextResponse.json({ ok: true, deleted: true })
  }

  await prisma.orgMember.delete({
    where: { userId_orgId: { userId, orgId: id } },
  })
  return NextResponse.json({ ok: true })
}
