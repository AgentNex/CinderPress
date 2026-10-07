import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/context";

export const metadata: Metadata = {
  title: {
    default: "CinderPress Review — Independent Systems & Editorial Publishing",
    template: "%s | CinderPress Review",
  },
  description: "A calm, precise journal on software architecture, edge databases, interface craftsmanship, and systems engineering.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  keywords: ["systems architecture", "edge computing", "cloudflare", "d1", "publishing", "typography", "cloudinary"],
  authors: [{ name: "CinderPress Editorial Board" }],
  openGraph: {
    title: "CinderPress Review",
    description: "An independent journal of systems architecture and interface craftsmanship.",
    siteName: "CinderPress Review",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CinderPress Review",
    description: "An independent journal of systems architecture and interface craftsmanship.",
  },
};

export const viewport: Viewport = {
  themeColor: "#FAF8F3",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-cinder-paper text-cinder-ink min-h-screen flex flex-col antialiased selection:bg-cinder-orange selection:text-white font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
