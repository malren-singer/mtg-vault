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

const COLUMNS_OPTIONS = [3, 4, 5, 6, 7, 8, 10, 12]
const CARD_WIDTH = 160
const CARD_HEIGHT = Math.round(CARD_WIDTH * (88 / 63))

export default function CardGrid({ cards }: { cards: Card[] }) {
  const router = useRouter()
  const [columns, setColumns] = useState(6)

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
        {cards.map((card) => (
          <CardItem
            key={card.id}
            card={card}
            onUpdate={() => router.refresh()}
          />
        ))}
      </div>
    </div>
  )
}

function CardItem({ card, onUpdate }: { card: Card; onUpdate: () => void }) {
  const [quantity, setQuantity] = useState(card.quantity)
  const [loading, setLoading] = useState(false)

  async function updateQuantity(newQty: number) {
    if (newQty < 0) return
    if (newQty === 0) {
      await deleteCard()
      return
    }
    setLoading(true)
    setQuantity(newQty)
    await fetch(`/api/cards/${card.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: newQty }),
    })
    setLoading(false)
  }

  async function deleteCard() {
    if (!confirm(`Supprimer "${card.cardName}" ?`)) return
    setLoading(true)
    await fetch(`/api/cards/${card.id}`, { method: "DELETE" })
    onUpdate()
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative rounded-lg overflow-hidden bg-gray-800 w-full"
        style={{ aspectRatio: "63/88" }}
      >
        {card.imageUri ? (
          <img
            src={card.imageUri}
            alt={card.cardName}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs text-center p-2">
            {card.cardName}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center truncate w-full px-1">{card.cardName}</p>

      <div className="flex items-center justify-between w-full px-1">
        <button
          onClick={() => updateQuantity(quantity - 1)}
          disabled={loading}
          className="w-7 h-7 rounded-lg bg-gray-800 hover:bg-gray-700 text-white flex items-center justify-center text-lg leading-none transition disabled:opacity-50"
        >
          −
        </button>
        <span className="text-white text-sm font-medium">{quantity}</span>
        <button
          onClick={() => updateQuantity(quantity + 1)}
          disabled={loading}
          className="w-7 h-7 rounded-lg bg-gray-800 hover:bg-gray-700 text-white flex items-center justify-center text-lg leading-none transition disabled:opacity-50"
        >
          +
        </button>
      </div>

      <button
        onClick={deleteCard}
        disabled={loading}
        className="text-red-400 hover:text-red-300 text-xs transition disabled:opacity-50"
      >
        Supprimer
      </button>
    </div>
  )
}