import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const userId = session.user!.id as string

  const { id } = await params
  const { quantity } = await req.json()

  const card = await prisma.card.findUnique({ where: { id } })
  if (!card || card.userId !== userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  const updated = await prisma.card.update({
    where: { id },
    data: { quantity },
  })

  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const userId = session.user!.id as string

  const { id } = await params

  const card = await prisma.card.findUnique({ where: { id } })
  if (!card || card.userId !== userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  await prisma.card.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}