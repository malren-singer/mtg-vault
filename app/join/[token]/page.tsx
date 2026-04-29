"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"

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
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center max-w-sm w-full">
        {status === "loading" && (
          <p className="text-gray-400">Vérification du lien...</p>
        )}
        {status === "success" && (
          <p className="text-green-400">Guilde rejointe ! Redirection...</p>
        )}
        {status === "error" && (
          <p className="text-red-400">{message}</p>
        )}
      </div>
    </div>
  )
}