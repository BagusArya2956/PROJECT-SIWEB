import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kirim Paket | SHIPIN GO",
  description: "Buat pengiriman baru dan simpan data paket ke database Neon dari panel admin."
};

export default function AdminKirimPaketLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
