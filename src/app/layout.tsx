import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "sonner";
import { PwaRegistration } from "@/pwa/pwa-registration";
import { Providers } from "./providers";
import "./globals.css";

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LexChain",
  description: "LexChain web portal for document verification and administration.",
  icons: {
    icon: "/lexchain/logo-lexchain.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster position="bottom-right" richColors closeButton visibleToasts={1} mobileOffset={{ bottom: 120 }} />
        </Providers>
        <PwaRegistration />
      </body>
    </html>
  );
}
