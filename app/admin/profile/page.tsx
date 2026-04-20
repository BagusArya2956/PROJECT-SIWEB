"use client";

import { useState } from "react";

import { ShieldIcon, StarIcon, TruckIcon, UserIcon } from "@/components/icons";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";

const stats = [
  { label: "TOTAL PENGIRIMAN", value: "124", tone: "bg-[#d9f2d6]", icon: "truck" },
  { label: "RATING PENGIRIM", value: "4.9", tone: "bg-[#e3e7df]", icon: "star" },
  { label: "STATUS AKUN", value: "Aktif", tone: "bg-[#d9f2d6]", icon: "shield" }
];

function RowLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#24463a]">{children}</p>;
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-[#57645e]">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 text-[#59665f]">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.8 12h16.4" />
      <path d="M12 3.5c2.4 2.2 3.8 5.2 3.8 8.5S14.4 18.3 12 20.5c-2.4-2.2-3.8-5.2-3.8-8.5S9.6 5.7 12 3.5Z" />
    </svg>
  );
}

export default function AdminProfilPage() {
  const [fullName, setFullName] = useState("Bagus Arya");
  const [email, setEmail] = useState("bagus.santoso@email.com");
  const [currentPassword, setCurrentPassword] = useState("password");
  const [newPassword, setNewPassword] = useState("password");
  const [confirmPassword, setConfirmPassword] = useState("password");
  const [language, setLanguage] = useState("Bahasa Indonesia (Default)");
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"error" | "success" | "info">("info");

  function updateEmail() {
    if (!email.trim() || !email.includes("@")) {
      setMessageTone("error");
      setMessage("Email tidak valid.");
      return;
    }
    setMessageTone("success");
    setMessage("Email berhasil diperbarui.");
  }

  function saveSecurity() {
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setMessageTone("error");
      setMessage("Lengkapi semua kolom kata sandi.");
      return;
    }
    if (newPassword.length < 8) {
      setMessageTone("error");
      setMessage("Kata sandi baru minimal 8 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessageTone("error");
      setMessage("Konfirmasi kata sandi tidak cocok.");
      return;
    }
    setMessageTone("success");
    setMessage("Perubahan keamanan berhasil disimpan.");
  }

  function changeLanguage() {
    const next =
      language === "Bahasa Indonesia (Default)" ? "English (Default)" : "Bahasa Indonesia (Default)";
    setLanguage(next);
    setMessageTone("info");
    setMessage(`Bahasa diubah ke ${next}.`);
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#f2f5f1] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1540px]">
        <section className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-[34px] font-extrabold leading-none text-[#185338] md:text-[50px]">Profil & Pengaturan</h1>
            <p className="mt-2 text-[13px] text-[#445149] md:text-[16px]">
              Kelola informasi akun Anda dan pastikan keamanan data logistik Anda tetap terjaga.
            </p>
          </div>
          <AdminLogoutButton />
        </section>

        {message ? (
          <p
            className={`mt-3 rounded-lg px-3 py-2 text-[12px] font-semibold ${
              messageTone === "error"
                ? "bg-[#fde9e7] text-[#b9473f]"
                : messageTone === "success"
                  ? "bg-[#eaf8ee] text-[#1f7a44]"
                  : "bg-[#f2f5ef] text-[#5c6c62]"
            }`}
          >
            {message}
          </p>
        ) : null}

        <section className="mt-7 grid gap-5 lg:grid-cols-[1.55fr_1fr]">
          <div className="space-y-4">
            <article className="rounded-[30px] border border-[#e5ebe5] bg-white px-6 py-6 shadow-[0_8px_30px_rgba(25,45,33,0.05)] md:px-7">
              <div className="flex items-center gap-4">
                <div className="relative h-[95px] w-[95px] rounded-[28px] border-[3px] border-[#79de8c] bg-[#f6fbf5]">
                  <div className="flex h-full w-full items-center justify-center rounded-[24px] bg-white">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1b7f4c] text-white ring-2 ring-[#d5e8d8]">
                      <UserIcon className="h-[18px] w-[18px]" />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMessageTone("info");
                      setMessage("Fitur ubah foto profil akan diaktifkan pada integrasi media.");
                    }}
                    className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#1f8f55] text-white shadow-sm"
                    aria-label="Edit foto profil"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                      <path d="M12 20h9" />
                      <path d="m16.5 3.5 4 4L7 21H3v-4L16.5 3.5Z" />
                    </svg>
                  </button>
                </div>
                <div>
                  <h2 className="text-[23px] font-extrabold text-[#153528] md:text-[26px]">Detail Akun</h2>
                  <p className="text-sm text-[#5f6b64]">Informasi dasar Anda yang terdaftar di sistem.</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div>
                  <RowLabel>Nama Lengkap</RowLabel>
                  <input
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    className="h-12 w-full rounded-xl bg-[#f2f5ef] px-4 text-[16px] text-[#213730] outline-none"
                  />
                </div>
                <div>
                  <RowLabel>Username</RowLabel>
                  <div className="h-12 rounded-xl bg-[#f2f5ef] px-4 text-[15px] leading-[48px] text-[#9ca8a1]">
                    adminship1
                  </div>
                  <p className="mt-1 text-[11px] text-[#98a29d]">Username tidak dapat diubah.</p>
                </div>
              </div>

              <div className="mt-3">
                <RowLabel>Email</RowLabel>
                <div className="flex flex-wrap gap-2">
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-12 min-w-[280px] flex-1 rounded-xl bg-[#f2f5ef] px-4 text-[15px] text-[#213730] outline-none"
                  />
                  <button
                    type="button"
                    onClick={updateEmail}
                    className="h-12 rounded-full bg-[#84e88c] px-7 text-[15px] font-semibold text-[#1a5a35]"
                  >
                    Update
                  </button>
                </div>
              </div>
            </article>

            <div className="grid gap-3 sm:grid-cols-3">
              {stats.map((item) => (
                <article key={item.label} className={`${item.tone} rounded-[24px] px-5 py-4`}>
                  <div className="mb-2">
                    {item.icon === "truck" && <TruckIcon className="h-6 w-6 text-[#1d7a43]" />}
                    {item.icon === "star" && (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#5f665f]">
                        <StarIcon className="h-3.5 w-3.5 text-[#5f665f]" />
                      </span>
                    )}
                    {item.icon === "shield" && <ShieldIcon className="h-6 w-6 text-[#0e7d3f]" />}
                  </div>
                  <p className="text-[42px] font-black leading-none text-[#185338]">{item.value}</p>
                  <p className="mt-1 text-[12px] font-bold tracking-wide text-[#29443b]">{item.label}</p>
                </article>
              ))}
            </div>
          </div>

          <article className="rounded-[30px] border border-[#e5ebe5] bg-white px-6 py-6 shadow-[0_8px_30px_rgba(25,45,33,0.05)] md:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fee7e5]">
                <svg viewBox="0 0 24 24" fill="none" stroke="#e26457" strokeWidth="2" className="h-4 w-4">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                </svg>
              </div>
              <h2 className="text-[34px] font-extrabold leading-none text-[#153528]">Keamanan</h2>
            </div>
            <p className="mt-3 text-[14px] leading-relaxed text-[#4f5c56]">
              Ganti kata sandi Anda secara berkala untuk menjaga keamanan akun SHIPIN GO.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <RowLabel>Kata Sandi Saat Ini</RowLabel>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  className="h-12 w-full rounded-xl border border-[#e0e6df] bg-[#f2f5ef] px-4 text-[15px] tracking-[0.2em] text-[#253a33] outline-none"
                />
              </div>

              <div>
                <RowLabel>Kata Sandi Baru</RowLabel>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="h-12 w-full rounded-xl border border-[#e0e6df] bg-[#f2f5ef] px-4 text-[15px] tracking-[0.2em] text-[#253a33] outline-none"
                />
                <p className="mt-1 text-[11px] text-[#98a29d]">Minimal 8 karakter dengan kombinasi angka</p>
              </div>

              <div>
                <RowLabel>Konfirmasi Kata Sandi Baru</RowLabel>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="h-12 w-full rounded-xl border border-[#e0e6df] bg-[#f2f5ef] px-4 text-[15px] tracking-[0.2em] text-[#253a33] outline-none"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={saveSecurity}
              className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#1a7332] text-[16px] font-semibold text-white"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
                <path d="M17 21v-8H7v8" />
                <path d="M7 3v5h8" />
              </svg>
              Simpan Perubahan
            </button>
            <button
              type="button"
              onClick={() => {
                setMessageTone("info");
                setMessage("Silakan hubungi super admin untuk reset kata sandi.");
              }}
              className="mt-4 w-full text-center text-[14px] text-[#5d6962]"
            >
              Lupa kata sandi?
            </button>
          </article>
        </section>

        <section className="mt-2">
          <article
            className="flex max-w-[620px] items-center justify-between rounded-[24px] border border-[#e5ebe5] bg-[#f5f8f2] px-5 py-4"
          >
            <button type="button" onClick={changeLanguage} className="flex items-center gap-3 text-left">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ecf0ea]">
                <GlobeIcon />
              </div>
              <div>
                <p className="text-[18px] font-semibold leading-none text-[#253a33]">Pengaturan Bahasa</p>
                <p className="mt-1 text-[12px] text-[#65726b]">{language}</p>
              </div>
            </button>
            <ChevronRight />
          </article>
        </section>
      </div>
    </main>
  );
}
