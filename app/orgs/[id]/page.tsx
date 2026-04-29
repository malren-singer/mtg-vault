import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import Link from "next/link"
import MemberActions from "./MemberActions"
import CopyButton from "./CopyButton"

const prisma = new PrismaClient()

export default async function OrgPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) redirect("/login")

  const { id } = await params

  const membership = await prisma.orgMember.findUnique({
    where: { userId_orgId: { userId: session.user.id, orgId: id } },
  })
  if (!membership) redirect("/dashboard")

  const org = await prisma.organization.findUnique({
    where: { id },
    include: {
      members: {
        include: { user: { select: { id: true, username: true, email: true } } },
      },
    },
  })
  if (!org) redirect("/dashboard")

  const inviteUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/join/${org.inviteToken}`
  const isAdmin = membership.role === "ADMIN"

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/dashboard" className="text-gray-500 text-sm hover:text-gray-300 mb-2 block">← Dashboard</Link>
            <h1 className="text-2xl font-semibold">{org.name}</h1>
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

        {isAdmin && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
            <p className="text-sm font-medium mb-2">Lien d'invitation</p>
            <div className="flex gap-2">
              <input
                readOnly
                value={inviteUrl}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none"
              />
              <CopyButton url={inviteUrl} />
            </div>
          </div>
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="font-medium mb-4">Membres ({org.members.length})</h2>
          <div className="flex flex-col gap-3">
            {org.members.map((m) => (
              <div key={m.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{m.user.username}</p>
                  <p className="text-xs text-gray-500">{m.role === "ADMIN" ? "Administrateur" : "Membre"}</p>
                </div>
                {isAdmin && m.user.id !== session.user.id && (
                  <MemberActions orgId={id} userId={m.user.id} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}