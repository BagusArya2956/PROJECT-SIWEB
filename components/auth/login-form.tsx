"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ArrowRightIcon, EyeIcon, EyeOffIcon, LockIcon, UserIcon } from "@/components/icons";
import { InputField } from "@/components/ui/input-field";
import { PrimaryButton } from "@/components/ui/primary-button";

type LoginFormProps = {
  mode?: "login" | "register";
};

type FieldErrors = {
  fullName?: string;
  username?: string;
  email?: string;
  login?: string;
  adminCode?: string;
  password?: string;
  confirmPassword?: string;
  adminTerms?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DIGIT_PATTERN = /\d/;

export function LoginForm({ mode = "login" }: LoginFormProps) {
  const router = useRouter();
  const isRegister = mode === "register";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [adminTermsAccepted, setAdminTermsAccepted] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    if (!isRegister && params.get("reason") === "expired") {
      setNotice("Sesi Anda telah berakhir, silakan login kembali.");
    }
  }, [isRegister]);

  function setFieldError<K extends keyof FieldErrors>(key: K, value: FieldErrors[K]) {
    setFieldErrors((current) => ({
      ...current,
      [key]: value
    }));
  }

  function clearGlobalMessages() {
    setError("");
    setNotice("");
  }

  function validateFullName(value: string) {
    if (!value.trim()) return "Nama lengkap tidak boleh kosong";
    return "";
  }

  function validateUsername(value: string) {
    if (!value.trim()) return "Username tidak boleh kosong";
    return "";
  }

  function validateEmail(value: string) {
    const normalized = value.trim();
    if (!normalized) return "Email tidak boleh kosong";
    if (!EMAIL_PATTERN.test(normalized)) return "Format email tidak valid";
    return "";
  }

  function validateLogin(value: string) {
    if (!value.trim()) return "Username tidak boleh kosong";
    return "";
  }

  function validateAdminCode(value: string) {
    if (!value.trim()) return "Kode Admin tidak boleh kosong.";
    return "";
  }

  function validatePassword(value: string, strict = false) {
    if (!value) return "Password tidak boleh kosong";
    if (strict && value.length < 8) return "Password minimal 8 karakter";
    if (strict && !DIGIT_PATTERN.test(value)) return "Password harus mengandung angka";
    return "";
  }

  function validateConfirmPassword(value: string, sourcePassword: string) {
    if (value !== sourcePassword) return "Password tidak cocok";
    return "";
  }

  function validateAdminTerms(value: boolean) {
    if (!value) return "Anda harus menyetujui persyaratan admin.";
    return "";
  }

  async function handleLoginSubmit() {
    const nextErrors: FieldErrors = {
      login: validateLogin(emailOrUsername),
      password: validatePassword(password)
    };

    setFieldErrors(nextErrors);
    if (nextErrors.login || nextErrors.password) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login: emailOrUsername.trim(),
          password,
          remember
        })
      });

      const data = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        setError(data?.message || "Username atau password salah");
        return;
      }

      setIsRedirecting(true);
      window.setTimeout(() => {
        router.push("/admin/dashboard");
        router.refresh();
      }, 850);
    } catch {
      setError("Terjadi kesalahan, silakan coba beberapa saat lagi");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegisterSubmit() {
    const nextErrors: FieldErrors = {
      fullName: validateFullName(fullName),
      username: validateUsername(username),
      email: validateEmail(email),
      adminCode: validateAdminCode(adminCode),
      password: validatePassword(password, true),
      confirmPassword: validateConfirmPassword(confirmPassword, password),
      adminTerms: validateAdminTerms(adminTermsAccepted)
    };

    setFieldErrors(nextErrors);
    if (
      nextErrors.fullName ||
      nextErrors.username ||
      nextErrors.email ||
      nextErrors.adminCode ||
      nextErrors.password ||
      nextErrors.confirmPassword ||
      nextErrors.adminTerms
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          username: username.trim(),
          email: email.trim(),
          adminCode: adminCode.trim(),
          password,
          remember
        })
      });

      const data = (await response.json().catch(() => null)) as
        | {
            message?: string;
            field?: keyof FieldErrors;
          }
        | null;

      if (!response.ok) {
        if (data?.field && data?.message) {
          setFieldError(data.field, data.message);
        } else {
          setError(data?.message || "Gagal menyimpan data, coba lagi");
        }
        return;
      }

      setIsRedirecting(true);
      window.setTimeout(() => {
        router.push("/admin/dashboard");
        router.refresh();
      }, 850);
    } catch {
      setError("Terjadi kesalahan, silakan coba beberapa saat lagi");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearGlobalMessages();

    if (isRegister) {
      await handleRegisterSubmit();
      return;
    }

    await handleLoginSubmit();
  }

  return (
    <section className="admin-auth-panel relative w-full rounded-[22px] border border-[#dfe7dc] bg-white px-5 py-6 shadow-[0_24px_70px_rgba(38,70,47,0.14)] sm:px-7 sm:py-7">
      {isRedirecting ? (
        <div className="absolute inset-0 z-20 grid place-items-center rounded-[22px] bg-white/86 px-6 backdrop-blur-md">
          <div className="w-full max-w-[320px] rounded-[20px] border border-[#dfe8da] bg-white p-6 text-center shadow-[0_24px_58px_rgba(38,70,47,0.18)]">
            <Image
              src="/images/shipin-go-logo-transparent.png"
              alt="Logo Shipin Go"
              width={72}
              height={48}
              className="mx-auto h-auto w-[64px] object-contain"
            />
            <div className="mx-auto mt-5 h-10 w-10 animate-spin rounded-full border-2 border-[#dfe8da] border-t-shipin-deep" />
            <p className="mt-5 text-sm font-extrabold text-shipin-ink">
              {isRegister ? "Mendaftarkan akses admin..." : "Memverifikasi akses admin..."}
            </p>
            <p className="mt-2 text-xs leading-5 text-shipin-text">Mengalihkan ke dashboard</p>
          </div>
        </div>
      ) : null}
      <div className="mx-auto w-full">
        <div className="flex items-start justify-between gap-5 border-b border-[#e4ebe1] pb-6">
          <div>
            <Link href="/" className="inline-flex items-center gap-3" aria-label="Kembali ke halaman utama">
              <Image
                src="/images/shipin-go-logo-transparent.png"
                alt="Logo Shipin Go"
                width={74}
                height={49}
                className="h-auto w-[64px] object-contain"
                priority
              />
              <span className="text-sm font-extrabold uppercase tracking-[0.16em] text-shipin-deep">SHIPIN GO</span>
            </Link>
            <h1 className="mt-7 text-[34px] font-extrabold leading-tight text-shipin-ink sm:text-[40px]">
              {isRegister ? "Register Admin" : "Login"}
            </h1>
            <p className="mt-3 max-w-[560px] text-sm leading-7 text-shipin-text">
              {isRegister
                ? "Buat akun khusus untuk akses operasional admin SHIPIN GO."
                : "Masuk dengan akun yang sudah memiliki akses Admin."}
            </p>
          </div>
          <div className="hidden shrink-0 rounded-full border border-[#dfe8da] bg-[#f7faf5] px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-shipin-deep sm:inline-flex">
            Akses Terbatas
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className={isRegister ? "mt-7 grid gap-5 sm:grid-cols-2" : "mt-7 space-y-5"}
        >
          {isRegister ? (
            <>
              <div>
                <label className="mb-3 block text-sm font-semibold text-[#3f4742]">Nama Lengkap</label>
                <InputField
                  value={fullName}
                  onChange={(event) => {
                    setFullName(event.target.value);
                    if (fieldErrors.fullName) setFieldError("fullName", validateFullName(event.target.value));
                  }}
                  onBlur={(event) => setFieldError("fullName", validateFullName(event.target.value))}
                  placeholder="Masukkan nama lengkap"
                  icon={<UserIcon className="h-[18px] w-[18px]" />}
                  required
                />
                {fieldErrors.fullName ? <p className="mt-2 text-sm text-[#b42318]">{fieldErrors.fullName}</p> : null}
              </div>

              <div>
                <label className="mb-3 block text-sm font-semibold text-[#3f4742]">Username</label>
                <InputField
                  value={username}
                  onChange={(event) => {
                    setUsername(event.target.value);
                    if (fieldErrors.username) setFieldError("username", validateUsername(event.target.value));
                  }}
                  onBlur={(event) => setFieldError("username", validateUsername(event.target.value))}
                  placeholder="Masukkan username"
                  icon={<UserIcon className="h-[18px] w-[18px]" />}
                  required
                />
                {fieldErrors.username ? <p className="mt-2 text-sm text-[#b42318]">{fieldErrors.username}</p> : null}
              </div>

              <div>
                <label className="mb-3 block text-sm font-semibold text-[#3f4742]">Email</label>
                <InputField
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (fieldErrors.email) setFieldError("email", validateEmail(event.target.value));
                  }}
                  onBlur={(event) => setFieldError("email", validateEmail(event.target.value))}
                  placeholder="nama@email.com"
                  icon={<UserIcon className="h-[18px] w-[18px]" />}
                  required
                />
                {fieldErrors.email ? <p className="mt-2 text-sm text-[#b42318]">{fieldErrors.email}</p> : null}
              </div>

              <div>
                <label className="mb-3 block text-sm font-semibold text-[#3f4742]">Kode Admin</label>
                <InputField
                  value={adminCode}
                  onChange={(event) => {
                    setAdminCode(event.target.value);
                    if (fieldErrors.adminCode) setFieldError("adminCode", validateAdminCode(event.target.value));
                  }}
                  onBlur={(event) => setFieldError("adminCode", validateAdminCode(event.target.value))}
                  placeholder="Masukkan kode admin"
                  icon={<LockIcon className="h-[18px] w-[18px]" />}
                  required
                />
                {fieldErrors.adminCode ? <p className="mt-2 text-sm text-[#b42318]">{fieldErrors.adminCode}</p> : null}
                <p className="mt-2 text-xs leading-5 text-shipin-text">
                  Belum memiliki Kode Admin? Hubungi pemilik sistem atau administrator SHIPIN GO.
                </p>
              </div>

              <div className="admin-auth-note rounded-[18px] border border-[#dfe8da] bg-[#f7faf5] p-4 text-sm text-shipin-text sm:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-shipin-deep">
                    Persyaratan Admin
                  </p>
                  <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-shipin-text">
                    Kode wajib
                  </span>
                </div>
                <ul className="mt-3 grid gap-2 leading-6 sm:grid-cols-3">
                  <li className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-shipin-green" />
                    Kode Admin resmi.
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-shipin-green" />
                    Data akun valid.
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-shipin-green" />
                    Untuk operasional.
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <div>
              <label className="mb-3 block text-sm font-semibold text-[#3f4742]">Email atau Username</label>
              <InputField
                value={emailOrUsername}
                onChange={(event) => {
                  setEmailOrUsername(event.target.value);
                  if (fieldErrors.login) setFieldError("login", validateLogin(event.target.value));
                }}
                onBlur={(event) => setFieldError("login", validateLogin(event.target.value))}
                placeholder="nama@email.com"
                icon={<UserIcon className="h-[18px] w-[18px]" />}
                required
              />
              {fieldErrors.login ? <p className="mt-2 text-sm text-[#b42318]">{fieldErrors.login}</p> : null}
            </div>
          )}

          <div>
            <div className="mb-3 flex items-center justify-between gap-4">
              <label className="block text-sm font-semibold text-[#3f4742]">Password</label>
              {!isRegister ? (
                <Link href="/lupa-password" className="text-sm font-semibold text-shipin-deep hover:text-[#12572f]">
                  Lupa Password?
                </Link>
              ) : null}
            </div>
            <InputField
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (fieldErrors.password) setFieldError("password", validatePassword(event.target.value, isRegister));
                if (isRegister && fieldErrors.confirmPassword) {
                  setFieldError("confirmPassword", validateConfirmPassword(confirmPassword, event.target.value));
                }
              }}
              onBlur={(event) => setFieldError("password", validatePassword(event.target.value, isRegister))}
              placeholder="********"
              icon={<LockIcon className="h-[18px] w-[18px]" />}
              trailing={
                <button
                  type="button"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  onClick={() => setShowPassword((value) => !value)}
                  className="grid place-items-center"
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-[18px] w-[18px]" />
                  ) : (
                    <EyeIcon className="h-[18px] w-[18px]" />
                  )}
                </button>
              }
              required
            />
            {fieldErrors.password ? <p className="mt-2 text-sm text-[#b42318]">{fieldErrors.password}</p> : null}
          </div>

          {isRegister ? (
            <div>
              <label className="mb-3 block text-sm font-semibold text-[#3f4742]">Konfirmasi Password</label>
              <InputField
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  if (fieldErrors.confirmPassword) {
                    setFieldError("confirmPassword", validateConfirmPassword(event.target.value, password));
                  }
                }}
                onBlur={(event) => setFieldError("confirmPassword", validateConfirmPassword(event.target.value, password))}
                placeholder="********"
                icon={<LockIcon className="h-[18px] w-[18px]" />}
                trailing={
                  <button
                    type="button"
                    aria-label={showConfirmPassword ? "Sembunyikan konfirmasi password" : "Tampilkan konfirmasi password"}
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    className="grid place-items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOffIcon className="h-[18px] w-[18px]" />
                    ) : (
                      <EyeIcon className="h-[18px] w-[18px]" />
                    )}
                  </button>
                }
                required
              />
              {fieldErrors.confirmPassword ? (
                <p className="mt-2 text-sm text-[#b42318]">{fieldErrors.confirmPassword}</p>
              ) : null}
            </div>
          ) : null}

          {isRegister ? (
            <label className="admin-auth-note flex cursor-pointer items-start gap-3 rounded-[18px] border border-[#dfe8da] bg-[#f7faf5] p-4 text-sm leading-6 text-shipin-text sm:col-span-2">
              <span
                className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
                  adminTermsAccepted ? "border-shipin-deep bg-shipin-deep text-white" : "border-[#d8ddd3] bg-white"
                }`}
              >
                {adminTermsAccepted ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
              </span>
              <input
                type="checkbox"
                checked={adminTermsAccepted}
                onChange={(event) => {
                  setAdminTermsAccepted(event.target.checked);
                  if (fieldErrors.adminTerms) setFieldError("adminTerms", validateAdminTerms(event.target.checked));
                }}
                className="sr-only"
              />
              <span>
                Saya memahami bahwa akun ini khusus Admin SHIPIN GO dan data yang saya isi benar.
              </span>
            </label>
          ) : null}
          {fieldErrors.adminTerms ? (
            <p className="text-sm text-[#b42318] sm:col-span-2">{fieldErrors.adminTerms}</p>
          ) : null}

          <label className={`flex cursor-pointer items-center gap-3 text-sm text-shipin-text ${isRegister ? "sm:col-span-2" : ""}`}>
            <span
              className={`grid h-5 w-5 place-items-center rounded-full border ${
                remember ? "border-shipin-deep bg-shipin-deep text-white" : "border-[#d8ddd3] bg-white"
              }`}
            >
              {remember ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
            </span>
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="sr-only"
            />
            Ingat saya di perangkat ini
          </label>

          <PrimaryButton
            type="submit"
            className={`mt-1 w-full text-base ${isRegister ? "sm:col-span-2" : ""}`}
            icon={<ArrowRightIcon className="h-5 w-5" />}
            disabled={isSubmitting || isRedirecting}
          >
            {isRegister ? "Daftar Sekarang" : "Masuk Sekarang"}
          </PrimaryButton>

          {error ? <p className={`text-sm font-medium text-[#b42318] ${isRegister ? "sm:col-span-2" : ""}`}>{error}</p> : null}
          {notice ? <p className={`text-sm font-medium text-[#1f7a44] ${isRegister ? "sm:col-span-2" : ""}`}>{notice}</p> : null}

          <p className={`text-center text-sm text-shipin-text ${isRegister ? "sm:col-span-2" : ""}`}>
            {isRegister ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
            <Link href={isRegister ? "/login" : "/register"} className="font-semibold text-shipin-deep hover:text-[#12572f]">
              {isRegister ? "Masuk Sekarang" : "Daftar Sekarang"}
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}
