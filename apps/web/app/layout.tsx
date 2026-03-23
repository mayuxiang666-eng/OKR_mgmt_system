import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientAuthWrapper from "../components/ClientAuthWrapper";
import NewObjectiveModal from "../components/NewObjectiveModal";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });

export const metadata: Metadata = {
  title: "Stitch OKR",
  description: "Organizational Key Results tracking platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased text-gray-900 bg-[#FDFCFB]`}>
        <ClientAuthWrapper>
          {children}
        </ClientAuthWrapper>
        <NewObjectiveModal />
      </body>
    </html>
  );
}
