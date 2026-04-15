"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ADMIN_SESSION_COOKIE } from "@/lib/auth";
import { ArrowRightIcon, EyeIcon, EyeOffIcon, LockIcon, UserIcon } from "@/components/icons";
import { InputField } from "@/components/ui/input-field";
import { PrimaryButton } from "@/components/ui/primary-button";

type LoginFormProps = {
  mode?: "login" | "register";
};

export function LoginForm({ mode = "login" }: LoginFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [name, setName] = useState("");
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");

  const isRegister = mode === "register";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const maxAge = remember ? 60 * 60 * 24 * 7 : 60 * 60 * 6;
    document.cookie = `${ADMIN_SESSION_COOKIE}=active; path=/; max-age=${maxAge}; SameSite=Lax`;
    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <section className="flex min-h-[460px] items-center rounded-[30px] bg-[#fbfaf3] px-4 py-8 sm:px-6 lg:min-h-[760px] lg:px-8">
      <div className="mx-auto w-full max-w-[470px]">
        <div className="px-2 sm:px-4">
          <div className="w-fit">
            <Image
              src="/images/shipin-go-logo-transparent.png"
              alt="Logo Shipin Go"
              width={112}
              height={74}
              className="h-auto w-[92px] object-contain sm:w-[104px]"
              priority
            />
          </div>
          <h1 className="mt-7 text-[40px] font-extrabold leading-none text-[#2a312d] sm:text-[48px]">
            {isRegister ? "Buat Akun Admin" : "Selamat Datang"}
          </h1>
          <p className="mt-4 max-w-[330px] text-[15px] leading-8 text-[#6b716b]">
            {isRegister
              ? "Daftar sebagai admin untuk mulai mengelola pengiriman Anda dengan sistem yang lebih rapi."
              : "Masuk sebagai admin untuk mengelola pengiriman Anda dengan mudah."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6 rounded-[32px] bg-transparent px-2 sm:px-4">
          {isRegister ? (
            <div>
              <label className="mb-3 block text-sm font-semibold text-[#3f4742]">Nama Admin</label>
              <InputField
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Nama lengkap admin"
                icon={<UserIcon className="h-[18px] w-[18px]" />}
                required
              />
            </div>
          ) : null}

          <div>
            <label className="mb-3 block text-sm font-semibold text-[#3f4742]">Email atau Username</label>
            <InputField
              value={emailOrUsername}
              onChange={(event) => setEmailOrUsername(event.target.value)}
              placeholder="nama@email.com"
              icon={<UserIcon className="h-[18px] w-[18px]" />}
              required
            />
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between gap-4">
              <label className="block text-sm font-semibold text-[#3f4742]">Password</label>
              <button
                type="button"
                className="text-sm font-semibold text-shipin-deep hover:text-[#12572f]"
              >
                Lupa Password?
              </button>
            </div>
            <InputField
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
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
          </div>

          <label className="flex cursor-pointer items-center gap-3 text-sm text-[#72786e]">
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

          <PrimaryButton type="submit" className="mt-2 w-full text-base" icon={<ArrowRightIcon className="h-5 w-5" />}>
            {isRegister ? "Daftar Admin" : "Masuk Sekarang"}
          </PrimaryButton>

          <p className="text-center text-sm text-[#72786e]">
            {isRegister ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
            <Link
              href={isRegister ? "/login" : "/register"}
              className="font-semibold text-shipin-deep hover:text-[#12572f]"
            >
              {isRegister ? "Masuk Sekarang" : "Daftar Sekarang"}
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}
