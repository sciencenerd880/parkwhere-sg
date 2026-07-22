import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import AuthListener from "@/components/auth/AuthListener"
import "./globals.css"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
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
      className={`${inter.variable} font-sans h-full antialiased`}
    >
      <body className="h-full bg-black text-foreground">
        <AuthListener />
        {children}
      </body>
    </html>
  )
}
