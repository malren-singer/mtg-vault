"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { UserMinus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function MemberActions({ orgId, userId }: { orgId: string; userId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function remove() {
    if (!confirm("Retirer ce membre de la guilde ?")) return
    setLoading(true)
    await fetch(`/api/orgs/${orgId}/members`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <Button
      variant="destructive"
      size="xs"
      onClick={remove}
      disabled={loading}
    >
      <UserMinus className="size-3" />
      Retirer
    </Button>
  )
}
