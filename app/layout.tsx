import type { Metadata } from "next";

import { AppPreferencesProvider } from "@/components/ui/app-preferences";

import "./globals.css";

export const metadata: Metadata = {
  title: "SHIPIN GO",
  description: "Platform logistics modern untuk pengiriman bisnis dan operasional admin SHIPIN GO."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('shipin_theme') || 'light';
                document.documentElement.lang = 'id';
                document.documentElement.classList.toggle('shipin-dark', theme === 'dark');
              } catch (_) {}
            `
          }}
        />
        <AppPreferencesProvider>{children}</AppPreferencesProvider>
      </body>
    </html>
  );
}
