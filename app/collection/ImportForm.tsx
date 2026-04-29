"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ImportForm({ listType }: { listType: "OWNED" | "WANTED" }) {
  const router = useRouter()
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ imported?: number; error?: string } | null>(null)
  const [open, setOpen] = useState(false)

  async function handleImport() {
    setLoading(true)
    setResult(null)

    const res = await fetch("/api/cards/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, listType }),
    })

    const data = await res.json()
    setResult(data)
    setLoading(false)

    if (res.ok) {
      setText("")
      setOpen(false)
      router.refresh()
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const content = await file.text()
    setText(content)
    setOpen(true)
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Importer des cartes</h3>
        <button
          onClick={() => setOpen(!open)}
          className="text-sm text-indigo-400 hover:text-indigo-300 transition"
        >
          {open ? "Fermer" : "Ouvrir"}
        </button>
      </div>

      {open && (
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <label className="flex-1 flex items-center justify-center gap-2 bg-gray-800 border border-dashed border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-400 cursor-pointer hover:border-indigo-500 transition">
              <span>Choisir un fichier .txt</span>
              <input
                type="file"
                accept=".txt"
                onChange={handleFile}
                className="hidden"
              />
            </label>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={"4 Lightning Bolt\n2 Snapcaster Mage [MH2]\n1 Black Lotus"}
            rows={6}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-300 font-mono focus:outline-none focus:border-indigo-500 resize-none"
          />

          <button
            onClick={handleImport}
            disabled={loading || !text.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-2.5 text-sm font-medium transition disabled:opacity-50"
          >
            {loading ? "Import en cours..." : "Importer"}
          </button>

          {result?.imported !== undefined && (
            <p className="text-green-400 text-sm">{result.imported} carte{result.imported !== 1 ? "s" : ""} importée{result.imported !== 1 ? "s" : ""}</p>
          )}
          {result?.error && (
            <p className="text-red-400 text-sm">{result.error}</p>
          )}
        </div>
      )}
    </div>
  )
}