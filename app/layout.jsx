import "./globals.css"
import { Inter } from "next/font/google"
import { Toaster } from 'react-hot-toast';
import { ClerkProvider } from '@clerk/nextjs';
import { AuthSyncProvider } from '@/components/auth-sync-provider';
import Navbar from "@/components/navbar";
const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Twino - Two Minds. One Talk.",
  description: "Watch two AI bots chat about any topic",
}

export default function RootLayout({
  children
}) {
  return (
    <ClerkProvider>
      <html className="h-full" lang="en">
        <body className={`${inter.className} h-full`}>
          <AuthSyncProvider />
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}