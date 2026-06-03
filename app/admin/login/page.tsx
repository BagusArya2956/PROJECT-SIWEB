import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login Admin | SHIPIN GO",
  description: "Masuk sebagai admin SHIPIN GO untuk mengelola operasional pengiriman."
};

function LoadingFallback() {
  return (
    <main className="admin-auth-page min-h-screen bg-[#f5f7f2] px-4 py-8 sm:px-6">
      <div className="grid min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-[13px] font-semibold text-[#5f6d63]">Memuat login admin...</div>
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <main className="admin-auth-page min-h-screen bg-[#f5f7f2] px-4 py-8 sm:px-6">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[760px] items-center justify-center">
          <LoginForm />
        </div>
      </main>
    </Suspense>
  );
}
