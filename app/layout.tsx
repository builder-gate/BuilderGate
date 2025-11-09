import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { WagmiConfig } from "@/providers/wagmi-provider"
import { FarcasterProvider } from "@/contexts/FarcasterContext"
import { SelfProvider } from "@/contexts/SelfContext"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "BuilderGate - Reputation-Gated Yield Distribution for Web3 Builders",
    template: "%s | BuilderGate"
  },
  description: "Prove your Web3 contributions and access exclusive yield. Reputation-gated vault powered by GitHub, Talent Protocol, and Self Protocol verification. No applications, no governance votes, just verifiable reputation.",
  keywords: [
    "BuilderGate",
    "Web3",
    "DeFi",
    "Yield Distribution",
    "Reputation",
    "Builder Vault",
    "GitHub Verification",
    "Talent Protocol",
    "Self Protocol",
    "zkProof",
    "ERC-4626",
    "Uniswap v4",
    "Base",
    "Farcaster Mini App"
  ],
  authors: [{ name: "BuilderGate Team" }],
  creator: "BuilderGate",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://buildergate.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "BuilderGate - Reputation-Gated Yield Distribution",
    description: "Prove your Web3 contributions through zkProofs and attestations. Access exclusive yield based on verifiable reputation.",
    siteName: "BuilderGate",
    images: [
      {
        url: "/banner.png",
        width: 1200,
        height: 630,
        alt: "BuilderGate - Reputation-Gated Builder Vault"
      },
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "BuilderGate Logo"
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BuilderGate - Reputation-Gated Yield Distribution",
    description: "Prove your Web3 contributions and access exclusive yield. Built for developers, maintainers, and technical creators.",
    images: ["/banner.png"],
    creator: "@BuilderGate"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        type: "image/x-icon",
      },
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.json",
  verification: {
    // Add your verification codes when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`} suppressHydrationWarning>
        <WagmiConfig>
          <FarcasterProvider>
            <SelfProvider>
              <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                {children}
              </ThemeProvider>
            </SelfProvider>
          </FarcasterProvider>
        </WagmiConfig>
        <Analytics />
      </body>
    </html>
  )
}
