import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PressScape - Guest Post Marketplace",
  description: "Where Quality Content Meets Premium Publishers. Buy and sell guest posts, sponsored articles, and link insertions.",
  keywords: ["guest post", "link building", "SEO", "sponsored content", "backlinks"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-gray-50`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
