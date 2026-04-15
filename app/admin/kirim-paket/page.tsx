import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminKirimPaketPage() {
  return (
    <AdminShell
      title="Kirim Paket"
      description="Halaman admin untuk membuat dan mengelola pengiriman baru."
    >
      <section className="rounded-[30px] border border-white/80 bg-white p-6 shadow-card">
        <h2 className="text-xl font-bold text-shipin-ink">Form pengiriman admin</h2>
        <p className="mt-3 text-sm leading-7 text-shipin-text">
          Area ini disiapkan sebagai halaman internal admin untuk input data pengiriman, pilihan kurir,
          dan instruksi operasional lainnya.
        </p>
      </section>
    </AdminShell>
  );
}
