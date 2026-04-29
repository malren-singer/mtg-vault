"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2, LogOut, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function OrgActions({ orgId, isAdmin }: { orgId: string; isAdmin: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleLeave() {
    if (!confirm("Quitter cette guilde ?")) return
    setLoading(true)
    setError("")

    const res = await fetch(`/api/orgs/${orgId}/leave`, { method: "POST" })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      setLoading(false)
      return
    }

    router.push("/dashboard")
  }

  async function handleDelete() {
    const confirmed = confirm(
      "Supprimer définitivement cette guilde ?\nTous les membres seront retirés. Cette action est irréversible."
    )
    if (!confirmed) return
    setLoading(true)
    setError("")

    const res = await fetch(`/api/orgs/${orgId}`, { method: "DELETE" })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      setLoading(false)
      return
    }

    router.push("/dashboard")
  }

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2 text-destructive">
          <AlertTriangle className="size-4" />
          Zone de danger
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {!isAdmin && (
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Quitter la guilde</p>
              <p className="text-xs text-muted-foreground">Tu perdras l&apos;accès à cette guilde</p>
            </div>
            <Button variant="destructive" size="sm" onClick={handleLeave} disabled={loading}>
              <LogOut className="size-4" />
              Quitter
            </Button>
          </div>
        )}

        {isAdmin && (
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Supprimer la guilde</p>
              <p className="text-xs text-muted-foreground">Supprime la guilde et retire tous les membres</p>
            </div>
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
              <Trash2 className="size-4" />
              Supprimer
            </Button>
          </div>
        )}

        {error && <p className="text-destructive text-xs">{error}</p>}
      </CardContent>
    </Card>
  )
}
