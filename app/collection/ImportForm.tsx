"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Importer des cartes</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setOpen(!open)}>
            {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            {open ? "Fermer" : "Ouvrir"}
          </Button>
        </div>
      </CardHeader>

      {open && (
        <CardContent className="grid gap-3 pt-0">
          <label className="flex items-center justify-center gap-2 border border-dashed border-border rounded-lg px-4 py-3 text-sm text-muted-foreground cursor-pointer hover:border-primary hover:text-primary transition-colors">
            <Upload className="size-4" />
            Choisir un fichier .txt
            <input type="file" accept=".txt" onChange={handleFile} className="hidden" />
          </label>

          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={"4 Lightning Bolt\n2 Snapcaster Mage [MH2]\n1 Black Lotus"}
            rows={6}
            className="font-mono text-sm resize-none"
          />

          <Button onClick={handleImport} disabled={loading || !text.trim()} className="w-full">
            {loading ? "Import en cours..." : "Importer"}
          </Button>

          {result?.imported !== undefined && (
            <p className="text-sm text-center" style={{ color: "oklch(0.70 0.15 140)" }}>
              ✓ {result.imported} carte{result.imported !== 1 ? "s" : ""} importée{result.imported !== 1 ? "s" : ""}
            </p>
          )}
          {result?.error && (
            <p className="text-destructive text-sm text-center">{result.error}</p>
          )}
        </CardContent>
      )}
    </Card>
  )
}
