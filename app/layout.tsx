import localFont from "next/font/local";
import "./globals.css";
import Providers from "@/app/providers";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

export const metadata: Metadata = {
  title: "Gelato",
  description:
    "Explore EIP-7702 gas sponsorship and account abstraction in this interactive playground",
  openGraph: {
    title: "Gelato",
    description:
      "Explore EIP-7702 gas sponsorship and account abstraction in this interactive playground",
    images: [
      "https://cdn.prod.website-files.com/672e31b60a8c3f5e53aced2d/673cc864ff13c827dfd59a02_ABC-OG%20Image-min%202.png",
    ],
  },
  icons: {
    icon: "/favicon.png",
  },
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
