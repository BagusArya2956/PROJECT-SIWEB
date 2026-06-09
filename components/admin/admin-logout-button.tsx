"use client";

import { useRouter } from "next/navigation";

type AdminLogoutButtonProps = {
  variant?: "text" | "icon";
};

export function AdminLogoutButton({ variant = "text" }: AdminLogoutButtonProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/session", {
      method: "DELETE"
    }).catch(() => null);
    router.push("/");
    router.refresh();
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleLogout}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d7e7db] bg-white text-[#1b7f4c] shadow-[0_8px_18px_rgba(27,127,76,0.08)] transition hover:-translate-y-0.5 hover:border-[#9bd7aa] hover:bg-[#f2fbf4]"
        aria-label="Logout admin"
        title="Logout"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-[18px] w-[18px]">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <path d="M10 17l5-5-5-5" />
          <path d="M15 12H3" />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-full border border-shipin-deep/10 bg-white px-4 py-2 text-sm font-semibold text-shipin-deep hover:border-shipin-deep/20 hover:bg-[#f8fbf6]"
    >
      Logout
    </button>
  );
}
