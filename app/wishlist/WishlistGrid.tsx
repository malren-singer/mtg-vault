"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

type CardType = {
  id: string
  cardName: string
  quantity: number
  imageUri: string | null
  setCode: string | null
}

type Match = {
  member: { id: string; username: string }
  cards: CardType[]
}

const COLUMNS_OPTIONS = [2, 3, 4, 5, 6, 8]

export default function WishlistGrid({ cards, matches }: { cards: CardType[]; matches: Match[] }) {
  const router = useRouter()
  const [columns, setColumns] = useState(4)

  const matchMap: Record<string, string[]> = {}
  for (const match of matches) {
    for (const card of match.cards) {
      const key = card.cardName.toLowerCase()
      if (!matchMap[key]) matchMap[key] = []
      if (!matchMap[key].includes(match.member.username)) {
        matchMap[key].push(match.member.username)
      }
    }
  }

  if (cards.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          <p className="font-medium">Aucune carte pour l&apos;instant</p>
          <p className="text-sm mt-1">Importe un fichier .txt pour commencer</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-muted-foreground hidden sm:block">Colonnes</span>
        <div className="hidden sm:flex gap-1">
          {COLUMNS_OPTIONS.map((col) => (
            <Button
              key={col}
              variant={columns === col ? "default" : "outline"}
              size="icon-sm"
              onClick={() => setColumns(col)}
              className="text-xs"
            >
              {col}
            </Button>
          ))}
        </div>
      </div>

      <div
        className="grid gap-3 mtg-card-grid"
        style={{ "--mtg-cols": `repeat(${columns}, minmax(0, 1fr))` } as React.CSSProperties}
      >
        {cards.map((card) => {
          const owners = matchMap[card.cardName.toLowerCase()] || []
          return (
            <WishlistItem
              key={card.id}
              card={card}
              owners={owners}
              onUpdate={() => router.refresh()}
            />
          )
        })}
      </div>
    </div>
  )
}

function WishlistItem({
  card,
  owners,
  onUpdate,
}: {
  card: CardType
  owners: string[]
  onUpdate: () => void
}) {
  const [loading, setLoading] = useState(false)
  const hasMatch = owners.length > 0

  async function updateQuantity(newQty: number) {
    if (newQty < 1) {
      await deleteCard()
      return
    }
    setLoading(true)
    await fetch(`/api/cards/${card.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: newQty }),
    })
    setLoading(false)
    onUpdate()
  }

  async function deleteCard() {
    if (!confirm(`Supprimer "${card.cardName}" ?`)) return
    setLoading(true)
    await fetch(`/api/cards/${card.id}`, { method: "DELETE" })
    onUpdate()
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="relative rounded-lg overflow-hidden bg-muted w-full"
        style={{
          aspectRatio: "63/88",
          outline: hasMatch ? "2px solid oklch(0.70 0.15 140)" : "none",
        }}
      >
        {card.imageUri ? (
          <img src={card.imageUri} alt={card.cardName} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs text-center p-2">
            {card.cardName}
          </div>
        )}
        {hasMatch && (
          <div className="absolute top-1.5 right-1.5">
            <Badge
              className="text-xs px-1.5 py-0"
              style={{ backgroundColor: "oklch(0.70 0.15 140)", color: "white" }}
            >
              ✓
            </Badge>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center truncate px-1">{card.cardName}</p>

      {hasMatch && (
        <p className="text-xs text-center px-1 truncate" style={{ color: "oklch(0.70 0.15 140)" }}>
          {owners.join(", ")}
        </p>
      )}

      <div className="flex items-center justify-between gap-1 px-1">
        <Button
          variant="outline"
          size="icon-xs"
          onClick={() => updateQuantity(card.quantity - 1)}
          disabled={loading}
        >
          <Minus className="size-3" />
        </Button>
        <span className="text-sm font-semibold tabular-nums">{card.quantity}</span>
        <Button
          variant="outline"
          size="icon-xs"
          onClick={() => updateQuantity(card.quantity + 1)}
          disabled={loading}
        >
          <Plus className="size-3" />
        </Button>
      </div>

      <Button
        variant="ghost"
        size="xs"
        onClick={deleteCard}
        disabled={loading}
        className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full"
      >
        <Trash2 className="size-3" />
        Supprimer
      </Button>
    </div>
  )
}
