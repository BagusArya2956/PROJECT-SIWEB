import { Suspense } from "react";

import { LacakPaketPage } from "@/components/public/lacak-paket-page";
import { PublicNavbar } from "@/components/public/navbar";

function LoadingFallback() {
  return (
    <main className="min-h-screen bg-[#f2f5f1]">
      <div className="mx-auto max-w-[1540px] px-4 py-6 text-[13px] font-semibold text-[#5f6d63]">
        Memuat lacak paket...
      </div>
    </main>
  );
}

export default function LacakPaketRoutePage() {
  return (
    <>
      <PublicNavbar />
      <Suspense fallback={<LoadingFallback />}>
        <LacakPaketPage />
      </Suspense>
    </>
  );
}
