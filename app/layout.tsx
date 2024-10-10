import { Toaster } from "sonner";
import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";

import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { ModalProvider } from "@/components/providers/modal-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { EdgeStoreProvider } from "@/lib/edgestore";

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
  title: "Jotion",
  description: "Edit notes",
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/light_logo.svg",
        href: "/light_logo.svg",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/light_logo.svg",
        href: "/light_logo.svg",
      }
    ]
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ConvexClientProvider>
          <EdgeStoreProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
              storageKey="jotion-theme-2"
            >
              <Toaster position="bottom-center"/>
              <ModalProvider />
              {children}
            </ThemeProvider>
          </EdgeStoreProvider>
        </ConvexClientProvider>
      </body>
    </html>
  )
}