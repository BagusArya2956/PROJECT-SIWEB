"use client";
import { useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminKirimPaketPage() {
  const [selectedService, setSelectedService] = useState<"reguler" | "ekspres">("reguler");

  return (
    <AdminShell
      title="Buat Pengiriman Baru"
      description="Lengkapi detail pengiriman Anda. Sistem kami akan menghitung biaya terbaik untuk logistik UMKM Anda secara otomatis."
    >
      <div className="grid grid-cols-[1fr_300px] gap-5 items-start">
        {/* Form column */}
        <div className="flex flex-col gap-4">

          {/* 1 - Data Pengirim */}
          <SectionCard num={1} title="Data Pengirim">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Field label="Nama Lengkap"><input type="text" placeholder="Contoh: Budi Santoso" className={inputCls} /></Field>
              <Field label="Nomor Telepon"><input type="tel" placeholder="0812xxxx" className={inputCls} /></Field>
            </div>
            <Field label="Alamat Penjemputan">
              <textarea placeholder="Masukkan alamat lengkap penjemputan paket..." className={`${inputCls} h-20 resize-none`} />
            </Field>
          </SectionCard>

          {/* 2 - Data Penerima */}
          <SectionCard num={2} title="Data Penerima">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Field label="Nama Penerima"><input type="text" placeholder="Contoh: Siti Aminah" className={inputCls} /></Field>
              <Field label="Nomor Telepon"><input type="tel" placeholder="0857xxxx" className={inputCls} /></Field>
            </div>
            <Field label="Alamat Tujuan">
              <textarea placeholder="Masukkan alamat lengkap tujuan pengiriman..." className={`${inputCls} h-20 resize-none`} />
            </Field>
          </SectionCard>

          {/* 3 - Detail Paket */}
          <SectionCard num={3} title="Detail Paket">
            <div className="grid grid-cols-2 gap-3 mb-5">
              <Field label="Berat (kg)">
                <div className="relative">
                  <input type="number" defaultValue="2" className={`${inputCls} pr-10`} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-shipin-muted font-semibold">kg</span>
                </div>
              </Field>
              <Field label="Dimensi (PxLxT cm)">
                <div className="grid grid-cols-3 gap-2">
                  {["P", "L", "T"].map((d) => (
                    <input key={d} type="number" placeholder={d} className={inputCls} />
                  ))}
                </div>
              </Field>
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-shipin-muted mb-3">
              Pilih Jenis Layanan
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "reguler", name: "Reguler (2–3 Hari)", badge: "EKONOMIS", desc: "Keseimbangan antara harga & kecepatan" },
                { id: "ekspres", name: "Ekspres (Besok Sampai)", badge: null, desc: "Prioritas utama untuk paket mendesak" },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedService(s.id as "reguler" | "ekspres")}
                  className={`text-left rounded-2xl border-2 p-4 transition-all ${
                    selectedService === s.id
                      ? "border-shipin-green bg-green-50"
                      : "border-shipin-border bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-shipin-ink">{s.name}</span>
                    {s.badge && (
                      <span className="text-[10px] font-bold bg-shipin-green text-white px-2 py-0.5 rounded">
                        {s.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-shipin-muted">{s.desc}</p>
                </button>
              ))}
            </div>
          </SectionCard>

          {/* Draft bar */}
          <div className="rounded-[20px] bg-white border border-white/80 shadow-card px-6 py-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-shipin-ink">Simpan Draft Pengiriman</p>
              <p className="text-xs text-shipin-muted mt-0.5">Belum siap mengirim sekarang? Simpan data Anda dan lanjutkan nanti.</p>
            </div>
            <div className="flex gap-2 shrink-0 ml-4">
              <button className="h-9 px-5 rounded-xl border border-shipin-border text-sm text-shipin-muted bg-white">Batal</button>
              <button className="h-9 px-5 rounded-xl bg-shipin-green text-white text-sm font-semibold">Simpan Draft</button>
            </div>
          </div>

          {/* Alur Cetak Resi */}
          <div className="rounded-[20px] bg-white border border-white/80 shadow-card px-6 py-8 text-center">
            <div className="w-12 h-12 bg-shipin-green rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
            </div>
            <h3 className="text-base font-bold text-shipin-ink mb-2">Alur Cetak Resi</h3>
            <p className="text-sm text-shipin-muted leading-relaxed max-w-sm mx-auto mb-3">
              Setelah pembayaran dikonfirmasi, sistem akan otomatis menerbitkan ID Resi{" "}
              <span className="font-bold text-shipin-green">SPG-2024-XXXX</span>. Anda dapat mencetak label pengiriman secara langsung atau dari menu Histori.
            </p>
            <a href="#" className="text-sm font-semibold text-shipin-green">Lihat Panduan Cetak Resi →</a>
          </div>
        </div>

        {/* Sticky sidebar */}
        <div className="sticky top-20">
          <div className="rounded-[20px] bg-green-50 border border-green-200 p-5">
            <h3 className="text-base font-bold text-shipin-ink mb-4">Ringkasan Biaya</h3>
            <div className="flex justify-between text-sm text-shipin-muted mb-2">
              <span>Biaya Pengiriman (2kg)</span><span>Rp 34.000</span>
            </div>
            <div className="flex justify-between text-sm text-shipin-muted mb-3">
              <span>Biaya Layanan</span><span>Rp 1.500</span>
            </div>
            <hr className="border-green-200 mb-3" />
            <div className="flex justify-between items-end mb-4">
              <span className="text-sm font-semibold text-shipin-ink">Total Pembayaran</span>
              <span className="text-2xl font-black text-shipin-ink">Rp 35.500</span>
            </div>

            <div className="bg-white rounded-2xl p-4 mb-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-shipin-muted mb-3">
                Metode Pembayaran: QRIS
              </p>
              <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-center mb-2">
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-[10px] text-gray-400 font-bold text-center leading-tight">
                  DUMMY<br />QR CODE
                </div>
              </div>
              <p className="text-[11px] text-shipin-muted text-center leading-relaxed">
                Pindai QR di atas menggunakan aplikasi pembayaran atau dompet digital.
              </p>
            </div>

            <button className="w-full h-12 bg-[#1a5c2a] text-white rounded-xl font-bold text-sm mb-3">
              Konfirmasi & Bayar
            </button>
            <div className="flex items-start gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a7a3c" strokeWidth="2" className="shrink-0 mt-0.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <polyline points="9 12 11 14 15 10"/>
              </svg>
              <p className="text-[11px] text-shipin-muted leading-relaxed">
                Pembayaran aman dengan enkripsi SSL 256-bit dan protokol otentikasi pengiriman.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

const inputCls = "w-full border border-shipin-border rounded-xl px-3 py-2.5 text-sm text-shipin-ink placeholder:text-shipin-muted focus:outline-none bg-white";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold uppercase tracking-widest text-shipin-muted">{label}</label>
      {children}
    </div>
  );
}

function SectionCard({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[20px] bg-white border border-white/80 shadow-card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-7 h-7 rounded-full bg-shipin-green text-white text-sm font-bold flex items-center justify-center shrink-0">
          {num}
        </div>
        <h2 className="text-base font-bold text-shipin-ink">{title}</h2>
      </div>
      {children}
    </div>
  );
}