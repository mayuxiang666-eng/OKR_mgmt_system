import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientAuthWrapper from "../components/ClientAuthWrapper";
import NewObjectiveModal from "../components/NewObjectiveModal";
import { Providers } from "./providers";

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
        <Providers>
          <ClientAuthWrapper>
            {children}
          </ClientAuthWrapper>
          <NewObjectiveModal />
        </Providers>
      </body>
    </html>
  );
}
