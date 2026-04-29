import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

function parseCardList(text: string) {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean)
  const cards: { quantity: number; name: string; setCode?: string }[] = []

  for (const line of lines) {
    const match = line.match(/^(\d+)x?\s+(.+?)(?:\s+[\[\(]([A-Z0-9]+)[\]\)])?$/)
    if (match) {
      cards.push({
        quantity: parseInt(match[1]),
        name: match[2].trim(),
        setCode: match[3],
      })
    }
  }

  return cards
}

async function resolveScryfall(cards: { quantity: number; name: string; setCode?: string }[]) {
  const identifiers = cards.map(c => ({ name: c.name }))
  const chunks = []

  for (let i = 0; i < identifiers.length; i += 75) {
    chunks.push(identifiers.slice(i, i + 75))
  }

  const resolved: Record<string, { scryfallId: string; imageUri: string }> = {}

  for (const chunk of chunks) {
    const res = await fetch("https://api.scryfall.com/cards/collection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifiers: chunk }),
    })
    const data = await res.json()
    for (const card of data.data || []) {
      resolved[card.name.toLowerCase()] = {
        scryfallId: card.id,
        imageUri: card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || "",
      }
    }
  }

  return resolved
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { text, listType } = await req.json()
  if (!text || !listType) return NextResponse.json({ error: "Données manquantes" }, { status: 400 })

  const parsed = parseCardList(text)
  if (parsed.length === 0) return NextResponse.json({ error: "Aucune carte trouvée" }, { status: 400 })

  const resolved = await resolveScryfall(parsed)

  const userId = session.user!.id as string

  const toCreate = parsed
    .filter(c => resolved[c.name.toLowerCase()])
    .map(c => ({
      userId,
      listType: listType as "OWNED" | "WANTED",
      cardName: c.name,
      setCode: c.setCode,
      quantity: c.quantity,
      scryfallId: resolved[c.name.toLowerCase()].scryfallId,
      imageUri: resolved[c.name.toLowerCase()].imageUri,
    }))

  await prisma.card.createMany({ data: toCreate, skipDuplicates: false })

  return NextResponse.json({ imported: toCreate.length })
}