import localFont from "next/font/local";
import "./globals.css";
import Providers from "@/app/providers";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import PageTransition from "@/components/PageTransition";

export const metadata: Metadata = {
  title: "Gelato Smart Wallet & Crypto-Backed Loans | Morpho",
  description:
    "Secure, gasless transactions and crypto-backed loans with Gelato Smart Wallet—powered by EIP-7702 and integrated with Morpho.",
  openGraph: {
    title: "Gelato Smart Wallet & Crypto-Backed Loans | Morpho",
    description:
      "Explore seamless crypto experiences powered by EIP-7702. Use Gelato Smart Wallet on Morpho for secure, gasless payments and crypto-backed loans.",
    url: "https://morpho-aa.demo.gelato.cloud/",
    type: "website",
    images: ["https://morpho-aa.demo.gelato.cloud/gelato-meta-preview.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gelato Smart Wallet & Crypto-Backed Loans | Morpho",
    description:
      "Powered by EIP-7702, Gelato Smart Wallet on Morpho enables gasless transactions and crypto-backed loans for real-world crypto use.",
    images: ["https://morpho-aa.demo.gelato.cloud/gelato-meta-preview.png"],
  },
  icons: {
    icon: "https://raas.staging.gelato.network/images/favicon.ico",
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
        <Providers>
          <PageTransition>{children}</PageTransition>
        </Providers>
      </body>
    </html>
  );
}
