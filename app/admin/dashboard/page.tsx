import { AdminShell } from "@/components/admin/admin-shell";

const cards = [
  { label: "Pengiriman Aktif", value: "126", detail: "18 kiriman sedang diproses hari ini." },
  { label: "Paket Selesai", value: "1.240", detail: "Naik 12% dibanding minggu lalu." },
  { label: "Partner Kurir", value: "50+", detail: "Tersinkron dengan data operasional." }
];

export default function AdminDashboardPage() {
  return (
    <AdminShell
      title="Dashboard"
      description="Ringkasan operasional admin SHIPIN GO setelah login berhasil."
    >
      <section className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <article key={card.label} className="rounded-[28px] border border-white/80 bg-white p-6 shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-shipin-deep/70">
              {card.label}
            </p>
            <p className="mt-4 text-4xl font-extrabold text-shipin-ink">{card.value}</p>
            <p className="mt-3 text-sm leading-7 text-shipin-text">{card.detail}</p>
          </article>
        ))}
      </section>
      <section className="rounded-[30px] border border-white/80 bg-white p-6 shadow-card">
        <h2 className="text-xl font-bold text-shipin-ink">Alur yang sudah dipisahkan dengan jelas</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-shipin-text">
          Landing page publik tetap menjadi pintu masuk utama di route <code>/</code>, sedangkan login
          dan register dipakai khusus untuk akses admin. Setelah admin berhasil masuk, pengguna diarahkan
          ke dashboard ini dan seluruh fitur operasional tersedia di bawah prefix <code>/admin</code>.
        </p>
      </section>
    </AdminShell>
  );
}
