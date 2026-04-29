import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ArrowLeft, Crown, LogOut, Link2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import MemberActions from "./MemberActions"
import CopyButton from "./CopyButton"
import OrgActions from "./OrgActions"
import AppLayout from "../../components/AppLayout"

export default async function OrgPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const userId = session!.user!.id as string

  const { id } = await params

  const membership = await prisma.orgMember.findUnique({
    where: { userId_orgId: { userId, orgId: id } },
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

  const headersList = await headers()
  const host = headersList.get("x-forwarded-host") || headersList.get("host") || "localhost:3000"
  const proto = headersList.get("x-forwarded-proto") || "http"
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`
  const inviteUrl = `${baseUrl}/join/${org.inviteToken}`
  const isAdmin = membership.role === "ADMIN"

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon-sm">
                <ArrowLeft className="size-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">{org.name}</h1>
              {isAdmin && (
                <p className="text-xs text-primary flex items-center gap-1 mt-0.5">
                  <Crown className="size-3" /> Administrateur
                </p>
              )}
            </div>
          </div>
          <form action={async () => {
            "use server"
            await signOut({ redirectTo: "/login" })
          }}>
            <Button type="submit" variant="outline" size="sm">
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Se déconnecter</span>
            </Button>
          </form>
        </div>

        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Link2 className="size-4 text-primary" />
                Lien d&apos;invitation
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex gap-2">
                <input
                  readOnly
                  value={inviteUrl}
                  className="flex-1 bg-muted/50 border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground focus:outline-none truncate"
                />
                <CopyButton url={inviteUrl} />
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="size-4 text-primary" />
              Membres
              <Badge variant="secondary" className="ml-auto">{org.members.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 grid gap-0">
            {org.members.map((m, i) => (
              <div key={m.id}>
                {i > 0 && <Separator className="my-3" />}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-primary/15 flex items-center justify-center text-primary text-sm font-semibold">
                      {m.user.username[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{m.user.username}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.role === "ADMIN" ? "Administrateur" : "Membre"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {m.role === "ADMIN" && (
                      <Crown className="size-3.5 text-primary" />
                    )}
                    {isAdmin && m.user.id !== userId && (
                      <MemberActions orgId={id} userId={m.user.id} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <OrgActions orgId={id} isAdmin={isAdmin} />
      </div>
    </AppLayout>
  )
}
