import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Moderasi Ulasan | SHIPIN GO",
  description: "Tinjau dan moderasi ulasan pelanggan dari dashboard admin SHIPIN GO."
};

export default function AdminUlasanLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
