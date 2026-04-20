"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { UserIcon } from "@/components/icons";

const adminMenuItems = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/kirim-paket", label: "Kirim Paket" },
  { href: "/admin/histori", label: "Histori" },
  { href: "/admin/ulasan", label: "Ulasan" }
];

export function AdminTopNavbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-[#fbfaf3]/88 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-5 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/" className="text-sm font-extrabold tracking-tight text-shipin-deep">
            SHIPIN GO
          </Link>
          <span className="hidden rounded-full bg-[#e8f7df] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#2a8b48] md:inline-flex">
            Admin Area
          </span>
        </div>

        <nav className="hidden items-center gap-2 lg:flex">
          {adminMenuItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-shipin-deep text-white shadow-[0_10px_24px_rgba(20,91,48,0.18)]"
                    : "text-shipin-text hover:bg-white hover:text-shipin-deep"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/profile"
            aria-label="Profil Admin"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#1b7f4c] text-white ring-2 ring-[#d5e8d8]"
          >
            <UserIcon className="h-[18px] w-[18px]" />
          </Link>
        </div>
      </div>

      <div className="border-t border-white/50 lg:hidden">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
          {adminMenuItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-shipin-deep text-white"
                    : "border border-[#d8ded5] bg-white text-shipin-text"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
