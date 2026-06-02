import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Histori Pengiriman | SHIPIN GO",
  description: "Lihat, ubah, dan kelola histori pengiriman dari dashboard admin SHIPIN GO."
};

export default function AdminHistoriLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
