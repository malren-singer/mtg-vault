import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { BookOpen, Star, Users, ChevronRight, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import CreateOrgForm from "./CreateOrgForm"
import AppLayout from "../components/AppLayout"

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
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Bonjour, {session!.user!.name} 👋
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Bienvenue sur MTG Vault</p>
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

        <div className="grid grid-cols-2 gap-3">
          <Link href="/collection">
            <Card className="hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer h-full">
              <CardContent className="flex items-center gap-3 py-5">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BookOpen className="size-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Ma collection</p>
                  <p className="text-muted-foreground text-xs mt-0.5">Cartes possédées</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/wishlist">
            <Card className="hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer h-full">
              <CardContent className="flex items-center gap-3 py-5">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Star className="size-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Ma wishlist</p>
                  <p className="text-muted-foreground text-xs mt-0.5">Cartes recherchées</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Users className="size-4 text-primary" />
              Mes guildes
            </h2>
            {memberships.length > 0 && (
              <Badge variant="secondary">{memberships.length}</Badge>
            )}
          </div>

          {memberships.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground text-sm">
                Tu n&apos;as pas encore de guilde. Crée-en une ou rejoins-en une via un lien d&apos;invitation.
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-2">
              {memberships.map((m) => (
                <Link key={m.org.id} href={`/orgs/${m.org.id}`}>
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                    <CardContent className="flex items-center justify-between py-4">
                      <div>
                        <p className="font-medium text-sm">{m.org.name}</p>
                        <p className="text-muted-foreground text-xs mt-0.5">
                          {m.role === "ADMIN" ? "Administrateur" : "Membre"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {m.role === "ADMIN" && (
                          <Badge variant="outline" className="text-xs">Admin</Badge>
                        )}
                        <ChevronRight className="size-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        <CreateOrgForm />
      </div>
    </AppLayout>
  )
}
