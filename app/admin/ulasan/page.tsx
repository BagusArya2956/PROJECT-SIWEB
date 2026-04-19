import { AdminShell } from "@/components/admin/admin-shell";

const reviews = [
  {
    initials: "AN",
    name: "Adi Nugroho",
    badge: "TAMPILKAN",
    badgeColor: "bg-green-100 text-green-800",
    stars: 5,
    text: "\"Pengiriman sangat cepat dan kurirnya ramah banget. Paket sampai dalam kondisi sempurna tanpa lecet sedikitpun. Pasti langganan terus!\"",
    meta: "12 Okt 2023 • ID Transaksi: SHIP-9902",
    avatarBg: "bg-green-100 text-green-800",
    pinned: false,
  },
  {
    initials: "SP",
    name: "Siska Putri",
    badge: "SEMBUNYIKAN",
    badgeColor: "bg-gray-100 text-gray-600",
    stars: 3,
    text: "\"Sedikit kecewa karena estimasi waktu meleset 2 jam, tapi barang masih aman. Mohon ditingkatkan lagi akurasi pelacakannya.\"",
    meta: "10 Okt 2023 • ID Transaksi: SHIP-9881",
    avatarBg: "bg-pink-200 text-pink-800",
    pinned: false,
  },
  {
    initials: "BW",
    name: "Budi Wijaya",
    badge: "TAMPILKAN",
    badgeColor: "bg-green-100 text-green-800",
    stars: 5,
    text: "\"Harga paling kompetitif untuk kiriman logistik antar kota. Dashboard-nya sangat membantu UMKM seperti saya.\"",
    meta: "08 Okt 2023 • ID Transaksi: SHIP-9870",
    avatarBg: "bg-blue-100 text-blue-800",
    pinned: true,
  },
];

const bars = [
  { star: 5, pct: 85 },
  { star: 4, pct: 10 },
  { star: 3, pct: 3 },
  { star: 2, pct: 1 },
  { star: 1, pct: 1 },
];

export default function AdminUlasanPage() {
  return (
    <AdminShell
      title=""
      description=""
    >
      {/* Hero banner */}
      <div className="rounded-[24px] bg-gradient-to-br from-green-300 to-green-200 px-10 py-9 mb-6">
        <h1 className="text-4xl font-extrabold italic text-green-900 mb-2">
          Kelola Ulasan Pelanggan
        </h1>
        <p className="text-sm text-green-800">
          Moderasi suara pelanggan Anda untuk menjaga kualitas layanan SHIPIN GO.
        </p>
      </div>

      <div className="grid grid-cols-[260px_1fr] gap-5">
        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Rating summary */}
          <div className="rounded-[20px] bg-white border border-white/80 shadow-card p-5">
            <p className="text-sm font-bold text-shipin-ink mb-4">Ringkasan Rating</p>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-5xl font-black text-shipin-ink leading-none">4.8</span>
              <div>
                <div className="flex gap-0.5 text-amber-400 text-base">★★★★☆</div>
                <p className="text-xs text-shipin-muted mt-1">Dari 1,248 Ulasan</p>
              </div>
            </div>
            {bars.map((b) => (
              <div key={b.star} className="flex items-center gap-2 mb-1.5">
                <span className="text-xs text-shipin-muted w-2">{b.star}</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-shipin-green rounded-full"
                    style={{ width: `${b.pct}%` }}
                  />
                </div>
                <span className="text-xs text-shipin-muted w-7 text-right">{b.pct}%</span>
              </div>
            ))}
          </div>

          {/* Help card */}
          <div className="rounded-[20px] bg-[#1a5c2a] p-5">
            <p className="text-sm font-bold text-white mb-2">Butuh Bantuan?</p>
            <p className="text-xs text-green-300 leading-relaxed mb-4">
              Tim moderasi kami siap membantu Anda menyaring ulasan yang melanggar aturan.
            </p>
            <button className="w-full h-10 bg-[#2d8c4e] text-white rounded-full text-sm font-semibold">
              Hubungi Support
            </button>
          </div>
        </div>

        {/* Reviews */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-shipin-ink">Ulasan Terbaru</h2>
            <div className="flex gap-2">
              <button className="h-9 px-5 rounded-full bg-shipin-ink text-white text-sm font-medium">
                Semua
              </button>
              <button className="h-9 px-5 rounded-full border border-shipin-border bg-white text-sm text-shipin-muted">
                Belum Dimoderasi
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {reviews.map((r) => (
              <div
                key={r.name}
                className="rounded-2xl bg-white border border-white/80 shadow-card p-5"
              >
                <div className="flex gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${r.avatarBg}`}
                  >
                    {r.initials}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-bold text-shipin-ink">{r.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${r.badgeColor}`}>
                        {r.badge}
                      </span>
                      {r.pinned && <span className="text-red-500 text-sm">📌</span>}
                    </div>
                    <div className="flex gap-0.5 text-amber-400 text-xs mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < r.stars ? "text-amber-400" : "text-gray-200"}>
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-shipin-ink leading-relaxed mb-2">{r.text}</p>
                    <p className="text-xs text-shipin-muted">{r.meta}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-6">
            <button className="h-11 px-8 rounded-full border-2 border-shipin-green text-shipin-green text-sm font-medium">
              Lihat Lebih Banyak ∨
            </button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}