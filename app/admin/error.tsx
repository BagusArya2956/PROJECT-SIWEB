"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AdminError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    document.title = "Terjadi Kesalahan Admin | SHIPIN GO";
    console.error("Admin route error:", error);
  }, [error]);

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.14),transparent_36%),#f3f7f1] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto grid max-w-[620px] place-items-center">
        <div className="w-full rounded-[30px] border border-[#ddeddc] bg-white p-8 text-center shadow-[0_24px_60px_rgba(95,128,101,0.18)]">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#eaf8ee] text-[#16a34a]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-9 w-9">
              <path d="M12 8v5" />
              <path d="M12 16h.01" />
              <path d="M10.3 3.8 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z" />
            </svg>
          </div>
          <p className="mt-6 text-[12px] font-bold uppercase tracking-[0.16em] text-[#16a34a]">500 Internal Server Error</p>
          <h1 className="mt-3 text-[34px] font-extrabold leading-none text-[#1e3526]">
            Terjadi Kesalahan di Area Admin
          </h1>
          <p className="mt-4 text-[15px] leading-7 text-[#617067]">
            Sistem admin mengalami error saat memproses halaman ini. Anda bisa mencoba lagi atau kembali ke dashboard.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#16a34a] px-6 text-[14px] font-semibold text-white hover:bg-[#12813a]"
            >
              Coba Lagi
            </button>
            <Link
              href="/admin/dashboard"
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#d4e4d2] px-6 text-[14px] font-semibold text-[#1e3526] hover:bg-[#f5faf4]"
            >
              Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
