import "./globals.css"
import { Inter } from "next/font/google"
import { Toaster } from 'react-hot-toast';
import { ClerkProvider } from '@clerk/nextjs';
import { AuthSyncProvider } from '@/components/auth-sync-provider';
import Navbar from "@/components/navbar";
const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Twino - Two Minds. One Talk.",
  description: "Experience the magic of two AI personalities discussing any topic you choose. Watch as they debate, inform, and entertain with their unique perspectives.",
  keywords: "AI, chatbot, conversation, artificial intelligence, dialogue, debate, dual AI, interactive AI, AI personalities, AI discussion, AI chat",
  openGraph: {
    title: "Twino - Two Minds. One Talk.",
    description: "Experience the magic of two AI personalities discussing any topic you choose.",
    type: "website",
    locale: "en_US",
    url: "https://twino.vercel.app",
    siteName: "Twino",
    images: [
      {
        url: "/twino.png",
        width: 1200,
        height: 630,
        alt: "Twino - AI Conversation Platform"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Twino - Two Minds. One Talk.",
    description: "Experience the magic of two AI personalities discussing any topic you choose.",
    creator: "@twino",
    images: ["/twino.png"]
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png"
  }
}

export default function RootLayout({
  children
}) {
  return (
    <ClerkProvider>
      <html className="h-full" lang="en">
        <body className={`${inter.className} h-full`}>
          <AuthSyncProvider>
            {children}
          </AuthSyncProvider>
          
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}