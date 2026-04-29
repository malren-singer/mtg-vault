"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CreateOrgForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/orgs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      setLoading(false)
    } else {
      router.refresh()
      setName("")
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Créer une guilde</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 grid gap-1.5">
            <Label htmlFor="guild-name" className="sr-only">Nom de la guilde</Label>
            <Input
              id="guild-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom de la guilde"
              required
            />
          </div>
          <Button type="submit" disabled={loading} size="default">
            {loading ? "..." : <><Plus className="size-4" />Créer</>}
          </Button>
        </form>
        {error && <p className="text-destructive text-sm mt-2">{error}</p>}
      </CardContent>
    </Card>
  )
}
