import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { LoginHeroPanel } from "@/components/auth/login-hero-panel";

function LoadingFallback() {
  return (
    <main className="min-h-screen bg-[#f7f7f0] p-3 sm:p-4 lg:p-5">
      <div className="grid min-h-[calc(100vh-1.5rem)] items-center justify-center">
        <div className="text-[13px] font-semibold text-[#5f6d63]">Memuat register...</div>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <main className="min-h-screen bg-[#f7f7f0] p-3 sm:p-4 lg:p-5">
        <div className="grid min-h-[calc(100vh-1.5rem)] gap-3 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="order-1 lg:order-2">
            <LoginHeroPanel />
          </div>
          <div className="order-2 lg:order-1">
            <LoginForm mode="register" />
          </div>
        </div>
      </main>
    </Suspense>
  );
}
