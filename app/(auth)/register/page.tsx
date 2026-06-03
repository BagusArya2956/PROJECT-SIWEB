import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Register | SHIPIN GO",
  description: "Daftarkan akun admin SHIPIN GO untuk mulai mengelola pengiriman."
};

export default function RegisterPage() {
  return (
    <main className="admin-auth-page min-h-screen bg-[#f5f7f2] px-4 py-8 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[920px] items-center justify-center">
        <LoginForm mode="register" />
      </div>
    </main>
  );
}
