"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Layers, Loader2, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function JoinPage() {
  const router = useRouter()
  const { token } = useParams<{ token: string }>()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    async function join() {
      const res = await fetch(`/api/join/${token}`, { method: "POST" })
      const data = await res.json()

      if (res.status === 401) {
        router.push(`/login?redirect=/join/${token}`)
        return
      }

      if (res.ok) {
        setStatus("success")
        setTimeout(() => router.push(`/orgs/${data.orgId}`), 1500)
      } else {
        setStatus("error")
        setMessage(data.error)
      }
    }
    join()
  }, [token, router])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <div className="flex justify-center mb-2">
            <Layers className="size-8 text-primary" />
          </div>
          <CardTitle>Rejoindre une guilde</CardTitle>
        </CardHeader>
        <CardContent className="pb-6">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="size-6 animate-spin text-primary" />
              <p className="text-sm">Vérification du lien...</p>
            </div>
          )}
          {status === "success" && (
            <div className="flex flex-col items-center gap-3" style={{ color: "oklch(0.70 0.15 140)" }}>
              <CheckCircle className="size-6" />
              <p className="text-sm font-medium">Guilde rejointe ! Redirection...</p>
            </div>
          )}
          {status === "error" && (
            <div className="flex flex-col items-center gap-3 text-destructive">
              <XCircle className="size-6" />
              <p className="text-sm">{message}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
