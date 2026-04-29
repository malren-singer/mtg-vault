import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Bienvenue, {session.user?.name}</h1>
          <p className="text-gray-400 text-sm mt-1">Ton dashboard MTG Vault</p>
        </div>
        <form action={async () => {
          "use server"
          await signOut({ redirectTo: "/login" })
        }}>
          <button
            type="submit"
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm px-4 py-2 rounded-lg transition"
          >
            Se déconnecter
          </button>
        </form>
      </div>
    </div>
  )
}