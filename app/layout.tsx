import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import SiteHeader from "@/components/site-header"
import RouteBodyClass from "@/components/route-body-class"

export const metadata: Metadata = {
  title: "MZ Automotores",
  description: "Concesionaria de vehículos - Encuentra tu próximo auto, motos y más",
  manifest: "/manifest.json",
  themeColor: "#dc2626",
  // Evitar maximum-scale/user-scalable=no (rompe foco en iOS PWA)
  viewport: "width=device-width, initial-scale=1",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "MZ Automotores" },
  icons: { icon: "/images/mzlogo.png", apple: "/images/mzlogo.png" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <meta name="application-name" content="MZ Automotores" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MZ Automotores" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#dc2626" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="apple-touch-icon" href="/images/mzlogo.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preload" href="/images/mzlogo.png" as="image" />
        <link rel="dns-prefetch" href="//wa.me" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      {/* RouteBodyClass pone bodyClass="route-login" cuando pathname === "/login" */}
      <body className="antialiased">
        <RouteBodyClass>
          <AuthProvider>
            <SiteHeader />
            <div>{children}</div>
          </AuthProvider>
        </RouteBodyClass>
      </body>
    </html>
  )
}
