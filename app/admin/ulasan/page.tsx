import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminUlasanPage() {
  return (
    <AdminShell
      title="Kelola Ulasan"
      description="Tempat admin memoderasi ulasan yang tampil di landing page publik."
    >
      <section className="rounded-[30px] border border-white/80 bg-white p-6 shadow-card">
        <h2 className="text-xl font-bold text-shipin-ink">Manajemen ulasan</h2>
        <p className="mt-3 text-sm leading-7 text-shipin-text">
          Ulasan publik dapat dikelola dari area admin ini sehingga pengalaman pengguna umum tetap ringan
          tanpa harus login.
        </p>
      </section>
    </AdminShell>
  );
}
