import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import ImportForm from "./ImportForm"
import CardGrid from "./CardGrid"
import AppLayout from "../components/AppLayout"

const prisma = new PrismaClient()

export default async function CollectionPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const cards = await prisma.card.findMany({
    where: { userId: session.user.id, listType: "OWNED" },
    orderBy: { cardName: "asc" },
  })

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white">Ma collection</h1>
          <p className="text-gray-400 text-sm mt-1">{cards.length} carte{cards.length !== 1 ? "s" : ""}</p>
        </div>
        <ImportForm listType="OWNED" />
        <CardGrid cards={cards} />
      </div>
    </AppLayout>
  )
}