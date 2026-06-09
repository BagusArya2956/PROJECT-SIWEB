"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

import { EyeIcon } from "@/components/icons";
import {
  fetchShipmentsFromDatabase,
  fetchVehiclesFromDatabase,
  getWaypointsFromShipment,
  PaymentStatus,
  runProgressCheck,
  ShipmentRecord,
  ShipmentStatus,
  updateShipmentInDatabase,
  VehicleOption
} from "@/lib/admin-shipments";
import { ADMIN_HISTORY_REFRESH_INTERVAL_MS } from "@/lib/tracking-config";

const TrackingMap = dynamic(
  () => import("@/components/public/tracking-map").then((mod) => mod.TrackingMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[380px] w-full bg-[#f2f5f1] flex items-center justify-center rounded-lg">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-[#148a31] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[11px] font-semibold text-[#6d786f]">Memuat peta...</p>
        </div>
      </div>
    )
  }
);

const badgeStyles: Record<string, string> = {
  LUNAS: "bg-[#d9f8db] text-[#12743a]",
  "BELUM BAYAR": "bg-[#fde2e2] text-[#c53030]",
  "DALAM PERJALANAN": "bg-[#dbeafe] text-[#1d4ed8]",
  DIJADWALKAN: "bg-[#ececec] text-[#6d746f]",
  SAMPAI: "bg-[#d9f8db] text-[#12743a]",
  SELESAI: "bg-[#d9f8db] text-[#12743a]",
  DALAM_PENGIRIMAN: "bg-[#fef3c7] text-[#b45309]"
};

function formatCurrency(amount: number) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

const ITEMS_PER_PAGE = 5;

function LoadingFallback() {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#f2f5f1] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1540px] rounded-[28px] border border-[#e5ebe5] bg-white p-6 text-[13px] font-semibold text-[#5f6d63]">
        Memuat data...
      </div>
    </main>
  );
}

