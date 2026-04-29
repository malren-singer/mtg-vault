import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import ImportForm from "../collection/ImportForm"
import WishlistGrid from "./WishlistGrid"
import AppLayout from "../components/AppLayout"

const prisma = new PrismaClient()

export default async function WishlistPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const cards = await prisma.card.findMany({
    where: { userId: session.user.id, listType: "WANTED" },
    orderBy: { cardName: "asc" },
  })

  const memberships = await prisma.orgMember.findMany({
    where: { userId: session.user.id },
    select: { orgId: true },
  })

  const allMatches = []

  for (const m of memberships) {
    const otherMembers = await prisma.orgMember.findMany({
      where: { orgId: m.orgId, userId: { not: session.user.id } },
      include: { user: { select: { id: true, username: true } } },
    })

    for (const member of otherMembers) {
      const owned = await prisma.card.findMany({
        where: {
          userId: member.userId,
          listType: "OWNED",
          cardName: { in: cards.map(c => c.cardName), mode: "insensitive" },
        },
      })

      if (owned.length > 0) {
        allMatches.push({ member: member.user, cards: owned })
      }
    }
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white">Ma wishlist</h1>
          <p className="text-gray-400 text-sm mt-1">{cards.length} carte{cards.length !== 1 ? "s" : ""}</p>
        </div>
        <ImportForm listType="WANTED" />
        <WishlistGrid cards={cards} matches={allMatches} />
      </div>
    </AppLayout>
  )
}