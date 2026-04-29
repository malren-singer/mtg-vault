"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

type Card = {
  id: string
  cardName: string
  quantity: number
  imageUri: string | null
  setCode: string | null
}

type Match = {
  member: { id: string; username: string }
  cards: Card[]
}

const COLUMNS_OPTIONS = [3, 4, 5, 6, 7, 8, 10, 12]

export default function WishlistGrid({ cards, matches }: { cards: Card[]; matches: Match[] }) {
  const router = useRouter()
  const [columns, setColumns] = useState(6)

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
      <div className="text-center py-16 text-gray-600">
        <p className="text-lg">Aucune carte pour l'instant</p>
        <p className="text-sm mt-2">Importe un fichier .txt pour commencer</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6 bg-gray-900 border border-gray-800 rounded-xl px-5 py-3">
        <span className="text-sm text-gray-400">Colonnes</span>
        <div className="flex gap-1">
          {COLUMNS_OPTIONS.map((col) => (
            <button
              key={col}
              onClick={() => setColumns(col)}
              className={`w-7 h-7 rounded-lg text-xs font-medium transition ${
                columns === col
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {col}
            </button>
          ))}
        </div>
      </div>

      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {cards.map((card) => {
          const owners = matchMap[card.cardName.toLowerCase()] || []
          const hasMatch = owners.length > 0

          return (
            <div key={card.id} className="flex flex-col items-center gap-2">
              <div style={{
                position: "relative",
                width: "100%",
                aspectRatio: "63/88",
                borderRadius: "8px",
                overflow: "hidden",
                backgroundColor: "#1f2937",
                outline: hasMatch ? "2px solid #22c55e" : "none",
              }}>
                {card.imageUri ? (
                  <img
                    src={card.imageUri}
                    alt={card.cardName}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    loading="lazy"
                  />
                ) : (
                  <div style={{
                    width: "100%", height: "100%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#4b5563", fontSize: "12px", textAlign: "center", padding: "8px"
                  }}>
                    {card.cardName}
                  </div>
                )}

                {hasMatch && (
                  <div style={{
                    position: "absolute",
                    top: "6px",
                    right: "6px",
                    backgroundColor: "#22c55e",
                    color: "white",
                    fontSize: "11px",
                    fontWeight: "700",
                    padding: "2px 6px",
                    borderRadius: "6px",
                    zIndex: 10,
                    lineHeight: "1.4",
                  }}>
                    ✓
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-400 text-center truncate w-full px-1">
                {card.cardName}
              </p>

              {hasMatch && (
                <p className="text-xs text-green-400 text-center px-1">
                  {owners.join(", ")}
                </p>
              )}

              <div className="flex items-center justify-between w-full px-1">
                <button
                  onClick={async () => {
                    if (card.quantity <= 1) {
                      if (!confirm(`Supprimer "${card.cardName}" ?`)) return
                      await fetch(`/api/cards/${card.id}`, { method: "DELETE" })
                    } else {
                      await fetch(`/api/cards/${card.id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ quantity: card.quantity - 1 }),
                      })
                    }
                    router.refresh()
                  }}
                  className="w-7 h-7 rounded-lg bg-gray-800 hover:bg-gray-700 text-white flex items-center justify-center text-lg leading-none transition"
                >
                  −
                </button>
                <span className="text-white text-sm font-medium">{card.quantity}</span>
                <button
                  onClick={async () => {
                    await fetch(`/api/cards/${card.id}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ quantity: card.quantity + 1 }),
                    })
                    router.refresh()
                  }}
                  className="w-7 h-7 rounded-lg bg-gray-800 hover:bg-gray-700 text-white flex items-center justify-center text-lg leading-none transition"
                >
                  +
                </button>
              </div>

              <button
                onClick={async () => {
                  if (!confirm(`Supprimer "${card.cardName}" ?`)) return
                  await fetch(`/api/cards/${card.id}`, { method: "DELETE" })
                  router.refresh()
                }}
                className="text-red-400 hover:text-red-300 text-xs transition"
              >
                Supprimer
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}