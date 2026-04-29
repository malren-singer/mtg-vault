"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function MemberActions({ orgId, userId }: { orgId: string; userId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function remove() {
    if (!confirm("Retirer ce membre ?")) return
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
    <button
      onClick={remove}
      disabled={loading}
      className="text-red-400 hover:text-red-300 text-sm transition disabled:opacity-50"
    >
      Retirer
    </button>
  )
}