import  { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { ClerkProvider } from "@clerk/nextjs";
import { AuthSyncProvider } from "@/components/auth-sync-provider";
import Navbar from "@/components/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL("https://twino.vercel.app"),
  title: "Twino Ai - Two Minds. One Talk.",
  description:
    "Twino Ai is an interactive AI conversation platform where two AI personalities debate, inform, and entertain on any topic you choose. Engage with dynamic dual AI discussions.",
  authors: [{ name: "Twino AI" }],
  keywords: [
    "Twino",
    "AI conversation",
    "dual AI",
    "AI debate",
    "AI chatbot",
    "interactive AI",
    "artificial intelligence",
    "AI personalities",
    "AI dialogue",
    "AI discussion",
    "AI chat platform",
    "debate AI",
    "two AI minds",
    "Twino Ai",
  ],
  creator: "Karim el assali",
  publisher: "karim el assali",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  openGraph: {
    type: "website",
    siteName: "Twino",
    title: "Twino - Two Minds. One Talk.",
    description:
      "Experience the magic of two AI personalities discussing any topic you choose. Interactive, engaging, and entertaining.",
    images: [
      {
        url: "https://twino.vercel.app/twino.webp",
        width: 1200,
        height: 630,
        alt: "Twino - AI Conversation Platform",
      },
    ],
    locale: "en_US",
    url: "https://twino.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "Twino - Two Minds. One Talk.",
    description:
      "Experience the magic of two AI personalities discussing any topic you choose.",
    creator: "@twino",
    images: ["https://twino.vercel.app/twino.webp"],
  },
  other: {
    "theme-color": "#6C63FF",
    rating: "General",
  },
  alternates: {
    canonical: "https://twino.vercel.app",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export default function RootLayout({ children}){
  return (
    <ClerkProvider>
      <html className="h-full" lang="en">
        <head>
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/favicons/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicons/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicons/favicon-16x16.png"
          />
          <link rel="manifest" href="/site.webmanifest" />
          <meta
            name="google-site-verification"
            content="TFC9KKJST9sPJHv4r0wz0xnmUb09ZFJFC8crGzgUSnk"
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "Twino Ai",
                url: "https://twino.vercel.app",
                potentialAction: {
                  "@type": "SearchAction",
                  target: "https://twino.vercel.app/search?q={search_term_string}",
                  "query-input": "required name=search_term_string",
                },
              }),
            }}
          />
        </head>
        <body className={`${inter.className} flex flex-col min-h-screen`}>
          <AuthSyncProvider>
            <Navbar />
            <main className="flex-grow">{children}</main>
          </AuthSyncProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
