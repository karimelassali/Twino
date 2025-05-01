import "./globals.css"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Twino - Two Minds. One Talk.",
  description: "Watch two AI bots chat about any topic",
}

export default function RootLayout({
  children
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
