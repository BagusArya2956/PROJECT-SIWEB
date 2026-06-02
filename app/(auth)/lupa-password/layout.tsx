import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lupa Password | SHIPIN GO",
  description: "Atur ulang password akun admin SHIPIN GO dengan aman."
};

export default function ForgotPasswordLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
