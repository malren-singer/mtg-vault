import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import Link from "next/link"
import ImportForm from "./ImportForm"
import CardGrid from "./CardGrid"

const prisma = new PrismaClient()

export default async function CollectionPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const cards = await prisma.card.findMany({
    where: { userId: session.user.id, listType: "OWNED" },
    orderBy: { cardName: "asc" },
  })

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/dashboard" className="text-gray-500 text-sm hover:text-gray-300 mb-2 block">← Dashboard</Link>
            <h1 className="text-2xl font-semibold">Ma collection</h1>
            <p className="text-gray-400 text-sm mt-1">{cards.length} carte{cards.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        <ImportForm listType="OWNED" />

        <CardGrid cards={cards} />
      </div>
    </div>
  )
}