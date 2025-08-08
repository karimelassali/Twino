import "./globals.css"
import { Inter } from "next/font/google"
import { Toaster } from 'react-hot-toast';
import { ClerkProvider } from '@clerk/nextjs';
import { AuthSyncProvider } from '@/components/auth-sync-provider';
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
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

/**
 * The schema.org JSON-LD object that is used to provide structured data
 * about the website to search engines.
 *
 * @type {Object}
 */
const jsonLd = {
  /**
   * The @context property specifies the schema.org context for the JSON-LD.
   *
   * @type {string}
   */
  "@context": "https://schema.org",

  /**
   * The @type property specifies the type of the item being described.
   *
   * @type {string}
   */
  "@type": "WebSite",

  /**
   * The name property specifies the name of the website.
   *
   * @type {string}
   */
  "name": "Twino",

  /**
   * The url property specifies the URL of the website.
   *
   * @type {string}
   */
  "url": "https://twino.vercel.app"
};

export default function RootLayout({
  children
}) {
  return (
    <ClerkProvider>
      <html className="h-full" lang="en">
        <head>
          <link rel="canonical" href="https://twino.vercel.app" />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(jsonLd),
            }}
          />
            
          <meta name="google-site-verification" content="TFC9KKJST9sPJHv4r0wz0xnmUb09ZFJFC8crGzgUSnk" />
        </head>
        <body className={`${inter.className} flex flex-col min-h-screen`}>
          <AuthSyncProvider>
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
          </AuthSyncProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}