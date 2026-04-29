import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  const { username, email, password } = await req.json()

  if (!username || !email || !password) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 })
  }

  const exists = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  })

  if (exists) {
    return NextResponse.json(
      { error: "Email ou username déjà utilisé" },
      { status: 400 }
    )
  }

  const passwordHash = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: { username, email, passwordHash },
  })

  return NextResponse.json({ ok: true })
}