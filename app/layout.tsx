import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { WagmiConfig } from "@/providers/wagmi-provider"
import { SdkInitializer } from "@/components/sdk-initializer"
import { FarcasterProvider } from "@/contexts/FarcasterContext"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
})

export const metadata: Metadata = {
  title: "BuilderGate - Farcaster Mini App",
  description: "Farcaster Mini App with WalletConnect integration",
  generator: 'BuilderGate',
  keywords: ['wallet', 'farcaster', 'walletconnect', 'blockchain', 'web3', 'dapp'],
  authors: [{ name: 'BuilderGate' }],
  openGraph: {
    title: "BuilderGate - Farcaster Mini App",
    description: "Farcaster Mini App with WalletConnect integration",
    url: process.env.NEXT_PUBLIC_SITE_URL || "",
    siteName: "BuilderGate",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/banner.png`,
        width: 1200,
        height: 630,
        alt: "BuilderGate - Farcaster Mini App"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "BuilderGate - Farcaster Mini App",
    description: "Farcaster Mini App with WalletConnect integration",
    images: [`${process.env.NEXT_PUBLIC_SITE_URL}/banner.png`]
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png"
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <WagmiConfig>
          <FarcasterProvider>
            <SdkInitializer />
            {children}
          </FarcasterProvider>
        </WagmiConfig>
      </body>
    </html>
  )
}
