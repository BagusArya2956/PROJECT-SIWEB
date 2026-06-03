"use client";

import { Suspense, useEffect, useState } from "react";

import { ShieldIcon, StarIcon, TruckIcon, UserIcon } from "@/components/icons";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { useAppPreferences } from "@/components/ui/app-preferences";

type ProfilePayload = {
  id: string;
  fullName: string;
  username: string;
  email: string;
  status: string;
  totalShipments: number;
  rating: number;
};

const profileCopy = {
  title: "Profil & Pengaturan",
  subtitle: "Kelola informasi akun Anda dan pastikan keamanan data logistik Anda tetap terjaga.",
  accountDetail: "Detail Akun",
  accountHint: "Informasi dasar Anda yang terdaftar di sistem.",
  fullName: "Nama Lengkap",
  username: "Username",
  usernameHint: "Username tidak dapat diubah.",
  email: "Email",
  update: "Update",
  saving: "Menyimpan...",
  security: "Keamanan",
  securityHint: "Ganti kata sandi Anda secara berkala untuk menjaga keamanan akun SHIPIN GO.",
  currentPassword: "Kata Sandi Saat Ini",
  newPassword: "Kata Sandi Baru",
  confirmPassword: "Konfirmasi Kata Sandi Baru",
  passwordHint: "Minimal 8 karakter dengan kombinasi angka",
  saveChanges: "Simpan Perubahan",
  forgotPassword: "Lupa kata sandi?"
};

function RowLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#24463a]">{children}</p>;
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggle,
  hint
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggle: () => void;
  hint?: string;
}) {
  return (
    <div>
      <RowLabel>{label}</RowLabel>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 w-full rounded-xl border border-[#e0e6df] bg-[#f2f5ef] px-4 pr-12 text-[15px] tracking-[0.2em] text-[#253a33] outline-none"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5e6d64]"
          aria-label={show ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
        >
          {show ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M3 3 21 21" />
              <path d="M10.6 10.6a2 2 0 1 0 2.8 2.8" />
              <path d="M9.9 4.2A10 10 0 0 1 12 4c7 0 10 8 10 8a15.6 15.6 0 0 1-3.2 4.5" />
              <path d="M6.2 6.2A15.8 15.8 0 0 0 2 12s3 8 10 8a9.8 9.8 0 0 0 4.2-.9" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
      {hint ? <p className="mt-1 text-[11px] text-[#98a29d]">{hint}</p> : null}
    </div>
  );
}

function LoadingFallback() {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#f2f5f1] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1540px] rounded-[28px] border border-[#e5ebe5] bg-white p-6 text-[13px] font-semibold text-[#5f6d63]">
        Memuat profil...
      </div>
    </main>
  );
}

function AdminProfilContent() {
  const { isDark } = useAppPreferences();
  const copy = profileCopy;
  const [profile, setProfile] = useState<ProfilePayload | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"error" | "success" | "info">("info");
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);

  const stats = [
    { label: "TOTAL PENGIRIMAN", value: String(profile?.totalShipments ?? 0), tone: "bg-[#d9f2d6]", icon: "truck" },
    { label: "RATING PENGIRIM", value: (profile?.rating ?? 0).toFixed(1), tone: "bg-[#e3e7df]", icon: "star" },
    { label: "STATUS AKUN", value: profile?.status || "AKTIF", tone: "bg-[#d9f2d6]", icon: "shield" }
  ];

  useEffect(() => {
    document.title = "Profil Akun | SHIPIN GO Admin";
  }, []);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const response = await fetch("/api/admin/profile", { cache: "no-store" });
        const data = (await response.json()) as { profile?: ProfilePayload; message?: string };

        if (!response.ok || !data.profile) {
          throw new Error(data.message || "Gagal memuat profil admin.");
        }

        if (!active) return;
        setProfile(data.profile);
        setFullName(data.profile.fullName);
        setEmail(data.profile.email);
      } catch (error) {
        if (!active) return;
        setMessageTone("error");
        setMessage(error instanceof Error ? error.message : "Gagal memuat profil admin.");
      }
    }

    void loadProfile();
    return () => {
      active = false;
    };
  }, []);

  async function updateEmail() {
    if (!fullName.trim()) {
      setMessageTone("error");
      setMessage("Nama lengkap tidak boleh kosong.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessageTone("error");
      setMessage("Email tidak valid.");
      return;
    }

    setIsProfileSaving(true);
    try {
      const response = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email
        })
      });
      const data = (await response.json()) as { profile?: ProfilePayload; message?: string };

      if (!response.ok || !data.profile) {
        throw new Error(data.message || "Gagal memperbarui detail akun.");
      }

      setProfile(data.profile);
      setFullName(data.profile.fullName);
      setEmail(data.profile.email);
      setMessageTone("success");
      setMessage("Detail akun berhasil diperbarui.");
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "Gagal memperbarui detail akun.");
    } finally {
      setIsProfileSaving(false);
    }
  }

  async function saveSecurity() {
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

    setIsPasswordSaving(true);
    try {
      const response = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword
        })
      });
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message || "Gagal memperbarui kata sandi.");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessageTone("success");
      setMessage(data.message || "Perubahan keamanan berhasil disimpan.");
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "Gagal memperbarui kata sandi.");
    } finally {
      setIsPasswordSaving(false);
    }
  }

  return (
    <main className={`min-h-[calc(100vh-80px)] px-4 py-5 sm:px-6 lg:px-8 ${isDark ? "bg-[#101711]" : "bg-[#f2f5f1]"}`}>
      <div className="mx-auto max-w-[1540px]">
        <section className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className={`text-[34px] font-extrabold leading-none md:text-[50px] ${isDark ? "text-[#9df28f]" : "text-[#185338]"}`}>{copy.title}</h1>
            <p className={`mt-2 text-[13px] md:text-[16px] ${isDark ? "text-[#b9c7bd]" : "text-[#445149]"}`}>
              {copy.subtitle}
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
            <article className={`rounded-[30px] border px-6 py-6 shadow-[0_8px_30px_rgba(25,45,33,0.05)] md:px-7 ${isDark ? "border-[#27352b] bg-[#172118]" : "border-[#e5ebe5] bg-white"}`}>
              <div className="flex items-center gap-4">
                <div className="relative h-[95px] w-[95px] overflow-hidden rounded-[28px] border-[3px] border-[#79de8c] bg-[#f6fbf5]">
                  {profile?.fullName ? (
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName)}&background=16a34a&color=fff&size=128&bold=true`}
                      alt={`Avatar ${profile.fullName}`}
                      className="h-full w-full rounded-[24px] object-cover"
                      width={95}
                      height={95}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-[24px] bg-white">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1b7f4c] text-white ring-2 ring-[#d5e8d8]">
                        <UserIcon className="h-[18px] w-[18px]" />
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <h2 className={`text-[23px] font-extrabold md:text-[26px] ${isDark ? "text-[#eef7ee]" : "text-[#153528]"}`}>{copy.accountDetail}</h2>
                  <p className={`text-sm ${isDark ? "text-[#b9c7bd]" : "text-[#5f6b64]"}`}>{copy.accountHint}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div>
                  <RowLabel>{copy.fullName}</RowLabel>
                  <input
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    className="h-12 w-full rounded-xl bg-[#f2f5ef] px-4 text-[16px] text-[#213730] outline-none"
                  />
                </div>
                <div>
                  <RowLabel>{copy.username}</RowLabel>
                  <div className="h-12 rounded-xl bg-[#f2f5ef] px-4 text-[15px] leading-[48px] text-[#9ca8a1]">
                    {profile?.username || "adminship1"}
                  </div>
                  <p className="mt-1 text-[11px] text-[#98a29d]">{copy.usernameHint}</p>
                </div>
              </div>

              <div className="mt-3">
                <RowLabel>{copy.email}</RowLabel>
                <div className="flex flex-wrap gap-2">
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-12 min-w-[280px] flex-1 rounded-xl bg-[#f2f5ef] px-4 text-[15px] text-[#213730] outline-none"
                  />
                  <button
                    type="button"
                    onClick={updateEmail}
                    disabled={isProfileSaving}
                    className="h-12 rounded-full bg-[#84e88c] px-7 text-[15px] font-semibold text-[#1a5a35]"
                  >
                    {isProfileSaving ? copy.saving : copy.update}
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

          <article className={`rounded-[30px] border px-6 py-6 shadow-[0_8px_30px_rgba(25,45,33,0.05)] md:px-7 ${isDark ? "border-[#27352b] bg-[#172118]" : "border-[#e5ebe5] bg-white"}`}>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fee7e5]">
                <svg viewBox="0 0 24 24" fill="none" stroke="#e26457" strokeWidth="2" className="h-4 w-4">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                </svg>
              </div>
              <h2 className={`text-[34px] font-extrabold leading-none ${isDark ? "text-[#eef7ee]" : "text-[#153528]"}`}>{copy.security}</h2>
            </div>
            <p className={`mt-3 text-[14px] leading-relaxed ${isDark ? "text-[#b9c7bd]" : "text-[#4f5c56]"}`}>
              {copy.securityHint}
            </p>

            <div className="mt-5 space-y-4">
              <PasswordField
                label={copy.currentPassword}
                value={currentPassword}
                onChange={setCurrentPassword}
                show={showCurrentPassword}
                onToggle={() => setShowCurrentPassword((prev) => !prev)}
              />

              <PasswordField
                label={copy.newPassword}
                value={newPassword}
                onChange={setNewPassword}
                show={showNewPassword}
                onToggle={() => setShowNewPassword((prev) => !prev)}
                hint={copy.passwordHint}
              />

              <PasswordField
                label={copy.confirmPassword}
                value={confirmPassword}
                onChange={setConfirmPassword}
                show={showConfirmPassword}
                onToggle={() => setShowConfirmPassword((prev) => !prev)}
              />
            </div>

            <button
              type="button"
              onClick={saveSecurity}
              disabled={isPasswordSaving}
              className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#1a7332] text-[16px] font-semibold text-white"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
                <path d="M17 21v-8H7v8" />
                <path d="M7 3v5h8" />
              </svg>
              {isPasswordSaving ? copy.saving : copy.saveChanges}
            </button>
            <button
              type="button"
              onClick={() => {
                setMessageTone("info");
                setMessage("Silakan hubungi super admin untuk reset kata sandi.");
              }}
              className="mt-4 w-full text-center text-[14px] text-[#5d6962]"
            >
              {copy.forgotPassword}
            </button>
          </article>
        </section>
      </div>
    </main>
  );
}

export default function AdminProfilPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AdminProfilContent />
    </Suspense>
  );
}
