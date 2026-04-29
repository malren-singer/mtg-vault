import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import Link from "next/link"
import CreateOrgForm from "./CreateOrgForm"
import AppLayout from "../components/AppLayout"

const prisma = new PrismaClient()

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const userId = session!.user!.id as string

  const memberships = await prisma.orgMember.findMany({
    where: { userId },
    include: { org: true },
  })

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white">Bienvenue, {session!.user!.name}</h1>
            <p className="text-gray-400 text-sm mt-1">MTG Vault</p>
          </div>
          <form action={async () => {
            "use server"
            await signOut({ redirectTo: "/login" })
          }}>
            <button type="submit" className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm px-4 py-2 rounded-lg transition">
              Se déconnecter
            </button>
          </form>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          <Link href="/collection" className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 hover:border-indigo-500 transition">
            <p className="font-medium text-white">Ma collection</p>
            <p className="text-gray-500 text-sm mt-1">Cartes que je possède</p>
          </Link>
          <Link href="/wishlist" className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 hover:border-indigo-500 transition">
            <p className="font-medium text-white">Ma wishlist</p>
            <p className="text-gray-500 text-sm mt-1">Cartes que je cherche</p>
          </Link>
        </div>

        <h2 className="text-lg font-medium text-white mb-4">Mes guildes</h2>

        {memberships.length === 0 && (
          <p className="text-gray-500 text-sm mb-6">Tu n'as pas encore de guilde.</p>
        )}

        <div className="flex flex-col gap-3 mb-8">
          {memberships.map((m) => (
            <Link
              key={m.org.id}
              href={`/orgs/${m.org.id}`}
              className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 flex items-center justify-between hover:border-indigo-500 transition"
            >
              <div>
                <p className="font-medium text-white">{m.org.name}</p>
                <p className="text-gray-500 text-sm mt-0.5">
                  {m.role === "ADMIN" ? "Administrateur" : "Membre"}
                </p>
              </div>
              <span className="text-gray-600 text-sm">→</span>
            </Link>
          ))}
        </div>

        <CreateOrgForm />
      </div>
    </AppLayout>
  )
}