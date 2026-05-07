import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "CloudVault — Cloud Based File Storage System",
  description:
    "Store, manage, and share your files securely in the cloud. CloudVault provides fast, reliable, and encrypted cloud storage.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        <TooltipProvider>
          {children}
        </TooltipProvider>
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            className: "border border-border bg-card text-card-foreground",
          }}
        />
      </body>
    </html>
  );
}