function AdminHistoriContent() {
  const [rows, setRows] = useState<ShipmentRecord[]>([]);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"info" | "success">("info");
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  async function hydrateShipments() {
    const current = await fetchShipmentsFromDatabase();
    setRows(current);
    setSelectedId((previousId) => {
      if (previousId && current.some((row) => row.id === previousId)) {
        return previousId;
      }

      return current[0]?.id ?? null;
    });
  }

  useEffect(() => {
    document.title = "Histori Pengiriman | SHIPIN GO Admin";
  }, []);

  useEffect(() => {
    async function hydrate() {
      try {
        await runProgressCheck().catch(() => null);
        const [current, vehicleRows] = await Promise.all([
          fetchShipmentsFromDatabase(),
          fetchVehiclesFromDatabase()
        ]);
        setRows(current);
        setVehicles(vehicleRows);
        setSelectedId(current[0]?.id ?? null);
      } catch (error) {
        setMessageTone("info");
        setMessage(error instanceof Error ? error.message : "Gagal memuat data database.");
      } finally {
        setLoading(false);
      }
    }

    hydrate();
  }, []);

  useEffect(() => {
    const interval = window.setInterval(async () => {
      if (document.hidden) return;

      try {
        await runProgressCheck().catch(() => null);
        await hydrateShipments();
      } catch {
        // Keep the current admin view stable if background sync fails.
      }
    }, ADMIN_HISTORY_REFRESH_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, []);

  const filteredRows = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return rows;

    return rows.filter((row) => {
      return (
        row.id.toLowerCase().includes(keyword) ||
        row.sender.toLowerCase().includes(keyword) ||
        row.receiver.toLowerCase().includes(keyword) ||
        row.destination.toLowerCase().includes(keyword) ||
        (row.type || "").toLowerCase().includes(keyword) ||
        (row.itemName || "").toLowerCase().includes(keyword) ||
        (row.itemCategory || "").toLowerCase().includes(keyword)
      );
    });
  }, [query, rows]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / ITEMS_PER_PAGE));
  const paginatedRows = filteredRows.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const selectedRow = filteredRows.find((row) => row.id === selectedId) ?? filteredRows[0] ?? null;

  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (!isDetailModalOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDetailModalOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDetailModalOpen]);

  async function handleUpdateShipment(id: string, patch: Partial<ShipmentRecord>) {
    try {
      const updated = await updateShipmentInDatabase(id, patch);
      setRows(updated);
      setSelectedId(id);
      setMessageTone("success");
      setMessage(`Data ${id} berhasil diperbarui di database.`);
    } catch (error) {
      setMessageTone("info");
      setMessage(error instanceof Error ? error.message : "Data gagal diperbarui.");
    }
  }

  function handleUpdateStatus(id: string, status: ShipmentStatus) {
    const payment: PaymentStatus = status === "DIJADWALKAN" ? "BELUM BAYAR" : "LUNAS";
    handleUpdateShipment(id, { shipment: status, payment });
  }

  function openDetailModal(id: string) {
    setSelectedId(id);
    setIsDetailModalOpen(true);
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#f2f5f1] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1540px]">
        <section>
          <h1 className="text-[34px] font-extrabold leading-none text-[#185338] md:text-[46px]">Histori Paket</h1>
          <p className="mt-2 text-[13px] text-[#445149] md:text-[16px]">
            Kelola dan perbarui data pengiriman dari dashboard admin.
          </p>
        </section>

        <section className="mt-6 rounded-[28px] border border-[#e5ebe5] bg-white p-5 shadow-[0_10px_30px_rgba(25,45,33,0.06)]">
          {message ? (
            <p
              className={`mb-3 rounded-lg px-3 py-2 text-[12px] font-semibold ${
                messageTone === "success" ? "bg-[#eaf8ee] text-[#1f7a44]" : "bg-[#f2f5ef] text-[#5c6c62]"
              }`}
            >
              {message}
            </p>
          ) : null}
          <div className="mb-4">
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setCurrentPage(1);
                if (event.target.value.trim()) {
                  setMessageTone("info");
                  setMessage("Menampilkan hasil pencarian sesuai kata kunci.");
                } else {
                  setMessage("");
                }
              }}
              placeholder="Cari resi, pengirim, penerima, atau tujuan..."
              className="h-11 w-full rounded-xl border border-[#d8e0d8] bg-[#f6f8f4] px-4 text-sm text-[#2a372f] outline-none"
            />
          </div>

          {loading ? (
            <div className="rounded-xl border border-dashed border-[#d7dfd7] bg-[#f8faf8] p-8 text-center">
              <p className="text-[13px] font-semibold text-[#5f6d63]">Mengambil data dari database...</p>
            </div>
          ) : null}

          {!loading && filteredRows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#d7dfd7] bg-[#f8faf8] p-8 text-center">
              <p className="text-[13px] font-semibold text-[#5f6d63]">Belum ada data yang cocok.</p>
            </div>
          ) : (
          <div className="rounded-xl border border-[#edf1ea]">
            <div className="grid gap-3 p-3 md:hidden">
              {paginatedRows.map((row) => (
                <article key={row.id} className="rounded-3xl border border-[#e5ebe5] bg-[#fbfdf9] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <button
                        type="button"
                        onClick={() => setSelectedId(row.id)}
                        className="text-[15px] font-extrabold text-[#148a31]"
                      >
                        #{row.id}
                      </button>
                      <p className="mt-1 text-xs font-semibold text-[#6a756c]">{row.type} | {row.date}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openDetailModal(row.id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f4ef] text-[#47604f]"
                        aria-label="Tampilkan detail data"
                      >
                        <EyeIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm">
                    <div className="rounded-2xl bg-white/70 p-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#879188]">Pihak Terlibat</p>
                      <p className="mt-1 font-bold text-[#243526]">{row.sender}</p>
                      <p className="text-xs text-[#647066]">ke {row.receiver}</p>
                    </div>
                    <div className="rounded-2xl bg-white/70 p-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#879188]">Tujuan</p>
                      <p className="mt-1 text-xs font-semibold text-[#2b362c]">{row.destination}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <select
                      value={row.payment}
                      onChange={(event) => handleUpdateShipment(row.id, { payment: event.target.value as PaymentStatus })}
                      className={`rounded-full px-3 py-2 text-[10px] font-bold ${badgeStyles[row.payment]} outline-none`}
                    >
                      <option value="LUNAS">LUNAS</option>
                      <option value="BELUM BAYAR">BELUM BAYAR</option>
                    </select>
                    <select
                      value={row.shipment}
                      onChange={(event) => handleUpdateStatus(row.id, event.target.value as ShipmentStatus)}
                      className={`rounded-full px-3 py-2 text-[10px] font-bold ${badgeStyles[row.shipment]} outline-none`}
                    >
                      <option value="DIJADWALKAN">DIJADWALKAN</option>
                      <option value="DALAM PERJALANAN">DALAM PERJALANAN</option>
                      <option value="SAMPAI">SELESAI</option>
                    </select>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-[#f6f8f4] px-3 py-2">
                    <span className="text-xs font-bold text-[#5f6d63]">{formatCurrency(row.total)}</span>
                    <select
                      value={row.vehicleId ? String(row.vehicleId) : ""}
                      onChange={(event) => handleUpdateShipment(row.id, { vehicleId: Number(event.target.value) })}
                      className="max-w-[170px] rounded-lg border border-[#d8e0d8] bg-white px-2 py-1.5 text-[10px] text-[#2a372f] outline-none"
                    >
                      <option value="">Pilih kendaraan</option>
                      {vehicles.map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.vehicle_name} - {vehicle.plate_number}
                        </option>
                      ))}
                    </select>
                  </div>
                </article>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
            <table className="min-w-[1200px] w-full">
              <thead>
                <tr className="border-b border-[#edf1ea] bg-[#f8faf8]">
                  {["NO. RESI", "PIHAK TERLIBAT", "TUJUAN", "TANGGAL", "STATUS", "BARANG", "KENDARAAN", "TOTAL", "AKSI"].map((heading) => (
                    <th key={heading} className="px-3 py-3 text-left text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#6e796f] whitespace-nowrap">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((row) => (
                  <tr key={row.id} className="border-b border-[#edf1ea] hover:bg-[#fafcf9] last:border-b-0">
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => setSelectedId(row.id)}
                        className="text-[13px] font-extrabold text-[#148a31] whitespace-nowrap transition hover:text-[#0f6e27]"
                      >
                        #{row.id}
                      </button>
                      <p className="text-[10px] uppercase tracking-[0.05em] text-[#6a756c] transition">{row.type}</p>
                    </td>

                    <td className="px-3 py-3">
                      <p className="text-[13px] font-bold text-[#243526] whitespace-nowrap transition">{row.sender}</p>
                      <p className="text-[11px] text-[#5e695f] whitespace-nowrap transition">ke {row.receiver}</p>
                    </td>

                    <td className="px-3 py-3 text-[12px] text-[#2b362c] whitespace-nowrap transition">{row.destination}</td>
                    <td className="px-3 py-3 text-[12px] text-[#2b362c] whitespace-nowrap transition">{row.date}</td>

                    <td className="px-3 py-3">
                      <div className="flex flex-col gap-1 transition">
                        <select
                          value={row.payment}
                          onChange={(event) =>
                            handleUpdateShipment(row.id, { payment: event.target.value as PaymentStatus })
                          }
                          className={`rounded-full px-2 py-1 text-[9px] font-bold ${badgeStyles[row.payment]} outline-none cursor-pointer`}
                        >
                          <option value="LUNAS">LUNAS</option>
                          <option value="BELUM BAYAR">BELUM BAYAR</option>
                        </select>
                        <select
                          value={row.shipment}
                          onChange={(event) => handleUpdateStatus(row.id, event.target.value as ShipmentStatus)}
                          className={`rounded-full px-2 py-1 text-[9px] font-bold ${badgeStyles[row.shipment]} outline-none cursor-pointer`}
                        >
                          <option value="DIJADWALKAN">DIJADWALKAN</option>
                          <option value="DALAM PERJALANAN">DALAM PERJALANAN</option>
                          <option value="SAMPAI">SELESAI</option>
                        </select>
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      <div className="transition">
                        <select
                          value={row.itemStatus || "DIPROSES"}
                          onChange={(event) => handleUpdateShipment(row.id, { itemStatus: event.target.value })}
                          className={`rounded-full px-2 py-1 text-[9px] font-bold outline-none cursor-pointer ${
                            badgeStyles[row.itemStatus || "DIPROSES"] || "bg-[#f3f6f3] text-[#415046]"
                          }`}
                        >
                          <option value="DIPROSES">DIPROSES</option>
                          <option value="DALAM_PENGIRIMAN">DALAM PENGIRIMAN</option>
                          <option value="SAMPAI_TUJUAN">SAMPAI TUJUAN</option>
                          <option value="PENDING">PENDING</option>
                          <option value="SELESAI">SELESAI</option>
                        </select>
                        <p className="mt-1 max-w-[120px] truncate text-[9px] text-[#738076]">{row.itemNote || "-"}</p>
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      <div className="transition">
                        <select
                          value={row.vehicleId ? String(row.vehicleId) : ""}
                          onChange={(event) => handleUpdateShipment(row.id, { vehicleId: Number(event.target.value) })}
                          className="w-[150px] rounded-lg border border-[#d8e0d8] bg-[#f6f8f4] px-2 py-1.5 text-[10px] text-[#2a372f] outline-none cursor-pointer"
                        >
                          <option value="">Pilih kendaraan</option>
                          {vehicles.map((vehicle) => (
                            <option key={vehicle.id} value={vehicle.id}>
                              {vehicle.vehicle_name} - {vehicle.plate_number}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      <div className="transition">
                        <input
                          value={String(row.total)}
                          readOnly
                          disabled
                          className="w-[100px] cursor-not-allowed rounded-lg border border-[#d8e0d8] bg-[#eef2ec] px-2 py-1.5 text-[11px] font-extrabold text-[#2a362c] outline-none disabled:opacity-100"
                        />
                        <p className="mt-0.5 text-[9px] text-[#748076]">{formatCurrency(row.total)}</p>
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openDetailModal(row.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f0f4ef] text-[#47604f] transition-colors hover:bg-[#e4ebe3]"
                          aria-label="Tampilkan detail data"
                        >
                          <EyeIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            <div className="mt-4 flex flex-col items-center gap-3 border-t border-[#edf1ea] pt-4 text-[12px] font-semibold text-[#5f6d63] sm:flex-row sm:justify-between">
              <p>Menampilkan {paginatedRows.length} dari {filteredRows.length} data</p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#d6dcd4] text-[13px] text-[#47604f] transition-all disabled:cursor-not-allowed disabled:opacity-35 hover:border-[#8fd797] hover:bg-[#eefaf0]"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
                {Array.from({ length: totalPages }).map((_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-[13px] font-bold transition-all ${
                        currentPage === page
                          ? "bg-[#148a31] text-white shadow-[0_4px_12px_rgba(20,138,49,0.25)]"
                          : "border border-[#d6dcd4] text-[#47604f] hover:border-[#8fd797] hover:bg-[#eefaf0]"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#d6dcd4] text-[#47604f] transition-all disabled:cursor-not-allowed disabled:opacity-35 hover:border-[#8fd797] hover:bg-[#eefaf0]"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          )}
        </section>

        {isDetailModalOpen && selectedRow ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#172118]/45 px-4 py-6 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-detail-title"
            onClick={() => setIsDetailModalOpen(false)}
          >
            <article
              className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[28px] bg-white shadow-[0_28px_80px_rgba(21,38,25,0.28)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex flex-col gap-4 border-b border-[#edf1ea] bg-[#fbfdf9] px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#7e8d7f]">
                    Detail Histori Pengiriman
                  </p>
                  <h2 id="history-detail-title" className="mt-2 text-[26px] font-extrabold tracking-[-0.03em] text-[#223126]">
                    {selectedRow.id}
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-[#748076]">
                    {selectedRow.itemName || selectedRow.itemCategory || selectedRow.type} - {selectedRow.date}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] ${
                    selectedRow.shipment === "SELESAI" || selectedRow.shipment === "SAMPAI"
                      ? "bg-[#e7f9ee] text-[#1c8c4c]"
                      : selectedRow.shipment === "DALAM PERJALANAN"
                      ? "bg-[#fff4df] text-[#b7791f]"
                      : "bg-[#eef6ff] text-[#2d6cc4]"
                  }`}>
                    {selectedRow.shipment}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsDetailModalOpen(false)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#dfe7dd] bg-white text-[#5d6a60] transition hover:bg-[#f4f8f1]"
                    aria-label="Tutup detail histori"
                  >
                    <span className="text-2xl leading-none">&times;</span>
                  </button>
                </div>
              </div>

              <div className="max-h-[calc(92vh-118px)] overflow-y-auto px-5 py-5 sm:px-6">
                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="rounded-[20px] border border-[#e8eee5] bg-[#f7faf4] p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8e988f]">Pengirim</p>
                    <p className="mt-3 text-[17px] font-extrabold text-[#223126]">{selectedRow.sender}</p>
                    <p className="mt-1 text-sm text-[#667269]">{selectedRow.senderPhone || "-"}</p>
                    <p className="mt-1 text-sm leading-5 text-[#667269]">{selectedRow.senderAddress || selectedRow.originCity || "-"}</p>
                  </div>
                  <div className="rounded-[20px] border border-[#e8eee5] bg-[#f7faf4] p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8e988f]">Penerima</p>
                    <p className="mt-3 text-[17px] font-extrabold text-[#223126]">{selectedRow.receiver}</p>
                    <p className="mt-1 text-sm text-[#667269]">{selectedRow.receiverPhone || "-"}</p>
                    <p className="mt-1 text-sm leading-5 text-[#667269]">{selectedRow.receiverAddress || selectedRow.destinationCity || selectedRow.destination}</p>
                  </div>
                  <div className="rounded-[20px] border border-[#e8eee5] bg-[#f7faf4] p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8e988f]">Rute</p>
                    <p className="mt-3 text-[17px] font-extrabold text-[#223126]">{selectedRow.originCity || "-"}</p>
                    <p className="mt-1 text-sm font-semibold text-[#148a31]">menuju</p>
                    <p className="mt-1 text-[17px] font-extrabold text-[#223126]">{selectedRow.destinationCity || selectedRow.destination}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                  <section className="rounded-[22px] border border-[#e8eee5] bg-white p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8e988f]">Detail Barang</p>
                        <h3 className="mt-2 text-xl font-extrabold text-[#223126]">{selectedRow.itemName || "-"}</h3>
                      </div>
                      <span className="w-fit rounded-full bg-[#eaf8ee] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#1d7f33]">
                        {selectedRow.itemStatus || "DIPROSES"}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {[
                        ["Jenis Barang", selectedRow.itemCategory || "-"],
                        ["Berat", `${(selectedRow.weightKg || 0).toFixed(2)} kg`],
                        [
                          "Dimensi",
                          `${selectedRow.lengthCm || 0} x ${selectedRow.widthCm || 0} x ${selectedRow.heightCm || 0} cm`
                        ],
                        ["Catatan", selectedRow.itemNote || "-"]
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-[16px] bg-[#f4f8f1] px-4 py-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8e988f]">{label}</p>
                          <p className="mt-2 text-sm font-bold text-[#273228]">{value}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-[22px] border border-[#e8eee5] bg-white p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8e988f]">Operasional</p>
                    <div className="mt-4 space-y-3">
                      {[
                        ["Layanan", selectedRow.service || selectedRow.type],
                        ["Kendaraan", selectedRow.vehicleName ? `${selectedRow.vehicleName} - ${selectedRow.plateNumber || "-"}` : "-"],
                        ["Pembayaran", selectedRow.payment],
                        ["Total", formatCurrency(selectedRow.total)]
                      ].map(([label, value]) => (
                        <div key={label} className="flex items-start justify-between gap-4 border-b border-[#edf1ea] pb-3 last:border-b-0 last:pb-0">
                          <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#8e988f]">{label}</p>
                          <p className="text-right text-sm font-extrabold text-[#223126]">{value}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </article>
          </div>
        ) : null}

        {selectedRow ? (
          <section className="mt-4 rounded-[24px] border border-[#e5ebe5] bg-white overflow-hidden shadow-[0_10px_30px_rgba(25,45,33,0.06)]">
            {/* Header */}
            <div className="bg-[#148a31] px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#a3ddb0]">Lacak Pengiriman</p>
                  <h2 className="mt-1 text-[22px] font-extrabold text-white">{selectedRow.id}</h2>
                </div>
                <div className={`rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide ${
                  selectedRow.shipment === "SELESAI" || selectedRow.shipment === "SAMPAI"
                    ? "bg-[#22c55e] text-white"
                    : selectedRow.shipment === "DALAM PERJALANAN"
                    ? "bg-[#f97316] text-white animate-pulse"
                    : "bg-white/20 text-white"
                }`}>
                  {selectedRow.shipment}
                </div>
              </div>
            </div>

            {/* Tracking Map */}
            <TrackingMap
              origin={(() => {
                const wp = getWaypointsFromShipment(selectedRow);
                if (selectedRow.koordinatAsalLat && selectedRow.koordinatAsalLng) {
                  return { lat: selectedRow.koordinatAsalLat, lng: selectedRow.koordinatAsalLng, label: wp.senderArea };
                }
                return { lat: wp.origin.lat, lng: wp.origin.lng, label: wp.senderArea };
              })()}
              destination={(() => {
                const wp = getWaypointsFromShipment(selectedRow);
                if (selectedRow.koordinatTujuanLat && selectedRow.koordinatTujuanLng) {
                  return { lat: selectedRow.koordinatTujuanLat, lng: selectedRow.koordinatTujuanLng, label: wp.receiverArea };
                }
                return { lat: wp.destination.lat, lng: wp.destination.lng, label: wp.receiverArea };
              })()}
              latest={selectedRow.latestLat && selectedRow.latestLng
                ? { lat: selectedRow.latestLat, lng: selectedRow.latestLng, label: selectedRow.latestLocationLabel || "Lokasi Terkini" }
                : null}
              waktuBerangkat={selectedRow.waktuBerangkat ?? null}
              durasiEstimasiMs={selectedRow.durasiEstimasiMs ?? null}
              heightClassName="h-[380px]"
              zoom={7}
            />

            {/* Route Info */}
            <div className="px-5 py-4 border-t border-[#edf1ea]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Asal */}
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#dbeafe]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" className="h-4 w-4">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6d786f]">Asal</p>
                    <p className="mt-0.5 text-[13px] font-bold text-[#203229]">{selectedRow.sender}</p>
                    <p className="text-[11px] text-[#5e695f]">{selectedRow.senderAddress || selectedRow.originCity || "-"}</p>
                  </div>
                </div>

                {/* Progress indicator */}
                <div className="flex flex-col items-center justify-center">
                  <div className="flex w-full items-center gap-2">
                    <div className="h-1 flex-1 rounded-full bg-[#e5ebe5] overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${
                        selectedRow.shipment === "SELESAI" || selectedRow.shipment === "SAMPAI"
                          ? "w-full bg-[#22c55e]"
                          : selectedRow.shipment === "DALAM PERJALANAN"
                          ? "w-2/3 bg-[#f97316]"
                          : "w-1/4 bg-[#3b82f6]"
                      }`}/>
                    </div>
                    <svg viewBox="0 0 24 24" fill="none" stroke={selectedRow.shipment === "DALAM PERJALANAN" ? "#f97316" : "#22c55e"} strokeWidth="2" className="h-5 w-5 shrink-0">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                  <p className="mt-2 text-[11px] text-[#5e695f] text-center">
                    {selectedRow.shipment === "SELESAI" || selectedRow.shipment === "SAMPAI"
                      ? "✓ Paket telah sampai tujuan"
                      : selectedRow.shipment === "DALAM PERJALANAN"
                      ? `📦 ${selectedRow.latestLocationLabel || "Sedang dalam perjalanan"}`
                      : "⏳ Menunggu keberangkatan"}
                  </p>
                </div>

                {/* Tujuan */}
                <div className="flex items-start gap-3 md:justify-end">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6d786f]">Tujuan</p>
                    <p className="mt-0.5 text-[13px] font-bold text-[#203229]">{selectedRow.receiver}</p>
                    <p className="text-[11px] text-[#5e695f]">{selectedRow.receiverAddress || selectedRow.destinationCity || selectedRow.destination}</p>
                  </div>
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d9f8db]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" className="h-4 w-4">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Detail Info */}
            <div className="px-5 py-3 border-t border-[#edf1ea] bg-[#f8faf8] grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
              <div>
                <p className="font-bold text-[#6d786f] uppercase tracking-[0.05em]">Tipe</p>
                <p className="mt-0.5 font-bold text-[#203229]">{selectedRow.type}</p>
              </div>
              <div>
                <p className="font-bold text-[#6d786f] uppercase tracking-[0.05em]">Nama Barang</p>
                <p className="mt-0.5 font-bold text-[#203229]">{selectedRow.itemName || "-"}</p>
              </div>
              <div>
                <p className="font-bold text-[#6d786f] uppercase tracking-[0.05em]">Jenis Barang</p>
                <p className="mt-0.5 font-bold text-[#203229]">{selectedRow.itemCategory || "-"}</p>
              </div>
              <div>
                <p className="font-bold text-[#6d786f] uppercase tracking-[0.05em]">Layanan</p>
                <p className="mt-0.5 font-bold text-[#203229]">{selectedRow.service || selectedRow.type}</p>
              </div>
              <div>
                <p className="font-bold text-[#6d786f] uppercase tracking-[0.05em]">Total</p>
                <p className="mt-0.5 font-bold text-[#148a31]">{formatCurrency(selectedRow.total)}</p>
              </div>
              <div>
                <p className="font-bold text-[#6d786f] uppercase tracking-[0.05em]">Dimensi</p>
                <p className="mt-0.5 font-bold text-[#203229]">
                  {selectedRow.lengthCm || 0} x {selectedRow.widthCm || 0} x {selectedRow.heightCm || 0} cm
                </p>
              </div>
              <div>
                <p className="font-bold text-[#6d786f] uppercase tracking-[0.05em]">Pembayaran</p>
                <p className={`mt-0.5 font-bold ${selectedRow.payment === "LUNAS" ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                  {selectedRow.payment}
                </p>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

export default function AdminHistoriPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AdminHistoriContent />
    </Suspense>
  );
}
