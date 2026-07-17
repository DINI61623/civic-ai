import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingAIAssistant from "@/components/ui/FloatingAIAssistant";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { LanguageProvider } from "@/components/providers/LanguageProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CivicAI - India's AI-Powered Citizen Assistant",
  description: "Discover government exams, schemes, and scholarships from one platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthProvider>
          <ThemeProvider>
            <LanguageProvider>
              <Header />
              <main className="flex-1 flex flex-col">
                {children}
              </main>
              <Footer />
              <FloatingAIAssistant />
            </LanguageProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
