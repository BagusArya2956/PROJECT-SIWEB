import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil Admin | SHIPIN GO",
  description: "Kelola profil, email, dan kata sandi akun admin SHIPIN GO."
};

export default function AdminProfileLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
