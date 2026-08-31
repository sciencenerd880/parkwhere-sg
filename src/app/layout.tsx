import type { Metadata, Viewport } from "next"
import AuthListener from "@/components/auth/AuthListener"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

export const metadata: Metadata = {
  title: "ParkWhere SG — Find Your Spot, Instantly.",
  description:
    "Find available car parks near your destination in Singapore with live lot counts.",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className="font-sans h-full antialiased"
    >
      <body className="h-full bg-black text-foreground">
        <AuthListener />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
