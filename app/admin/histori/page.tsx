import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminHistoriPage() {
  return (
    <AdminShell
      title="Histori Paket"
      description="Riwayat pengiriman admin yang terpisah dari pengalaman pengguna umum."
    >
      <section className="rounded-[30px] border border-white/80 bg-white p-6 shadow-card">
        <h2 className="text-xl font-bold text-shipin-ink">Histori pengiriman</h2>
        <p className="mt-3 text-sm leading-7 text-shipin-text">
          Tabel histori bisa dihubungkan ke backend nanti tanpa mencampurkan tampilan publik dengan
          dashboard internal admin.
        </p>
      </section>
    </AdminShell>
  );
}
