import type { Metadata, Viewport } from "next"
import { Inter, Newsreader } from "next/font/google"
import AuthListener from "@/components/auth/AuthListener"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  style: ["normal", "italic"],
  display: "swap",
})

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
      className={`${inter.variable} ${newsreader.variable} font-sans h-full antialiased`}
    >
      <body className="h-full bg-black text-foreground">
        <AuthListener />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
