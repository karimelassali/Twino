import "./globals.css"
import { Inter } from "next/font/google"
import  { Toaster } from 'react-hot-toast';


const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Twino - Two Minds. One Talk.",
  description: "Watch two AI bots chat about any topic",
}

export default function RootLayout({
  children
}) {
  return (
    <html className="h-full" lang="en">
      <body className={`${inter.className} h-full`}>{children}
        <Toaster />
      </body>
    </html>
  );
}
 