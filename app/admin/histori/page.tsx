"use client";

import { useEffect, useMemo, useState } from "react";

import { EyeIcon } from "@/components/icons";
import { deleteShipment, loadShipments, PaymentStatus, ShipmentRecord, ShipmentStatus, updateShipment } from "@/lib/admin-shipments";

const badgeStyles: Record<string, string> = {
  LUNAS: "bg-[#d9f8db] text-[#12743a]",
  "BELUM BAYAR": "bg-[#ffe7cf] text-[#e06612]",
  "DALAM PERJALANAN": "bg-[#8ef47d] text-[#12652d]",
  DIJADWALKAN: "bg-[#ececec] text-[#6d746f]",
  SAMPAI: "bg-[#8ef47d] text-[#12652d]"
};

function formatCurrency(amount: number) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M6.8 6 8 20h8l1.2-14" />
      <path d="M10 10v6" />
      <path d="M14 10v6" />
    </svg>
  );
}

export default function AdminHistoriPage() {
  const [rows, setRows] = useState<ShipmentRecord[]>([]);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"info" | "success">("info");

  useEffect(() => {
    const current = loadShipments();
    setRows(current);
    setSelectedId(current[0]?.id ?? null);
  }, []);

  const filteredRows = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return rows;

    return rows.filter((row) => {
      return (
        row.id.toLowerCase().includes(keyword) ||
        row.sender.toLowerCase().includes(keyword) ||
        row.receiver.toLowerCase().includes(keyword) ||
        row.destination.toLowerCase().includes(keyword)
      );
    });
  }, [query, rows]);

  const selectedRow = filteredRows.find((row) => row.id === selectedId) ?? filteredRows[0] ?? null;

  function handleUpdateStatus(id: string, status: ShipmentStatus) {
    const payment: PaymentStatus = status === "DIJADWALKAN" ? "BELUM BAYAR" : "LUNAS";
    const updated = updateShipment(id, { shipment: status, payment });
    setRows(updated);
    setMessageTone("success");
    setMessage(`Status ${id} diperbarui ke ${status}.`);
  }

  function handleDelete(id: string) {
    const updated = deleteShipment(id);
    setRows(updated);
    setMessageTone("success");
    setMessage(`Data ${id} berhasil dihapus.`);
    if (selectedId === id) {
      setSelectedId(updated[0]?.id ?? null);
    }
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#f2f5f1] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1540px]">
        <section>
          <h1 className="text-[34px] font-extrabold leading-none text-[#185338] md:text-[46px]">Histori Paket</h1>
          <p className="mt-2 text-[13px] text-[#445149] md:text-[16px]">
            Kelola, perbarui, dan hapus data pengiriman dari dashboard admin.
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

          {filteredRows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#d7dfd7] bg-[#f8faf8] p-8 text-center">
              <p className="text-[13px] font-semibold text-[#5f6d63]">Belum ada data yang cocok.</p>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-[#edf1ea]">
                  {["NO. RESI", "PIHAK TERLIBAT", "TUJUAN", "TANGGAL", "STATUS", "TOTAL", "AKSI"].map((heading) => (
                    <th key={heading} className="px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#6e796f]">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id} className="border-b border-[#edf1ea] last:border-b-0">
                    <td className="px-4 py-4 align-top">
                      <button
                        type="button"
                        onClick={() => setSelectedId(row.id)}
                        className="text-[15px] font-extrabold text-[#148a31]"
                      >
                        #{row.id}
                      </button>
                      <p className="mt-1 text-[12px] uppercase tracking-[0.05em] text-[#6a756c]">{row.type}</p>
                    </td>

                    <td className="px-4 py-4 align-top">
                      <p className="text-[15px] font-bold text-[#243526]">{row.sender}</p>
                      <p className="text-[14px] text-[#5e695f]">ke {row.receiver}</p>
                    </td>

                    <td className="px-4 py-4 align-top text-[14px] text-[#2b362c]">{row.destination}</td>
                    <td className="px-4 py-4 align-top text-[14px] text-[#2b362c]">{row.date}</td>

                    <td className="px-4 py-4 align-top">
                      <div className="space-y-2">
                        <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold ${badgeStyles[row.payment]}`}>
                          {row.payment}
                        </span>
                        <select
                          value={row.shipment}
                          onChange={(event) => handleUpdateStatus(row.id, event.target.value as ShipmentStatus)}
                          className={`block rounded-full px-3 py-1 text-[11px] font-bold ${badgeStyles[row.shipment]} outline-none`}
                        >
                          <option value="DIJADWALKAN">DIJADWALKAN</option>
                          <option value="DALAM PERJALANAN">DALAM PERJALANAN</option>
                          <option value="SAMPAI">SAMPAI</option>
                        </select>
                      </div>
                    </td>

                    <td className="px-4 py-4 align-top text-[15px] font-extrabold text-[#2a362c]">{formatCurrency(row.total)}</td>

                    <td className="px-4 py-4 align-top">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedId(row.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f4ef] text-[#47604f]"
                          aria-label="Pilih data"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(row.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#fde9e7] text-[#b9473f]"
                          aria-label="Hapus data"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </section>

        {selectedRow ? (
          <section className="mt-4 rounded-[24px] border border-[#e5ebe5] bg-white p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#6d786f]">Data Terpilih</p>
            <h2 className="mt-2 text-[24px] font-extrabold text-[#203229]">{selectedRow.id}</h2>
            <p className="mt-2 text-[14px] text-[#4d5a53]">
              {selectedRow.sender} ke {selectedRow.receiver} - {selectedRow.destination}
            </p>
          </section>
        ) : null}
      </div>
    </main>
  );
}
