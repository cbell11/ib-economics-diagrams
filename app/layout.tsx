import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from '../components/Header';
import MobileWarning from '../components/MobileWarning';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EconGraph Pro by Diploma Collective",
  description: "Create professional IB Economics diagrams in seconds",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50`} suppressHydrationWarning>
        <MobileWarning />
        <Header />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
