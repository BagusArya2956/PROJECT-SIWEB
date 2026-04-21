"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const TEMP_ADMIN_CREDENTIAL_KEY = "shipin_temp_admin_credential_v1";

export default function LupaPasswordPage() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"error" | "success">("success");
  const [toastInfo, setToastInfo] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setToastInfo("");

    if (!login.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setTone("error");
      setMessage("Lengkapi semua kolom terlebih dahulu.");
      return;
    }
    if (newPassword.length < 8) {
      setTone("error");
      setMessage("Password baru minimal 8 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setTone("error");
      setMessage("Konfirmasi password tidak cocok.");
      return;
    }

    const raw = window.localStorage.getItem(TEMP_ADMIN_CREDENTIAL_KEY);
    if (!raw) {
      setTone("error");
      setMessage("Akun sementara belum terdaftar di perangkat ini. Silakan daftar dulu.");
      return;
    }

    try {
      const parsed = JSON.parse(raw) as { login: string; password: string; name: string };
      if (parsed.login !== login.trim().toLowerCase()) {
        setTone("error");
        setMessage("Email atau username tidak cocok dengan akun sementara.");
        return;
      }

      setTone("success");
      setMessage("");
      setToastInfo("Info: Password berhasil diubah.");
      window.setTimeout(() => {
        setToastInfo("");
        router.push("/login");
      }, 1400);
    } catch {
      setTone("error");
      setMessage("Data akun sementara tidak valid. Silakan daftar ulang.");
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,_rgba(175,244,170,0.22),transparent_42%),#f3f7f1] px-4">
      {toastInfo ? (
        <div className="fixed right-5 top-5 z-50 flex items-center gap-2 rounded-xl border border-[#cbe8d1] bg-white px-4 py-3 text-[13px] font-semibold text-[#1f7a44] shadow-[0_14px_32px_rgba(69,117,80,0.22)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8h.01" />
            <path d="M11 12h1v4h1" />
          </svg>
          <span>{toastInfo}</span>
        </div>
      ) : null}
      <div className="w-full max-w-[520px] rounded-[28px] border border-[#e3eadf] bg-white p-6 shadow-[0_24px_60px_rgba(95,128,101,0.22)] sm:p-7">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#5f7c68]">Admin Recovery</p>
        <h1 className="mt-2 text-[32px] font-extrabold leading-none text-[#1f3427] sm:text-[38px]">
          Lupa Password
        </h1>
        <p className="mt-3 text-[14px] leading-7 text-[#59655d]">
          Atur ulang password akun sementara di perangkat ini.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#2f4a3a]">
              Email atau Username
            </label>
            <input
              type="text"
              value={login}
              onChange={(event) => setLogin(event.target.value)}
              placeholder="admin@email.com"
              className="h-11 w-full rounded-xl border border-[#dde4db] bg-[#fbfdf9] px-4 text-[14px] text-[#213730] outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#2f4a3a]">
              Password Baru
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Minimal 8 karakter"
              className="h-11 w-full rounded-xl border border-[#dde4db] bg-[#fbfdf9] px-4 text-[14px] text-[#213730] outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#2f4a3a]">
              Konfirmasi Password Baru
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Ulangi password baru"
              className="h-11 w-full rounded-xl border border-[#dde4db] bg-[#fbfdf9] px-4 text-[14px] text-[#213730] outline-none"
            />
          </div>

          <button
            type="submit"
            className="mt-1 inline-flex h-11 w-full items-center justify-center rounded-full bg-[#1a7332] px-7 text-[14px] font-semibold text-white"
          >
            Simpan Password Baru
          </button>
        </form>

        {message ? (
          <p
            className={`mt-3 text-[13px] font-medium ${tone === "success" ? "text-[#1f7a44]" : "text-[#b42318]"}`}
          >
            {message}
          </p>
        ) : null}

        <p className="mt-5 text-center text-[13px] text-[#607067]">
          <Link href="/login" className="font-semibold text-[#14663a] hover:text-[#0f4f2d]">
            Kembali ke login
          </Link>
        </p>
      </div>
    </main>
  );
}
