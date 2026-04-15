"use client";

import { useRouter } from "next/navigation";

import { ADMIN_SESSION_COOKIE } from "@/lib/auth";

export function AdminLogoutButton() {
  const router = useRouter();

  function handleLogout() {
    document.cookie = `${ADMIN_SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-full border border-shipin-deep/10 bg-white px-4 py-2 text-sm font-semibold text-shipin-deep hover:border-shipin-deep/20 hover:bg-[#f8fbf6]"
    >
      Logout
    </button>
  );
}
