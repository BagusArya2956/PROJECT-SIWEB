import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminProfilPage() {
  return (
    <AdminShell
      title="Profil & Pengaturan"
      description="Kelola informasi akun Anda dan pastikan keamanan data logistik Anda tetap terjaga."
    >
      <div className="grid grid-cols-2 gap-5 mb-5">
        {/* Kolom kiri */}
        <div className="flex flex-col gap-4">
          {/* Detail Akun */}
          <div className="rounded-[20px] border border-white/80 bg-white p-6 shadow-card">
            {/* Header: Avatar + Title */}
            <div className="flex items-center gap-4 mb-5">
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-2xl border-2 border-shipin-green flex items-center justify-center bg-gray-100">
                  <svg viewBox="0 0 24 24" fill="#bbb" width="36" height="36">
                    <circle cx="12" cy="8" r="5" />
                    <path d="M3 21c0-5 4-9 9-9s9 4 9 9" />
                  </svg>
                </div>
                <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-shipin-green flex items-center justify-center">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-bold text-shipin-ink">Detail Akun</h2>
                <p className="text-xs text-shipin-muted">Informasi dasar Anda yang terdaftar di sistem.</p>
              </div>
            </div>

            {/* Form fields */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-[10px] font-bold tracking-widest uppercase text-shipin-muted">
                  Nama Lengkap
                </label>
                <div className="relative mt-1">
                  <input
                    defaultValue="Jovan"
                    className="w-full h-10 border border-shipin-border rounded-xl px-3 pr-9 text-sm text-shipin-ink focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-shipin-green text-sm">✓</span>
                </div>
              </div>
              
              <div>
                <label className="text-[10px] font-bold tracking-widest uppercase text-shipin-muted">
                  Username
                </label>
                <input
                  defaultValue=""
                  placeholder="Masukkan username..."
                  className="mt-1 w-full h-10 border border-shipin-border rounded-xl px-3 text-sm text-shipin-ink focus:outline-none bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold tracking-widest uppercase text-shipin-muted">
                Email
              </label>
              <div className="flex gap-2 mt-1">
                <input
                  defaultValue="jovan@gmail.com"
                  className="flex-1 h-10 border border-shipin-border rounded-xl px-3 text-sm text-shipin-ink focus:outline-none"
                />
                <button className="h-10 px-5 bg-shipin-green text-white rounded-xl text-sm font-semibold">
                  Update
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total Pengiriman", value: "124", color: "bg-green-50" },
              { label: "Rating Pengirim", value: "4.9", color: "bg-gray-100" },
              { label: "Status Akun", value: "Aktif", color: "bg-green-50" },
            ].map((s) => (
              <div key={s.label} className={`${s.color} rounded-2xl p-4`}>
                <div className="text-3xl font-extrabold text-shipin-green leading-none">{s.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-wide text-shipin-muted mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Keamanan */}
        <div className="rounded-[20px] border border-white/80 bg-white p-6 shadow-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e05050" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-shipin-ink">Keamanan</h2>
          </div>
          <p className="text-xs text-shipin-muted mb-5 leading-relaxed">
            Ganti kata sandi Anda secara berkala untuk menjaga keamanan akun SHIPIN GO.
          </p>

          <div className="flex flex-col gap-4">
            {[
              { label: "Kata Sandi Saat Ini", hint: null },
              { label: "Kata Sandi Baru", hint: "Minimal 8 karakter dengan kombinasi angka" },
              { label: "Konfirmasi Kata Sandi Baru", hint: null },
            ].map((f) => (
              <div key={f.label}>
                <label className="text-[10px] font-bold tracking-widest uppercase text-shipin-muted">
                  {f.label}
                </label>
                <input
                  type="password"
                  defaultValue="password"
                  className="mt-1 w-full h-11 border border-shipin-border rounded-xl px-3 bg-shipin-bg text-sm focus:outline-none tracking-widest"
                />
                {f.hint && <p className="text-[11px] text-shipin-muted mt-1">{f.hint}</p>}
              </div>
            ))}

            <button className="w-full h-12 bg-[#1a5c2a] text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 mt-1">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Simpan Perubahan
            </button>
            <p className="text-center text-sm text-shipin-ink cursor-pointer">Lupa kata sandi?</p>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { title: "Pengaturan Bahasa", sub: "Bahasa Indonesia (Default)", icon: "🌐" },
          { title: "Preferensi Notifikasi", sub: "Email dan Push Notifikasi aktif", icon: "🔔" },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-white/80 bg-white p-4 flex items-center justify-between cursor-pointer shadow-card"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-shipin-bg rounded-xl flex items-center justify-center text-base">
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-shipin-ink">{item.title}</p>
                <p className="text-xs text-shipin-muted">{item.sub}</p>
              </div>
            </div>
            <span className="text-shipin-muted text-lg">›</span>
          </div>
        ))}
      </div>
    </AdminShell>
  );}