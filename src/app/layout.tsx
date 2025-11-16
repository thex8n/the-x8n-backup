import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import localFont from "next/font/local"
import "./globals.css"
import Toaster from "@/components/ui/Toaster"
import InitialLoader from "@/components/ui/InitialLoader"
import { LoadingProvider } from "@/contexts/LoadingContext"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const momoTrust = localFont({
  src: [{
    path: '../../public/fonts/Momo_Trust_Display/MomoTrustDisplay-Regular.ttf',
    weight: '400',
    style: 'normal',
  }],
  variable: '--font-momo-trust',
  display: 'block',
  preload: true,
})

export const metadata: Metadata = {
  title: "The X8N Dashboard",
  description: "Dashboard application",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${momoTrust.variable} antialiased`}>
        <LoadingProvider>
          <InitialLoader />
          {children}
          <Toaster />
        </LoadingProvider>
      </body>
    </html>
  )
}