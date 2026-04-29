import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "MTG Vault",
  description: "Gestion de collection MTG",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}