"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import {
  ChatBubbleIcon,
  ClockIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon
} from "@/components/icons";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const TrackingMap = dynamic(
  () => import("@/components/public/tracking-map").then((mod) => mod.TrackingMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[250px] w-full rounded-[18px] bg-[linear-gradient(130deg,#3e7f76,#5b9d93)]" />
    )
  }
);

const contactCards = [
  {
    title: "WhatsApp",
    description: "Chat cepat untuk cek status paket.",
    value: "+6281353823867",
    href: "https://wa.me/6281353823867",
    icon: ChatBubbleIcon
  },
  {
    title: "Call Center",
    description: "Layanan suara tersedia 24/7.",
    value: "021-500-SHIP",
    icon: PhoneIcon
  },
  {
    title: "Email",
    description: "Tim siap merespons di hari kerja.",
    value: "shipingo@gmail.com",
    href: "mailto:shipingo@gmail.com",
    icon: MailIcon
  }
];

export function KontakPage() {
  const [isSent, setIsSent] = useState(false);

  return (
    <main>
      <ScrollReveal />
      <section className="shell py-10 lg:py-14">
        <div className="mx-auto max-w-[1020px]">
          <div className="reveal-on-scroll max-w-[620px]">
            <h1 className="text-[38px] font-extrabold tracking-[-0.04em] text-[#1f2622] sm:text-[52px]">
              Hubungi Kami
            </h1>
            <p className="mt-2 text-[14px] leading-7 text-[#6d746e] sm:text-[16px]">
              Tim dukungan kami siap membantu kebutuhan logistik Anda. Hubungi kami melalui
              kanal yang tersedia atau kirim pertanyaan langsung lewat formulir.
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[0.56fr_1fr]">
            <div className="space-y-4">
              {contactCards.map((item, index) => (
                <article
                  key={item.title}
                  className={`reveal-on-scroll hover-lift rounded-[20px] border border-[#e3e8e2] bg-[#f8faf7] p-5 shadow-[0_12px_30px_rgba(173,183,168,0.14)] ${
                    index === 1 ? "reveal-delay-1" : ""
                  } ${index === 2 ? "reveal-delay-2" : ""}`}
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#d5f4d5] text-[#1b8248]">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-[20px] font-bold tracking-[-0.02em] text-[#26322b]">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-[13px] text-[#6f786f]">{item.description}</p>
                  {item.href ? (
                    <a
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                      className="mt-4 inline-block text-[14px] font-semibold text-[#1b8248] hover:underline"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="mt-4 text-[14px] font-semibold text-[#1b8248]">{item.value}</p>
                  )}
                </article>
              ))}
            </div>

            <article className="reveal-on-scroll reveal-delay-1 rounded-[24px] border border-[#e3e8e2] bg-[#f8faf7] p-6 shadow-[0_18px_36px_rgba(173,183,168,0.16)] sm:p-7">
              <h2 className="text-[30px] font-extrabold tracking-[-0.03em] text-[#2a312d]">
                Kirim Pesan
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#4a534d]">
                    Nama Lengkap
                  </label>
                  <input
                    className="mt-2 h-11 w-full rounded-full border border-[#e2e8e1] bg-[#f1f4ef] px-4 text-[14px] text-[#38433c] outline-none"
                    placeholder="Masukkan nama Anda"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#4a534d]">
                    Alamat Email
                  </label>
                  <input
                    className="mt-2 h-11 w-full rounded-full border border-[#e2e8e1] bg-[#f1f4ef] px-4 text-[14px] text-[#38433c] outline-none"
                    placeholder="email@perusahaan.com"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#4a534d]">
                  Subjek Layanan
                </label>
                <select className="mt-2 h-11 w-full rounded-full border border-[#e2e8e1] bg-[#f1f4ef] px-4 text-[14px] text-[#38433c] outline-none">
                  <option>Pengiriman Domestik</option>
                  <option>Layanan Express</option>
                  <option>Klaim & Refund</option>
                </select>
              </div>

              <div className="mt-4">
                <label className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#4a534d]">
                  Pesan
                </label>
                <textarea
                  rows={4}
                  className="mt-2 w-full resize-none rounded-[14px] border border-[#e2e8e1] bg-[#f1f4ef] px-4 py-3 text-[14px] text-[#38433c] outline-none"
                  placeholder="Ada yang bisa kami bantu?"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsSent(true)}
                className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#168049] to-[#12a662] px-6 text-[13px] font-semibold text-white shadow-[0_10px_22px_rgba(21,143,82,0.3)]"
              >
                Kirim Pertanyaan
              </button>
              {isSent ? (
                <p className="mt-3 text-[12px] font-semibold text-[#1b8248]">
                  Pesan berhasil dikirim. Tim kami akan segera menghubungi Anda.
                </p>
              ) : null}
            </article>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.46fr]">
            <article className="reveal-on-scroll hover-lift relative overflow-hidden rounded-[24px] border border-[#e2e7e1] bg-[#4f8f86] p-4 shadow-[0_18px_34px_rgba(114,148,138,0.22)]">
              <div className="relative overflow-hidden rounded-[18px] border border-white/40">
                <TrackingMap
                  latest={{
                    lat: -6.2088,
                    lng: 106.8456,
                    label: "SHIPIN GO HQ - Sudirman, Jakarta"
                  }}
                  heightClassName="h-[250px]"
                  zoom={13}
                  scrollWheelZoom={false}
                />
              </div>
            </article>

            <article className="reveal-on-scroll reveal-delay-1 rounded-[24px] border border-[#e3e8e2] bg-[#f8faf7] p-6 shadow-[0_18px_36px_rgba(173,183,168,0.16)]">
              <h3 className="text-[27px] font-extrabold tracking-[-0.03em] text-[#2b332e]">
                Lokasi Kantor
              </h3>
              <div className="mt-4 space-y-4 text-[13px] leading-6 text-[#5c665f]">
                <div className="flex items-start gap-2">
                  <MapPinIcon className="mt-0.5 h-4 w-4 text-[#1b8248]" />
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#405047]">
                      Alamat Utama
                    </p>
                    <p>Jl. Jend. Sudirman Kav 52-53, Jakarta 12190</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <ClockIcon className="mt-0.5 h-4 w-4 text-[#1b8248]" />
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#405047]">
                      Jam Operasional
                    </p>
                    <p>Senin - Jumat: 08:00 - 18:00</p>
                    <p>Sabtu: 09:00 - 15:00</p>
                    <p>Minggu / Libur: Tutup</p>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <footer className="mt-8 bg-white/85">
        <div className="shell py-12">
          <div className="grid gap-10 border-b border-[#e8ebe4] pb-10 md:grid-cols-2 lg:grid-cols-[1.4fr_0.7fr_0.7fr]">
            <div>
              <p className="text-[18px] font-extrabold tracking-[-0.03em] text-shipin-deep">SHIPIN GO</p>
              <p className="mt-5 max-w-[360px] text-[15px] leading-8 text-shipin-text">
                Solusi logistik terdepan di Indonesia. Menghubungkan orang dan bisnis
                melalui sistem pengiriman yang cerdas dan efisien.
              </p>
            </div>
            <div>
              <p className="text-[15px] font-bold text-shipin-ink">Perusahaan</p>
              <ul className="mt-5 space-y-4 text-[15px] text-shipin-text">
                <li>Tentang Kami</li>
                <li>Karir</li>
                <li>Kontak</li>
              </ul>
            </div>
            <div>
              <p className="text-[15px] font-bold text-shipin-ink">Dukungan</p>
              <ul className="mt-5 space-y-4 text-[15px] text-shipin-text">
                <li>Pusat Bantuan</li>
                <li>Syarat &amp; Ketentuan</li>
                <li>Kebijakan Privasi</li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col gap-4 pt-7 text-[14px] text-shipin-text sm:flex-row sm:items-center sm:justify-between">
            <p>© 2024 SHIPIN GO. Hak Cipta Dilindungi.</p>
            <div className="flex gap-6">
              <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" className="hover:text-shipin-deep">
                Instagram
              </a>
              <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" className="hover:text-shipin-deep">
                LinkedIn
              </a>
              <a href="https://x.com/" target="_blank" rel="noreferrer" className="hover:text-shipin-deep">
                Twitter
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
