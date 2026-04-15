import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export function AdminShell({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#f4f8f3] p-4 sm:p-5 lg:p-6">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[260px_1fr]">
        <AdminSidebar />
        <div className="space-y-4">
          <header className="flex flex-col gap-4 rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-card sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-shipin-deep/70">
                Admin Panel
              </p>
              <h1 className="mt-2 text-3xl font-extrabold text-shipin-ink">{title}</h1>
              <p className="mt-2 text-sm leading-7 text-shipin-text">{description}</p>
            </div>
            <AdminLogoutButton />
          </header>
          {children}
        </div>
      </div>
    </main>
  );
}
