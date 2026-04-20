"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { PrinterIcon, ShieldIcon } from "@/components/icons";
import { createShipment, ServiceType } from "@/lib/admin-shipments";

const serviceOptions = [
  {
    id: "reguler" as const,
    title: "Reguler (2-3 Hari)",
    subtitle: "Keseimbangan antara harga & kecepatan",
    recommended: true
  },
  {
    id: "ekspres" as const,
    title: "Ekspres (Besok Sampai)",
    subtitle: "Prioritas utama untuk paket mendesak",
    recommended: false
  }
];

export default function AdminKirimPaketPage() {
  const router = useRouter();
  const [selectedService, setSelectedService] = useState<"reguler" | "ekspres">("reguler");
  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [weightKg, setWeightKg] = useState("2");
  const [dimP, setDimP] = useState("");
  const [dimL, setDimL] = useState("");
  const [dimT, setDimT] = useState("");
  const [notice, setNotice] = useState("");
  const [noticeTone, setNoticeTone] = useState<"error" | "success">("error");
  const [senderError, setSenderError] = useState("");
  const [receiverError, setReceiverError] = useState("");
  const [draftInfo, setDraftInfo] = useState("");
  const [guideInfo, setGuideInfo] = useState("");
  const [isPaymentSuccessOpen, setIsPaymentSuccessOpen] = useState(false);
  const [paidShipmentId, setPaidShipmentId] = useState("");
  const [paidAmount, setPaidAmount] = useState(0);

  const weight = Number(weightKg) > 0 ? Number(weightKg) : 1;
  const shippingCost = weight * 17000;
  const serviceCost = selectedService === "ekspres" ? 3500 : 1500;
  const totalCost = shippingCost + serviceCost;
  const hasCoreData = Boolean(
    senderName.trim() &&
    pickupAddress.trim() &&
    receiverName.trim() &&
    destinationAddress.trim()
  );

  function resetForm() {
    setSenderName("");
    setSenderPhone("");
    setPickupAddress("");
    setReceiverName("");
    setReceiverPhone("");
    setDestinationAddress("");
    setWeightKg("2");
    setDimP("");
    setDimL("");
    setDimT("");
    setSelectedService("reguler");
    setSenderError("");
    setReceiverError("");
    setDraftInfo("");
    setGuideInfo("");
  }

  function handleCancel() {
    resetForm();
    setNotice("");
    setNoticeTone("error");
  }

  function handleSaveDraft() {
    const draftPayload = {
      senderName,
      senderPhone,
      pickupAddress,
      receiverName,
      receiverPhone,
      destinationAddress,
      weightKg,
      dimP,
      dimL,
      dimT,
      selectedService
    };
    window.localStorage.setItem("shipin_admin_kirim_paket_draft", JSON.stringify(draftPayload));
    setDraftInfo("Draft pengiriman berhasil disimpan.");
  }

  function handleGuideClick() {
    setGuideInfo("Panduan: lengkapi data pengirim/penerima, cek total, lalu Konfirmasi & Bayar.");
  }

  function handleCreateShipment() {
    const senderMissing = !senderName.trim() || !pickupAddress.trim();
    const receiverMissing = !receiverName.trim() || !destinationAddress.trim();

    setSenderError(senderMissing ? "Nama dan alamat pengirim wajib diisi." : "");
    setReceiverError(receiverMissing ? "Nama dan alamat penerima wajib diisi." : "");

    if (senderMissing || receiverMissing) {
      setNoticeTone("error");
      setNotice("Lengkapi data wajib: nama/alamat pengirim dan penerima.");
      return;
    }

    const service: ServiceType = selectedService === "ekspres" ? "EKSPRES" : "REGULER";
    const created = createShipment({
      senderName,
      pickupAddress,
      receiverName,
      destinationAddress,
      senderPhone,
      receiverPhone,
      weightKg: weight,
      service
    });

    setNoticeTone("success");
    setNotice("Pembayaran berhasil diverifikasi.");
    setPaidShipmentId(created.id);
    setPaidAmount(created.total);
    setIsPaymentSuccessOpen(true);
  }

  function handleGoToHistory() {
    setIsPaymentSuccessOpen(false);
    setNotice("");
    resetForm();
    router.push("/admin/histori");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#eef2ee] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1540px]">
        <header className="mb-5">
          <h1 className="text-[44px] font-extrabold tracking-[-0.04em] text-[#202923] sm:text-[54px]">
            Buat Pengiriman Baru
          </h1>
          <p className="mt-1.5 max-w-[620px] text-[13px] leading-6 text-[#667067] sm:text-[14px]">
            Lengkapi detail pengiriman Anda. Sistem kami akan menghitung biaya terbaik untuk logistik UMKM Anda secara otomatis.
          </p>
        </header>

        <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-4">
            <BlockCard number={1} title="Data Pengirim">
              <p className="mb-3 text-[12px] text-[#5e6d62]">
                Info: isi data pengirim utama agar penjemputan tidak tertunda.
              </p>
              <div className="mb-3 grid gap-2.5 sm:grid-cols-2">
                <Field label="Nama Lengkap">
                  <input
                    className={inputClass}
                    placeholder="Contoh: Budi Santoso"
                    value={senderName}
                    onChange={(event) => {
                      setSenderName(event.target.value);
                      if (senderError) setSenderError("");
                    }}
                  />
                </Field>
                <Field label="Nomor Telepon">
                  <input
                    className={inputClass}
                    placeholder="0812xxxx"
                    value={senderPhone}
                    onChange={(event) => setSenderPhone(event.target.value)}
                  />
                </Field>
              </div>
              <Field label="Alamat Penjemputan">
                <textarea
                  className={`${inputClass} h-[74px] resize-none py-2.5`}
                  placeholder="Masukkan alamat lengkap penjemputan paket..."
                  value={pickupAddress}
                  onChange={(event) => {
                    setPickupAddress(event.target.value);
                    if (senderError) setSenderError("");
                  }}
                />
              </Field>
              {senderError ? <p className="mt-2 text-[12px] font-semibold text-[#c62828]">{senderError}</p> : null}
            </BlockCard>

            <BlockCard number={2} title="Data Penerima">
              <p className="mb-3 text-[12px] text-[#5e6d62]">
                Info: pastikan nama dan alamat tujuan lengkap untuk mencegah retur.
              </p>
              <div className="mb-3 grid gap-2.5 sm:grid-cols-2">
                <Field label="Nama Penerima">
                  <input
                    className={inputClass}
                    placeholder="Contoh: Siti Aminah"
                    value={receiverName}
                    onChange={(event) => {
                      setReceiverName(event.target.value);
                      if (receiverError) setReceiverError("");
                    }}
                  />
                </Field>
                <Field label="Nomor Telepon">
                  <input
                    className={inputClass}
                    placeholder="0857xxxx"
                    value={receiverPhone}
                    onChange={(event) => setReceiverPhone(event.target.value)}
                  />
                </Field>
              </div>
              <Field label="Alamat Tujuan">
                <textarea
                  className={`${inputClass} h-[74px] resize-none py-2.5`}
                  placeholder="Masukkan alamat lengkap tujuan pengiriman..."
                  value={destinationAddress}
                  onChange={(event) => {
                    setDestinationAddress(event.target.value);
                    if (receiverError) setReceiverError("");
                  }}
                />
              </Field>
              {receiverError ? <p className="mt-2 text-[12px] font-semibold text-[#c62828]">{receiverError}</p> : null}
            </BlockCard>

            <BlockCard number={3} title="Detail Paket">
              <div className="mb-4 grid gap-2.5 sm:grid-cols-[1fr_2fr]">
                <Field label="Berat (Kg)">
                  <div className="relative">
                    <input
                      className={`${inputClass} pr-8`}
                      value={weightKg}
                      onChange={(event) => setWeightKg(event.target.value)}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[#8e9690]">kg</span>
                  </div>
                </Field>

                <Field label="Dimensi (PxLxT cm)">
                  <div className="grid grid-cols-3 gap-2">
                    <input className={inputClass} placeholder="P" value={dimP} onChange={(event) => setDimP(event.target.value)} />
                    <input className={inputClass} placeholder="L" value={dimL} onChange={(event) => setDimL(event.target.value)} />
                    <input className={inputClass} placeholder="T" value={dimT} onChange={(event) => setDimT(event.target.value)} />
                  </div>
                </Field>
              </div>

              <p className="mb-2 text-[12px] font-bold text-[#303a33]">Pilih Jenis Layanan</p>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {serviceOptions.map((service) => {
                  const active = selectedService === service.id;

                  return (
                    <button
                      key={service.id}
                      onClick={() => setSelectedService(service.id)}
                      className={`rounded-2xl border px-3.5 py-3 text-left transition ${
                        active ? "border-[#8fd09b] bg-[#ecf9ef]" : "border-[#dce2da] bg-white"
                      }`}
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-[13px] font-bold text-[#223028]">{service.title}</span>
                        {service.recommended && (
                          <span className="rounded-full bg-[#35b85a] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#7d867f]">{service.subtitle}</p>
                    </button>
                  );
                })}
              </div>
            </BlockCard>
          </div>

          <aside className="rounded-[34px] border border-[#95e198] bg-[linear-gradient(180deg,#9cf09b_0%,#95eb92_35%,#90e58f_100%)] p-8 text-[#143f25] shadow-[0_22px_45px_rgba(107,188,121,0.3)] xl:sticky xl:top-6">
            <h2 className="text-[28px] font-extrabold leading-none tracking-[-0.05em] text-[#133d24] sm:text-[31px]">
              Ringkasan Biaya
            </h2>

            <div className="mt-8 space-y-4 text-[14px] text-[#275238] sm:text-[15px]">
              <div className="flex items-center justify-between gap-4">
                <span>Biaya Pengiriman ({weight}kg)</span>
                <span className="shrink-0 text-[18px] font-semibold text-[#1c4d30]">
                  {hasCoreData ? `Rp ${shippingCost.toLocaleString("id-ID")}` : "-"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Biaya Layanan</span>
                <span className="shrink-0 text-[18px] font-semibold text-[#1c4d30]">
                  {hasCoreData ? `Rp ${serviceCost.toLocaleString("id-ID")}` : "-"}
                </span>
              </div>
            </div>

            <hr className="my-5 border-[#7fda86]" />

            <div className="flex items-center justify-between gap-5">
              <p className="text-[18px] font-bold leading-[1.15] text-[#173c27]">
                Total Pembayaran
              </p>
              <p className="shrink-0 whitespace-nowrap text-[28px] font-black leading-none tracking-[-0.04em] text-[#0f341f] sm:text-[32px] xl:text-[36px]">
                {hasCoreData ? `Rp ${totalCost.toLocaleString("id-ID")}` : "-"}
              </p>
            </div>
            {!hasCoreData ? (
              <p className="mt-3 text-[12px] font-semibold text-[#174c2c]">
                Isi data pengirim dan penerima dulu untuk generate total biaya.
              </p>
            ) : null}

            <div className="mt-8 rounded-[32px] bg-[radial-gradient(circle_at_top,_rgba(236,255,232,0.95),rgba(210,247,201,0.88))] px-6 py-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
              <p className="text-center text-[12px] font-extrabold uppercase tracking-[0.08em] text-[#18482d] sm:text-[13px]">
                Metode Pembayaran: QRIS
              </p>

              <div className="mt-6 rounded-[30px] bg-white px-5 py-4 shadow-[0_14px_34px_rgba(111,174,111,0.16)]">
                {hasCoreData ? (
                  <div className="mx-auto flex h-[120px] max-w-[270px] items-center gap-3 rounded-[10px] border border-[#d7d9db] bg-[linear-gradient(180deg,#f3f3f5_0%,#ededf0_100%)] px-3 text-[#5f6661] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.02)]">
                    <div className="grid h-[84px] w-[84px] grid-cols-7 gap-[2px] rounded bg-white p-[4px]">
                      {Array.from({ length: 49 }).map((_, index) => (
                        <span
                          key={index}
                          className={`rounded-[1px] ${
                            [0, 1, 2, 7, 14, 21, 28, 35, 42, 43, 44, 20, 26, 31, 33, 37, 39].includes(index) ||
                            index % 3 === 0
                              ? "bg-[#1f2d25]"
                              : "bg-[#d7ddd8]"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.09em] text-[#6d746f]">Dummy QRIS</p>
                      <p className="mt-1 text-[11px] font-semibold leading-4 text-[#7b837d]">
                        Scan untuk pembayaran
                        <br />
                        Rp {totalCost.toLocaleString("id-ID")}
                      </p>
                      <p className="mt-1 text-[10px] font-semibold text-[#929892]">Ref: SHIPIN-{String(totalCost).slice(-4)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="mx-auto flex h-[84px] max-w-[270px] items-center justify-center rounded-[10px] border border-dashed border-[#c8d8c6] bg-[#f4faf2] text-center text-[11px] font-semibold tracking-[0.04em] text-[#6a806e]">
                    QRIS akan muncul setelah data inti lengkap
                  </div>
                )}
              </div>

              <p className="mx-auto mt-6 max-w-[250px] text-center text-[12px] leading-6 text-[#5b7a63]">
                Pindai kode QR di atas menggunakan aplikasi perbankan atau e-wallet Anda.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCreateShipment}
              className="mt-7 h-14 w-full rounded-full bg-[#175f31] text-[15px] font-bold text-white shadow-[0_18px_28px_rgba(23,95,49,0.24)] transition hover:bg-[#114a26]"
            >
              Konfirmasi & Bayar
            </button>
            {notice ? (
              <p
                className={`mt-3 text-center text-[12px] font-semibold ${
                  noticeTone === "error" ? "text-[#c62828]" : "text-[#1d6b3f]"
                }`}
              >
                {notice}
              </p>
            ) : null}

            <div className="mt-6 flex items-start gap-3 rounded-[999px] bg-[linear-gradient(180deg,rgba(203,250,191,0.82),rgba(181,242,171,0.82))] px-5 py-4 text-[12px] leading-6 text-[#2d6843] shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#daf7d1] text-[#1e713c]">
                <ShieldIcon className="h-4 w-4" />
              </span>
              <span>
                Pembayaran aman dengan enkripsi SSL 256-bit dan proteksi asuransi pengiriman.
              </span>
            </div>
          </aside>
        </section>

        <section className="mt-4 rounded-[22px] border border-[#e3e8e1] bg-[#f8faf8] px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[15px] font-bold text-[#223128]">Simpan Draft Pengiriman</p>
              <p className="mt-0.5 text-[12px] text-[#7a837d]">Belum siap mengirim sekarang? Simpan data Anda dan lanjutkan nanti.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="h-9 rounded-full border border-[#d6dcd4] px-4 text-[12px] font-semibold text-[#5e6d62]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveDraft}
                className="h-9 rounded-full border border-[#2a8b48] bg-[#eefaf0] px-4 text-[12px] font-semibold text-[#18663a]"
              >
                Simpan Draft
              </button>
            </div>
          </div>
          {draftInfo ? <p className="mt-3 text-[12px] font-semibold text-[#1d6b3f]">{draftInfo}</p> : null}
        </section>

        <section className="mt-5 rounded-[22px] border border-[#e3e8e1] bg-white px-5 py-8 text-center">
          <div className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#97ef9f] text-[#17633a]">
            <PrinterIcon className="h-5 w-5" />
          </div>
          <h3 className="text-[24px] font-extrabold tracking-[-0.03em] text-[#1d2b24]">Alur Cetak Resi</h3>
          <p className="mx-auto mt-2 max-w-[620px] text-[12px] leading-6 text-[#7b837d]">
            Setelah pembayaran dikonfirmasi, sistem akan otomatis menerbitkan ID resi
            <span className="font-bold text-[#1a673b]"> SPG-2034-XXXX</span>. Anda dapat memantau status pengiriman serta mencetak label dari menu histori.
          </p>
          <button
            type="button"
            onClick={handleGuideClick}
            className="mt-3 text-[12px] font-bold text-[#1d6b3f]"
          >
            Lihat Panduan Cetak Resi +
          </button>
          {guideInfo ? <p className="mt-2 text-[12px] font-semibold text-[#3d5f48]">{guideInfo}</p> : null}
        </section>
      </div>

      {isPaymentSuccessOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101712]/40 px-4">
          <div className="w-full max-w-[420px] rounded-[28px] bg-white p-6 shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#dff8d7] text-[#1b7f3e]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-8 w-8">
                <path d="m5 12 4.5 4.5L19 7" />
              </svg>
            </div>
            <h3 className="mt-4 text-center text-[24px] font-extrabold text-[#1d2e24]">Pembayaran Berhasil</h3>
            <p className="mt-2 text-center text-[14px] text-[#546358]">
              Pembayaran QRIS telah diterima.
            </p>
            <div className="mt-4 rounded-2xl bg-[#f3f8f1] px-4 py-3 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#68806d]">No. Resi</p>
              <p className="mt-1 text-[16px] font-extrabold text-[#1d6f3e]">{paidShipmentId}</p>
              <p className="mt-2 text-[12px] text-[#65766a]">Total Bayar</p>
              <p className="text-[22px] font-black text-[#173a28]">Rp {paidAmount.toLocaleString("id-ID")}</p>
            </div>
            <button
              type="button"
              onClick={handleGoToHistory}
              className="mt-5 h-12 w-full rounded-full bg-[#1a7332] text-[15px] font-bold text-white"
            >
              Lanjut ke Histori
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}

const inputClass =
  "w-full rounded-[14px] border border-[#d9dfd7] bg-white px-3 py-2 text-[13px] text-[#27352d] placeholder:text-[#9ca59e] focus:outline-none";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#415046]">{label}</span>
      {children}
    </label>
  );
}

function BlockCard({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <article className="rounded-[24px] border border-[#e3e8e1] bg-[#f8faf8] p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#1f9d48] text-[11px] font-bold text-white">
          {number}
        </span>
        <h2 className="text-[36px] font-extrabold tracking-[-0.04em] text-[#1f2d25]">{title}</h2>
      </div>
      {children}
    </article>
  );
}
