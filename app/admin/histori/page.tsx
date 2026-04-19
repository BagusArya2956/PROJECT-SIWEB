import { AdminShell } from "@/components/admin/admin-shell";

const shipments = [
  {
    id: "#SPG-99281-ID",
    type: "EXPRESS TRUCK",
    sender: "Budi Santoso",
    receiver: "ke Siti Aminah",
    from: "Jakarta",
    to: "Surabaya",
    date: "12 Okt 2023",
    payStatus: "LUNAS",
    shipStatus: "DALAM PERJALANAN",
    total: "Rp 1.450.000",
  },
  {
    id: "#SPG-88172-ID",
    type: "STANDARD WINGBOX",
    sender: "UD Maju Jaya",
    receiver: "ke PT Logistik",
    from: "Bandung",
    to: "Medan",
    date: "10 Okt 2023",
    payStatus: "BELUM BAYAR",
    shipStatus: "DIJADWALKAN",
    total: "Rp 5.200.000",
  },
  {
    id: "#SPG-77610-ID",
    type: "CDE BOX",
    sender: "Toko Elektronik",
    receiver: "ke Andi Wijaya",
    from: "Semarang",
    to: "DIY",
    date: "08 Okt 2023",
    payStatus: "LUNAS",
    shipStatus: "SAMPAI",
    total: "Rp 850.000",
  },
];

const payBadge: Record<string, string> = {
  LUNAS: "bg-green-100 text-green-800",
  "BELUM BAYAR": "bg-orange-100 text-orange-700",
};

const shipBadge: Record<string, string> = {
  "DALAM PERJALANAN": "bg-green-100 text-green-800",
  DIJADWALKAN: "bg-yellow-100 text-yellow-800",
  SAMPAI: "bg-green-100 text-green-800",
};

export default function AdminHistoriPage() {
  return (
    <AdminShell
      title="Histori Paket"
      description="Kelola dan pantau semua pengiriman armada Anda dengan sistem pelacakan real-time yang akurat."
    >
      {/* Search & date filter */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <input
            className="w-full h-11 rounded-xl border border-shipin-border pl-10 pr-4 text-sm placeholder:text-shipin-muted focus:outline-none focus:ring-2 focus:ring-shipin-green/30"
            placeholder="Cari No. Resi, Pengirim, atau Kota Tujuan..."
          />
        </div>
        <div className="flex items-center rounded-xl border border-green-200 bg-green-50 overflow-hidden text-sm font-medium text-green-700">
          <span className="px-4 py-2.5">Rentang Waktu</span>
          <span className="bg-green-100 px-3 py-2.5">Bulan Ini 📅</span>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-2">
          {["Semua Tujuan", "Status Bayar", "Status Kirim"].map((f) => (
            <button key={f} className="h-9 px-4 rounded-full border border-shipin-border bg-white text-sm text-shipin-ink">
              {f}
            </button>
          ))}
        </div>
        <button className="text-sm text-shipin-green">Reset Filter ✕</button>
      </div>

      {/* Table */}
      <div className="rounded-[20px] border border-white/80 bg-white shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-shipin-border">
              {["No. Resi", "Pihak Terlibat", "Tujuan", "Tanggal", "Status", "Total", "Aksi"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-shipin-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shipments.map((s) => (
              <tr key={s.id} className="border-b border-shipin-border/50 last:border-0">
                <td className="px-4 py-4">
                  <span className="font-bold text-shipin-green">{s.id}</span>
                  <span className="block text-[11px] text-shipin-muted mt-0.5">{s.type}</span>
                </td>
                <td className="px-4 py-4">
                  <span className="font-semibold text-shipin-ink">{s.sender}</span>
                  <span className="block text-xs text-shipin-muted mt-0.5">{s.receiver}</span>
                </td>
                <td className="px-4 py-4 text-shipin-ink">
                  {s.from} · {s.to}
                </td>
                <td className="px-4 py-4 text-shipin-ink">{s.date}</td>
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-1">
                    <span className={`inline-block rounded px-2 py-0.5 text-[11px] font-bold ${payBadge[s.payStatus]}`}>{s.payStatus}</span>
                    <span className={`inline-block rounded px-2 py-0.5 text-[11px] font-bold ${shipBadge[s.shipStatus]}`}>{s.shipStatus}</span>
                  </div>
                </td>
                <td className="px-4 py-4 font-bold text-shipin-ink">{s.total}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <button className="w-8 h-8 flex items-center justify-center rounded-md border border-shipin-border bg-white hover:bg-shipin-bg">👁</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-md border border-shipin-border bg-white hover:bg-shipin-bg">🖨</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-full bg-shipin-green text-white">›</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end gap-2 py-5">
        {["‹", "1", "2", "3", "›"].map((p, i) => (
          <button key={i} className={`w-9 h-9 rounded-full border text-sm flex items-center justify-center ${p === "1" ? "bg-shipin-green text-white border-shipin-green font-semibold" : "border-shipin-border bg-white text-shipin-ink"}`}>
            {p}
          </button>
        ))}
      </div>
    </AdminShell>
  );
}