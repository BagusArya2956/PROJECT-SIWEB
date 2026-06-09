"use client";

import { useEffect, useMemo, useState } from "react";

import {
  CheckIcon,
  ClipboardIcon,
  EyeIcon,
  HistoryIcon,
  MoneyIcon,
  PackageIcon,
  PrinterIcon,
  SearchIcon,
  TruckIcon
} from "@/components/icons";
import {
  fetchShipmentsFromDatabase,
  PaymentStatus as HistoryPaymentStatus,
  ShipmentRecord,
  ShipmentStatus as HistoryShipmentStatus,
  updateShipmentInDatabase
} from "@/lib/admin-shipments";
import { ADMIN_HISTORY_REFRESH_INTERVAL_MS } from "@/lib/tracking-config";

type ShipmentStatus = "Dikirim" | "Selesai" | "Pending";
type PaymentStatus = "Lunas" | "Menunggu";
type ServiceType = "Reguler" | "Same-Day" | "Ekspres";

type ShipmentRow = {
  id: string;
  itemName?: string;
  itemCategory?: string;
  itemNote?: string;
  sender: string;
  senderPhone?: string;
  senderCity: string;
  receiver: string;
  receiverPhone?: string;
  receiverCity: string;
  weightKg?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  createdAt: number;
  dayIndex: number;
  status: ShipmentStatus;
  payment: PaymentStatus;
  service: ServiceType;
  amount: number;
};

const dayLabels = ["S", "S", "R", "K", "J", "S", "M"];
const longDayLabels = ["SEN", "SEL", "RAB", "KAM", "JUM", "SAB", "MIN"];

const statusOptions = ["Semua", "Dikirim", "Selesai", "Pending"] as const;
const paymentOptions = ["Semua", "Lunas", "Menunggu"] as const;
const serviceOptions = ["Semua", "Reguler", "Same-Day", "Ekspres"] as const;
const ITEMS_PER_PAGE = 5;

function toDayStart(value: string) {
  return value ? new Date(`${value}T00:00:00`).getTime() : null;
}

function toDayEnd(value: string) {
  return value ? new Date(`${value}T23:59:59.999`).getTime() : null;
}

function formatDateRangeLabel(startDate: string, endDate: string) {
  if (!startDate && !endDate) {
    return "Semua tanggal";
  }

  if (startDate && !endDate) {
    const start = new Date(`${startDate}T00:00:00`);
    return `Mulai ${start.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short"
    })}`;
  }

  if (!startDate && endDate) {
    const end = new Date(`${endDate}T00:00:00`);
    return `Sampai ${end.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short"
    })}`;
  }

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  return `${start.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short"
  })} - ${end.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short"
  })}`;
}

function formatCurrency(amount: number) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function escapeHtml(value: string | number | null | undefined) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function statusBadgeTone(status: ShipmentStatus) {
  if (status === "Selesai") return "bg-[#28a745] text-white";
  if (status === "Pending") return "bg-[#f59e0b] text-white";
  return "bg-[#7c3aed] text-white";
}

function mapHistoryShipmentStatus(status: HistoryShipmentStatus): ShipmentStatus {
  if (status === "SAMPAI") return "Selesai";
  if (status === "DIJADWALKAN") return "Pending";
  return "Dikirim";
}

function toHistoryShipmentStatus(status: ShipmentStatus): HistoryShipmentStatus {
  if (status === "Selesai") return "SAMPAI";
  if (status === "Pending") return "DIJADWALKAN";
  return "DALAM PERJALANAN";
}

function mapHistoryPaymentStatus(status: HistoryPaymentStatus): PaymentStatus {
  return status === "LUNAS" ? "Lunas" : "Menunggu";
}

function toHistoryPaymentStatus(status: PaymentStatus): HistoryPaymentStatus {
  return status === "Lunas" ? "LUNAS" : "BELUM BAYAR";
}

function mapHistoryService(service?: ShipmentRecord["service"]): ServiceType {
  if (service === "EKSPRES") return "Ekspres";
  return "Reguler";
}

function extractCityFromAddress(value?: string) {
  if (!value) return "-";
  const tokens = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (!tokens.length) return "-";
  if (tokens.length >= 3) return tokens[tokens.length - 3];
  return tokens[tokens.length - 1];
}

function mapShipmentRows(rows: ShipmentRecord[]): ShipmentRow[] {
  return rows.map((row) => {
    const dayIndex = ((new Date(row.createdAt).getDay() + 6) % 7) || 0;
    return {
      id: row.id,
      itemName: row.itemName,
      itemCategory: row.itemCategory,
      itemNote: row.itemNote,
      sender: row.sender,
      senderPhone: row.senderPhone,
      senderCity: row.originCity || extractCityFromAddress(row.senderAddress),
      receiver: row.receiver,
      receiverPhone: row.receiverPhone,
      receiverCity: row.destinationCity || extractCityFromAddress(row.receiverAddress),
      weightKg: row.weightKg,
      lengthCm: row.lengthCm,
      widthCm: row.widthCm,
      heightCm: row.heightCm,
      createdAt: row.createdAt,
      dayIndex,
      status: mapHistoryShipmentStatus(row.shipment),
      payment: mapHistoryPaymentStatus(row.payment),
      service: mapHistoryService(row.service),
      amount: row.total
    };
  });
}

function buildSparkline(values: number[]) {
  const width = 260;
  const height = 130;
  const paddingX = 10;
  const paddingY = 16;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(1, max - min);
  const step = (width - paddingX * 2) / (values.length - 1);

  const pointItems = values.map((value, index) => {
    const x = paddingX + index * step;
    const y = height - paddingY - ((value - min) / range) * (height - paddingY * 2);
    return { x, y, value };
  });
  const points = pointItems.map((point) => `${point.x},${point.y}`).join(" ");
  const areaPath = [
    `M ${pointItems[0].x} ${height - paddingY}`,
    ...pointItems.map((point, index) => `${index === 0 ? "L" : "L"} ${point.x} ${point.y}`),
    `L ${pointItems[pointItems.length - 1].x} ${height - paddingY}`,
    "Z"
  ].join(" ");
  const gridLines = [0.25, 0.5, 0.75].map((ratio) => paddingY + ratio * (height - paddingY * 2));

  return { areaPath, gridLines, points, pointItems, width, height };
}

function formatCompactCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    notation: "compact",
    maximumFractionDigits: 1
  }).format(amount);
}

export function AdminDashboard() {
  const [shipmentRows, setShipmentRows] = useState<ShipmentRow[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]>("Semua");
  const [paymentFilter, setPaymentFilter] = useState<(typeof paymentOptions)[number]>("Semua");
  const [serviceFilter, setServiceFilter] = useState<(typeof serviceOptions)[number]>("Semua");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let active = true;

    const hydrate = async () => {
      const currentRows = mapShipmentRows(await fetchShipmentsFromDatabase());
      if (!active) return;
      setShipmentRows(currentRows);
      setSelectedShipmentId((currentId) =>
        currentId && currentRows.some((row) => row.id === currentId) ? currentId : currentRows[0]?.id || null
      );
    };

    hydrate().catch(() => setShipmentRows([]));

    const interval = window.setInterval(() => {
      if (document.hidden) return;
      hydrate().catch(() => null);
    }, ADMIN_HISTORY_REFRESH_INTERVAL_MS);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const filteredShipments = useMemo(() => {
    const startAt = toDayStart(startDate);
    const endAt = toDayEnd(endDate);

    return shipmentRows.filter((shipment) => {
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        shipment.id.toLowerCase().includes(query) ||
        shipment.sender.toLowerCase().includes(query) ||
        shipment.receiver.toLowerCase().includes(query);

      const matchesStatus = statusFilter === "Semua" || shipment.status === statusFilter;
      const matchesPayment = paymentFilter === "Semua" || shipment.payment === paymentFilter;
      const matchesService = serviceFilter === "Semua" || shipment.service === serviceFilter;
      const matchesDate =
        (!startAt || shipment.createdAt >= startAt) &&
        (!endAt || shipment.createdAt <= endAt);

      return matchesSearch && matchesStatus && matchesPayment && matchesService && matchesDate;
    });
  }, [endDate, paymentFilter, search, serviceFilter, shipmentRows, startDate, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredShipments.length / ITEMS_PER_PAGE));
  const paginatedShipments = filteredShipments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const selectedShipment =
    filteredShipments.find((shipment) => shipment.id === selectedShipmentId) ?? filteredShipments[0] ?? null;

  useEffect(() => {
    setSelectedShipmentId((currentId) =>
      currentId && filteredShipments.some((shipment) => shipment.id === currentId)
        ? currentId
        : filteredShipments[0]?.id || null
    );
  }, [filteredShipments]);

  useEffect(() => {
    setCurrentPage(1);
  }, [endDate, paymentFilter, search, serviceFilter, startDate, statusFilter]);

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

  const chartMetrics = useMemo(() => {
    const packageSeries = Array.from({ length: 7 }, () => 0);
    const revenueSeries = Array.from({ length: 7 }, () => 0);

    filteredShipments.forEach((shipment) => {
      packageSeries[shipment.dayIndex] += 1;
      revenueSeries[shipment.dayIndex] += shipment.amount;
    });

    return {
      weeklyPackages: packageSeries,
      weeklyRevenue: revenueSeries
    };
  }, [filteredShipments]);

  const totals = useMemo(() => {
    const revenue = filteredShipments.reduce((sum, row) => sum + row.amount, 0);
    const success = filteredShipments.filter((row) => row.status === "Selesai").length;
    const pending = filteredShipments.filter((row) => row.status === "Pending").length;
    const shipped = filteredShipments.filter((row) => row.status === "Dikirim").length;

    return {
      transaksi: filteredShipments.length,
      paket: filteredShipments.length,
      pendapatan: revenue,
      berhasil: success,
      pending,
      dikirim: shipped
    };
  }, [filteredShipments]);

  async function updateShipmentStatus(id: string, nextStatus: ShipmentStatus) {
    const current = shipmentRows.find((row) => row.id === id);
    const inferredPayment: PaymentStatus =
      nextStatus === "Pending" ? "Menunggu" : current?.payment === "Menunggu" ? "Lunas" : current?.payment || "Lunas";

    const updated = await updateShipmentInDatabase(id, {
      shipment: toHistoryShipmentStatus(nextStatus),
      payment: toHistoryPaymentStatus(inferredPayment)
    });
    setShipmentRows(mapShipmentRows(updated));
    setSelectedShipmentId(id);
  }

  function printShipmentLabel() {
    const target = selectedShipment ?? filteredShipments[0];

    if (!target) return;

    const printedAt = new Date().toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
    const createdAt = new Date(target.createdAt).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
    const dimension = `${target.lengthCm || 0} x ${target.widthCm || 0} x ${target.heightCm || 0} cm`;
    const weight = `${(target.weightKg || 0).toFixed(2)} kg`;
    const barcodeBars = target.id
      .split("")
      .map((char, index) => {
        const width = ((char.charCodeAt(0) + index) % 4) + 2;
        return `<span style="width:${width}px"></span>`;
      })
      .join("");

    const receipt = {
      id: escapeHtml(target.id),
      sender: escapeHtml(target.sender),
      senderCity: escapeHtml(target.senderCity),
      senderPhone: escapeHtml(target.senderPhone || "-"),
      receiver: escapeHtml(target.receiver),
      receiverCity: escapeHtml(target.receiverCity),
      receiverPhone: escapeHtml(target.receiverPhone || "-"),
      service: escapeHtml(target.service),
      status: escapeHtml(target.status),
      payment: escapeHtml(target.payment),
      amount: escapeHtml(formatCurrency(target.amount)),
      itemName: escapeHtml(target.itemName || "-"),
      itemCategory: escapeHtml(target.itemCategory || "-"),
      itemNote: escapeHtml(target.itemNote || "-"),
      dimension: escapeHtml(dimension),
      weight: escapeHtml(weight),
      createdAt: escapeHtml(createdAt),
      printedAt: escapeHtml(printedAt)
    };

    const printWindow = window.open("", "_blank", "width=840,height=980");
    if (!printWindow) return;

    printWindow.document.write(`
      <!doctype html>
      <html lang="id">
        <head>
          <title>Cetak Resi ${receipt.id}</title>
          <style>
            * { box-sizing: border-box; }
            body {
              margin: 0;
              background: #e8efe5;
              color: #172118;
              font-family: Inter, Arial, Helvetica, sans-serif;
              padding: 28px;
            }
            .receipt {
              width: 760px;
              margin: 0 auto;
              overflow: hidden;
              border: 1px solid #cfdccc;
              border-radius: 22px;
              background: #ffffff;
              box-shadow: 0 18px 54px rgba(30, 54, 34, 0.16);
            }
            .top {
              display: grid;
              grid-template-columns: 1.2fr 0.8fr;
              gap: 20px;
              padding: 26px 28px;
              color: #ffffff;
              background: linear-gradient(135deg, #123d26 0%, #1a7f3f 100%);
            }
            .brand {
              margin: 0;
              font-size: 30px;
              line-height: 1;
              font-weight: 900;
              letter-spacing: 0.08em;
            }
            .tagline {
              margin: 8px 0 0;
              font-size: 12px;
              letter-spacing: 0.16em;
              text-transform: uppercase;
              color: rgba(255, 255, 255, 0.72);
            }
            .meta {
              text-align: right;
              font-size: 12px;
              line-height: 1.7;
              color: rgba(255, 255, 255, 0.84);
            }
            .meta strong {
              display: block;
              color: #ffffff;
              font-size: 18px;
              line-height: 1.2;
            }
            .hero {
              display: grid;
              grid-template-columns: 1fr 220px;
              gap: 20px;
              padding: 22px 28px;
              border-bottom: 1px dashed #cfdccc;
              background: #fbfdf9;
            }
            .label {
              margin: 0;
              color: #78847b;
              font-size: 10px;
              font-weight: 800;
              letter-spacing: 0.22em;
              text-transform: uppercase;
            }
            .resi {
              margin: 7px 0 0;
              color: #102017;
              font-size: 31px;
              font-weight: 900;
              letter-spacing: 0.04em;
            }
            .chip-row {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
              margin-top: 14px;
            }
            .chip {
              border-radius: 999px;
              background: #eaf8ee;
              color: #13723c;
              padding: 7px 11px;
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.08em;
            }
            .barcode {
              height: 76px;
              display: flex;
              align-items: stretch;
              justify-content: center;
              gap: 3px;
              border: 1px solid #dce6d8;
              border-radius: 14px;
              background: #ffffff;
              padding: 12px;
            }
            .barcode span {
              display: block;
              min-width: 2px;
              background: #172118;
              border-radius: 2px;
            }
            .barcode-text {
              margin-top: 8px;
              text-align: center;
              color: #667269;
              font-size: 10px;
              font-weight: 800;
              letter-spacing: 0.16em;
            }
            .content {
              padding: 24px 28px 28px;
            }
            .route {
              display: grid;
              grid-template-columns: 1fr 70px 1fr;
              gap: 16px;
              align-items: stretch;
            }
            .party, .box {
              border: 1px solid #e4ece2;
              border-radius: 18px;
              background: #f7faf4;
              padding: 17px;
            }
            .party h2, .box h2 {
              margin: 0 0 12px;
              color: #708078;
              font-size: 11px;
              font-weight: 900;
              letter-spacing: 0.18em;
              text-transform: uppercase;
            }
            .name {
              margin: 0;
              color: #172118;
              font-size: 18px;
              font-weight: 900;
            }
            .muted {
              margin: 6px 0 0;
              color: #5f6d63;
              font-size: 13px;
              line-height: 1.5;
            }
            .arrow {
              display: flex;
              align-items: center;
              justify-content: center;
              color: #147a3a;
              font-size: 26px;
              font-weight: 900;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 12px;
              margin-top: 16px;
            }
            .box {
              min-height: 94px;
            }
            .box p {
              margin: 0;
              color: #172118;
              font-size: 14px;
              font-weight: 800;
              line-height: 1.4;
            }
            .summary {
              display: grid;
              grid-template-columns: 1fr 230px;
              gap: 16px;
              margin-top: 16px;
            }
            .note {
              border: 1px solid #e4ece2;
              border-radius: 18px;
              padding: 17px;
            }
            .total {
              border-radius: 18px;
              background: #172118;
              color: #ffffff;
              padding: 18px;
            }
            .total .label {
              color: rgba(255, 255, 255, 0.62);
            }
            .total strong {
              display: block;
              margin-top: 8px;
              font-size: 24px;
              line-height: 1;
            }
            .footer {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              padding: 18px 28px;
              border-top: 1px dashed #cfdccc;
              color: #69766d;
              font-size: 11px;
              line-height: 1.5;
              background: #fbfdf9;
            }
            .footer strong {
              color: #172118;
            }
            @media print {
              body {
                background: #ffffff;
                padding: 0;
              }
              .receipt {
                width: 100%;
                border-radius: 0;
                box-shadow: none;
                border: 0;
              }
              @page {
                margin: 12mm;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <section class="top">
              <div>
                <h1 class="brand">SHIPIN GO</h1>
                <p class="tagline">Professional Shipping Receipt</p>
              </div>
              <div class="meta">
                Dicetak<br />
                <strong>${receipt.printedAt}</strong>
                Tanggal transaksi: ${receipt.createdAt}
              </div>
            </section>

            <section class="hero">
              <div>
                <p class="label">Nomor Resi</p>
                <p class="resi">${receipt.id}</p>
                <div class="chip-row">
                  <span class="chip">${receipt.service}</span>
                  <span class="chip">${receipt.status}</span>
                  <span class="chip">${receipt.payment}</span>
                </div>
              </div>
              <div>
                <div class="barcode">${barcodeBars}</div>
                <div class="barcode-text">${receipt.id}</div>
              </div>
            </section>

            <main class="content">
              <section class="route">
                <div class="party">
                  <h2>Pengirim</h2>
                  <p class="name">${receipt.sender}</p>
                  <p class="muted">${receipt.senderCity}</p>
                  <p class="muted">${receipt.senderPhone}</p>
                </div>
                <div class="arrow">-&gt;</div>
                <div class="party">
                  <h2>Penerima</h2>
                  <p class="name">${receipt.receiver}</p>
                  <p class="muted">${receipt.receiverCity}</p>
                  <p class="muted">${receipt.receiverPhone}</p>
                </div>
              </section>

              <section class="grid">
                <div class="box">
                  <h2>Nama Barang</h2>
                  <p>${receipt.itemName}</p>
                </div>
                <div class="box">
                  <h2>Jenis Barang</h2>
                  <p>${receipt.itemCategory}</p>
                </div>
                <div class="box">
                  <h2>Berat</h2>
                  <p>${receipt.weight}</p>
                </div>
                <div class="box">
                  <h2>Dimensi</h2>
                  <p>${receipt.dimension}</p>
                </div>
              </section>

              <section class="summary">
                <div class="note">
                  <p class="label">Catatan Barang</p>
                  <p class="muted">${receipt.itemNote}</p>
                </div>
                <div class="total">
                  <p class="label">Total Biaya</p>
                  <strong>${receipt.amount}</strong>
                </div>
              </section>
            </main>

            <section class="footer">
              <div>
                <strong>Instruksi pengiriman</strong><br />
                Simpan struk ini sebagai bukti transaksi. Pastikan nomor resi sesuai saat pelacakan.
              </div>
              <div>
                <strong>SHIPIN GO Admin</strong><br />
                Dokumen ini dibuat otomatis oleh sistem operasional SHIPIN GO.
              </div>
            </section>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  function printDashboardReport() {
    const printedAt = new Date().toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
    const reportRows = filteredShipments
      .map((shipment, index) => {
        return `
          <tr>
            <td>${index + 1}</td>
            <td><strong>${escapeHtml(shipment.id)}</strong><br /><span>${escapeHtml(shipment.service)}</span></td>
            <td>${escapeHtml(shipment.sender)}<br /><span>${escapeHtml(shipment.senderCity)}</span></td>
            <td>${escapeHtml(shipment.receiver)}<br /><span>${escapeHtml(shipment.receiverCity)}</span></td>
            <td>${escapeHtml(shipment.status)}</td>
            <td>${escapeHtml(shipment.payment)}</td>
            <td class="money">${escapeHtml(formatCurrency(shipment.amount))}</td>
          </tr>
        `;
      })
      .join("");
    const weeklyRows = longDayLabels
      .map((day, index) => {
        return `
          <tr>
            <td>${escapeHtml(day)}</td>
            <td>${chartMetrics.weeklyPackages[index].toLocaleString("id-ID")}</td>
            <td class="money">${escapeHtml(formatCurrency(chartMetrics.weeklyRevenue[index]))}</td>
          </tr>
        `;
      })
      .join("");
    const activeFilters = [
      `Pencarian: ${search.trim() || "Semua"}`,
      `Status: ${statusFilter}`,
      `Pembayaran: ${paymentFilter}`,
      `Layanan: ${serviceFilter}`,
      `Tanggal: ${formatDateRangeLabel(startDate, endDate)}`
    ];
    const cards = [
      { label: "Total Transaksi", value: totals.transaksi.toLocaleString("id-ID"), note: "Semua resi pada filter aktif" },
      { label: "Total Paket", value: totals.paket.toLocaleString("id-ID"), note: "Paket tercatat di dashboard" },
      { label: "Pendapatan", value: formatCurrency(totals.pendapatan), note: "Akumulasi nominal transaksi" },
      { label: "Paket Berhasil", value: totals.berhasil.toLocaleString("id-ID"), note: "Status selesai atau sampai" },
      { label: "Paket Pending", value: totals.pending.toLocaleString("id-ID"), note: "Menunggu proses berikutnya" },
      { label: "Sedang Dikirim", value: totals.dikirim.toLocaleString("id-ID"), note: "Resi dalam perjalanan aktif" }
    ];

    const printWindow = window.open("", "_blank", "width=1120,height=900");
    if (!printWindow) return;

    printWindow.document.write(`
      <!doctype html>
      <html lang="id">
        <head>
          <title>Cetak Laporan Dashboard SHIPIN GO</title>
          <style>
            * { box-sizing: border-box; }
            body {
              margin: 0;
              background: #eef5eb;
              color: #18251d;
              font-family: Inter, Arial, Helvetica, sans-serif;
              padding: 28px;
            }
            .report {
              max-width: 1040px;
              margin: 0 auto;
              border: 1px solid #cfdccc;
              border-radius: 24px;
              background: #ffffff;
              overflow: hidden;
              box-shadow: 0 18px 54px rgba(30, 54, 34, 0.14);
            }
            .top {
              display: grid;
              grid-template-columns: 1fr auto;
              gap: 22px;
              padding: 28px 30px;
              color: #ffffff;
              background: linear-gradient(135deg, #123d26 0%, #1a7f3f 100%);
            }
            h1, h2, p { margin: 0; }
            h1 {
              font-size: 30px;
              line-height: 1;
              letter-spacing: -0.03em;
            }
            .meta {
              text-align: right;
              font-size: 12px;
              line-height: 1.7;
              color: rgba(255,255,255,0.78);
            }
            .meta strong {
              display: block;
              color: #ffffff;
              font-size: 15px;
            }
            .content { padding: 26px 30px 30px; }
            .filters {
              display: grid;
              grid-template-columns: repeat(5, 1fr);
              gap: 10px;
              margin-bottom: 18px;
            }
            .filter, .card {
              border: 1px solid #e1eadf;
              border-radius: 16px;
              background: #f7faf4;
              padding: 13px;
            }
            .filter {
              color: #5d6d61;
              font-size: 11px;
              font-weight: 800;
              line-height: 1.45;
            }
            .cards {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 12px;
            }
            .card .label {
              color: #708078;
              font-size: 10px;
              font-weight: 900;
              letter-spacing: 0.18em;
              text-transform: uppercase;
            }
            .card strong {
              display: block;
              margin-top: 10px;
              color: #102017;
              font-size: 25px;
              line-height: 1;
            }
            .card span {
              display: block;
              margin-top: 8px;
              color: #607065;
              font-size: 12px;
              line-height: 1.45;
            }
            .grid {
              display: grid;
              grid-template-columns: 0.8fr 1.2fr;
              gap: 16px;
              margin-top: 20px;
            }
            .section {
              border: 1px solid #e1eadf;
              border-radius: 18px;
              overflow: hidden;
            }
            .section h2 {
              padding: 14px 16px;
              border-bottom: 1px solid #e1eadf;
              background: #f7faf4;
              color: #172118;
              font-size: 15px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 12px;
            }
            th {
              background: #fbfdf9;
              color: #6d7b70;
              font-size: 10px;
              letter-spacing: 0.12em;
              text-align: left;
              text-transform: uppercase;
            }
            th, td {
              border-bottom: 1px solid #e7eee5;
              padding: 10px 12px;
              vertical-align: top;
            }
            td span {
              color: #748076;
              font-size: 11px;
            }
            .money {
              white-space: nowrap;
              font-weight: 800;
              color: #153528;
            }
            .empty {
              padding: 18px;
              color: #748076;
              font-size: 13px;
              font-weight: 700;
              text-align: center;
            }
            .footer {
              margin-top: 20px;
              color: #6b766d;
              font-size: 11px;
              line-height: 1.6;
            }
            @media print {
              body { background: #ffffff; padding: 0; }
              .report { border-radius: 0; box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <main class="report">
            <section class="top">
              <div>
                <h1>Laporan Dashboard SHIPIN GO</h1>
                <p style="margin-top:8px;color:rgba(255,255,255,0.78);font-size:13px;">Ringkasan operasional pengiriman berdasarkan filter dashboard aktif.</p>
              </div>
              <div class="meta">
                <strong>${escapeHtml(printedAt)}</strong>
                Admin Area<br />SHIPIN GO
              </div>
            </section>
            <section class="content">
              <div class="filters">
                ${activeFilters.map((item) => `<div class="filter">${escapeHtml(item)}</div>`).join("")}
              </div>
              <div class="cards">
                ${cards
                  .map(
                    (card) => `
                      <div class="card">
                        <p class="label">${escapeHtml(card.label)}</p>
                        <strong>${escapeHtml(card.value)}</strong>
                        <span>${escapeHtml(card.note)}</span>
                      </div>
                    `
                  )
                  .join("")}
              </div>
              <div class="grid">
                <section class="section">
                  <h2>Tren Mingguan</h2>
                  <table>
                    <thead>
                      <tr><th>Hari</th><th>Paket</th><th>Pendapatan</th></tr>
                    </thead>
                    <tbody>${weeklyRows}</tbody>
                  </table>
                </section>
                <section class="section">
                  <h2>Daftar Transaksi</h2>
                  ${
                    reportRows
                      ? `<table>
                          <thead>
                            <tr>
                              <th>No</th>
                              <th>Resi</th>
                              <th>Pengirim</th>
                              <th>Penerima</th>
                              <th>Status</th>
                              <th>Bayar</th>
                              <th>Total</th>
                            </tr>
                          </thead>
                          <tbody>${reportRows}</tbody>
                        </table>`
                      : `<div class="empty">Belum ada transaksi yang cocok dengan filter aktif.</div>`
                  }
                </section>
              </div>
              <p class="footer">
                Laporan ini dibuat otomatis oleh sistem operasional SHIPIN GO berdasarkan data dashboard yang sedang aktif.
              </p>
            </section>
          </main>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  function openShipmentDetail(id: string) {
    setSelectedShipmentId(id);
    setIsDetailModalOpen(true);
  }

  const sparkline = buildSparkline(chartMetrics.weeklyRevenue);

  const quickActions = [
    {
      label: "Cetak Laporan",
      onClick: printDashboardReport,
      icon: <PrinterIcon className="h-4 w-4" />,
      className: "bg-white text-[#495249]"
    }
  ];

  const summaryCards = [
    {
      label: "Total Transaksi",
      value: totals.transaksi,
      caption: "Semua resi pada filter aktif",
      chip: "Operasional",
      icon: <ClipboardIcon className="h-5 w-5" />,
      iconClassName: "bg-[#eff8ea] text-[#2f7a3f]",
      ringClassName: "from-[#dff4d7] via-white to-white",
      valueClassName: "text-[26px] sm:text-[30px]"
    },
    {
      label: "Total Paket",
      value: totals.paket,
      caption: "Paket tercatat di dashboard",
      chip: "Logistik",
      icon: <PackageIcon className="h-5 w-5" />,
      iconClassName: "bg-[#eef6ff] text-[#2d6cc4]",
      ringClassName: "from-[#dcecff] via-white to-white",
      valueClassName: "text-[26px] sm:text-[30px]"
    },
    {
      label: "Pendapatan",
      value: formatCurrency(totals.pendapatan),
      caption: "Akumulasi nominal transaksi",
      chip: "Keuangan",
      icon: <MoneyIcon className="h-5 w-5" />,
      iconClassName: "bg-[#fff4df] text-[#b7791f]",
      ringClassName: "from-[#ffedc8] via-white to-white",
      valueClassName: "text-[22px] sm:text-[25px] leading-none tracking-[-0.03em]",
      isCurrency: true
    },
    {
      label: "Paket Berhasil",
      value: totals.berhasil,
      caption: "Status selesai atau sampai",
      chip: "Sukses",
      icon: <CheckIcon className="h-5 w-5" />,
      iconClassName: "bg-[#e7f9ee] text-[#1c8c4c]",
      ringClassName: "from-[#d7f4e1] via-white to-white",
      valueClassName: "text-[26px] sm:text-[30px]"
    },
    {
      label: "Paket Pending",
      value: totals.pending,
      caption: "Menunggu proses berikutnya",
      chip: "Perhatian",
      icon: <HistoryIcon className="h-5 w-5" />,
      iconClassName: "bg-[#fff1ec] text-[#d05f38]",
      ringClassName: "from-[#ffe0d5] via-white to-white",
      valueClassName: "text-[26px] sm:text-[30px]"
    },
    {
      label: "Sedang Dikirim",
      value: totals.dikirim,
      caption: "Resi dalam perjalanan aktif",
      chip: "On Route",
      icon: <TruckIcon className="h-5 w-5" />,
      iconClassName: "bg-[#f0efff] text-[#5b57d9]",
      ringClassName: "from-[#e1dfff] via-white to-white",
      valueClassName: "text-[26px] sm:text-[30px]"
    }
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(185,250,165,0.5),_transparent_28%),linear-gradient(180deg,#f7fbf3_0%,#f0f7eb_100%)] p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <section className="admin-dashboard-hero rounded-[34px] bg-[radial-gradient(circle_at_top_left,_rgba(180,251,166,0.52),_transparent_30%),linear-gradient(180deg,#effbe9_0%,#e8f7e2_100%)] p-5 shadow-[0_24px_60px_rgba(175,209,157,0.22)] sm:p-6 lg:p-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#6aa05f]">
                Admin Overview
              </p>
              <h1 className="mt-3 text-[30px] font-extrabold tracking-[-0.04em] text-[#273228] sm:text-[36px]">
                Selamat Datang, Admin!
              </h1>
              <p className="mt-2 text-[15px] text-[#6c746d]">
                Pantau performa logistik UMKM Anda hari ini.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={action.onClick}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold shadow-[0_10px_20px_rgba(122,165,114,0.12)] ${action.className}`}
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            {summaryCards.map((card) => (
              <article
                key={card.label}
                className={`admin-summary-card group relative overflow-hidden rounded-[30px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(248,252,246,0.92)_100%)] p-5 shadow-[0_18px_40px_rgba(129,167,112,0.14)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_50px_rgba(129,167,112,0.2)]`}
              >
                <div className={`pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--tw-gradient-stops))] opacity-90 ${card.ringClassName}`} />
                <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(154,192,138,0.65),rgba(255,255,255,0))]" />
                <div className="relative flex items-start justify-between gap-3">
                  <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] ${card.iconClassName}`}>
                    {card.icon}
                  </span>
                  <span className="rounded-full border border-white/80 bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6f7d72] shadow-[0_8px_18px_rgba(152,182,138,0.08)]">
                    {card.chip}
                  </span>
                </div>
                <div className="relative mt-8">
                  <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#7a877d]">
                    {card.label}
                  </p>
                  <p className={`mt-3 font-extrabold text-[#223126] ${card.valueClassName || "text-[26px] sm:text-[30px] leading-none tracking-[-0.04em]"}`}>
                  {card.isCurrency ? (
                    <span className="inline-flex max-w-full items-baseline gap-1.5 whitespace-nowrap">
                      <span>Rp</span>
                      <span className="text-[20px] sm:text-[22px]">{totals.pendapatan.toLocaleString("id-ID")}</span>
                    </span>
                  ) : typeof card.value === "number" ? card.value.toLocaleString("id-ID") : card.value}
                  </p>
                  <p className="mt-3 text-[12px] leading-5 text-[#6f7b71]">
                    {card.caption}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.45fr_0.85fr]">
          <article className="admin-chart-card rounded-[34px] bg-white p-5 shadow-[0_18px_44px_rgba(155,184,143,0.18)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[24px] font-bold tracking-[-0.03em] text-[#2a332b]">
                  Tren Pendapatan & Paket
                </h2>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold text-[#67a55f]">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-[#68c86d]" />
                  Pendapatan
                </span>
                <span className="inline-flex items-center gap-1 text-[#1d7f33]">
                  <span className="h-2 w-2 rounded-full bg-[#1d7f33]" />
                  Paket
                </span>
              </div>
            </div>

            <div className="mt-6 grid h-[240px] grid-cols-7 items-end gap-3">
              {chartMetrics.weeklyPackages.map((value, index) => {
                const max = Math.max(...chartMetrics.weeklyPackages);
                const height = max > 0 ? `${(value / max) * 100}%` : "0%";
                const isPeak = value === max && value > 0;
                return (
                  <div key={longDayLabels[index]} className="flex h-full flex-col justify-end">
                    {isPeak ? (
                      <div className="mb-2 self-center rounded-full bg-[#2a332b] px-2.5 py-1 text-[10px] font-bold text-white">
                        {value}
                      </div>
                    ) : (
                      <div className="mb-2 h-6" />
                    )}
                    <div
                      className={`admin-chart-bar rounded-t-[22px] ${isPeak ? "bg-[#8fe987]" : "bg-[#eef3e8]"}`}
                      style={{ height, animationDelay: `${index * 120}ms` }}
                    />
                    <p className="mt-3 text-center text-[11px] font-semibold text-[#9aa39b]">
                      {longDayLabels[index]}
                    </p>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="admin-chart-card rounded-[34px] bg-white p-5 shadow-[0_18px_44px_rgba(155,184,143,0.18)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[24px] font-bold tracking-[-0.03em] text-[#2a332b]">
                  Tren Pendapatan Harian
                </h2>
              </div>
              <span className="rounded-full bg-[#dff8d7] px-3 py-1 text-[11px] font-bold text-[#4ba14e]">
                Puncak {formatCompactCurrency(Math.max(...chartMetrics.weeklyRevenue))}
              </span>
            </div>

            <div className="mt-8 rounded-[24px] border border-[#edf2e9] bg-[linear-gradient(180deg,#fbfdf9_0%,#f7fbf5_100%)] px-3 py-4">
              <svg viewBox={`0 0 ${sparkline.width} ${sparkline.height}`} className="h-[190px] w-full">
                <defs>
                  <linearGradient id="revenueLineGradient" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#116b35" />
                  </linearGradient>
                  <linearGradient id="revenueAreaGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0.02" />
                  </linearGradient>
                  <filter id="revenueLineShadow" x="-10%" y="-20%" width="120%" height="150%">
                    <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#15803d" floodOpacity="0.18" />
                  </filter>
                </defs>
                <g>
                  {sparkline.gridLines.map((line) => (
                    <line
                      key={line}
                      className="admin-chart-grid-line"
                      x1="10"
                      x2={sparkline.width - 10}
                      y1={line}
                      y2={line}
                      stroke="#e6eee4"
                      strokeDasharray="4 7"
                      strokeWidth="1"
                    />
                  ))}
                </g>
                <g className="admin-chart-line-float">
                  <path className="admin-chart-area-fill" d={sparkline.areaPath} fill="url(#revenueAreaGradient)" />
                  <polyline
                    className="admin-chart-line-draw"
                    fill="none"
                    stroke="url(#revenueLineGradient)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={sparkline.points}
                    filter="url(#revenueLineShadow)"
                  />
                  {sparkline.pointItems.map((point, index) => (
                    <g key={`${point.x}-${point.y}`} className="admin-chart-dot" style={{ animationDelay: `${index * 90 + 420}ms` }}>
                      <circle cx={point.x} cy={point.y} r={index === 0 ? "4.8" : "4"} fill="#ffffff" stroke="#15803d" strokeWidth="2.4" />
                      {point.value === Math.max(...chartMetrics.weeklyRevenue) && point.value > 0 ? (
                        <circle cx={point.x} cy={point.y} r="7" fill="none" stroke="#22c55e" strokeOpacity="0.18" strokeWidth="4" />
                      ) : null}
                    </g>
                  ))}
                </g>
              </svg>
              <div className="mt-2 flex justify-between px-1 text-[11px] font-semibold text-[#8d9a91]">
                {dayLabels.map((day, index) => (
                  <span key={`${day}-${index}`}>{day}</span>
                ))}
              </div>
            </div>
          </article>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 items-center gap-3 rounded-full bg-white px-5 py-4 shadow-[0_10px_24px_rgba(155,184,143,0.14)]">
              <SearchIcon className="h-4 w-4 text-[#8f9990]" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari Resi atau Pengirim..."
                className="w-full bg-transparent text-sm text-[#384138] outline-none placeholder:text-[#afb6af]"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value as (typeof statusOptions)[number]);
                  setCurrentPage(1);
                }}
                className="rounded-full bg-white px-4 py-3 text-sm text-[#505850] shadow-[0_10px_24px_rgba(155,184,143,0.14)] outline-none"
              >
                {statusOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <select
                value={paymentFilter}
                onChange={(event) => {
                  setPaymentFilter(event.target.value as (typeof paymentOptions)[number]);
                  setCurrentPage(1);
                }}
                className="rounded-full bg-white px-4 py-3 text-sm text-[#505850] shadow-[0_10px_24px_rgba(155,184,143,0.14)] outline-none"
              >
                {paymentOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <select
                value={serviceFilter}
                onChange={(event) => {
                  setServiceFilter(event.target.value as (typeof serviceOptions)[number]);
                  setCurrentPage(1);
                }}
                className="rounded-full bg-white px-4 py-3 text-sm text-[#505850] shadow-[0_10px_24px_rgba(155,184,143,0.14)] outline-none"
              >
                {serviceOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDatePickerOpen((current) => !current)}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-[#505850] shadow-[0_10px_24px_rgba(155,184,143,0.14)]"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-[#6b766b]">
                    <path d="M8 2v4M16 2v4M3 10h18" />
                    <rect x="3" y="4" width="18" height="17" rx="3" />
                  </svg>
                  <span>{formatDateRangeLabel(startDate, endDate)}</span>
                </button>

                {isDatePickerOpen ? (
                  <div className="absolute right-0 top-[calc(100%+10px)] z-20 w-[260px] rounded-[22px] border border-[#e2e9df] bg-white p-4 shadow-[0_20px_34px_rgba(155,184,143,0.2)]">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7b867d]">
                      Filter Tanggal
                    </p>
                    <div className="mt-3 space-y-3">
                      <label className="block">
                        <span className="mb-1 block text-[11px] font-semibold text-[#6a746b]">Mulai</span>
                        <input
                          type="date"
                          value={startDate}
                          max={endDate}
                          onChange={(event) => setStartDate(event.target.value)}
                          className="w-full rounded-[14px] border border-[#dfe7dd] px-3 py-2 text-[13px] outline-none"
                          aria-label="Tanggal mulai"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-[11px] font-semibold text-[#6a746b]">Sampai</span>
                        <input
                          type="date"
                          value={endDate}
                          min={startDate}
                          onChange={(event) => setEndDate(event.target.value)}
                          className="w-full rounded-[14px] border border-[#dfe7dd] px-3 py-2 text-[13px] outline-none"
                          aria-label="Tanggal akhir"
                        />
                      </label>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setStartDate("");
                          setEndDate("");
                        }}
                        className="rounded-full border border-[#dfe7dd] px-3 py-2 text-[12px] font-semibold text-[#566156]"
                      >
                        Reset
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsDatePickerOpen(false)}
                        className="rounded-full border border-[#dfe7dd] px-3 py-2 text-[12px] font-semibold text-[#566156]"
                      >
                        Tutup
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[32px] bg-white shadow-[0_18px_44px_rgba(155,184,143,0.18)]">
            <div className="grid gap-3 p-3 md:hidden">
              {paginatedShipments.map((shipment) => (
                <article
                  key={shipment.id}
                  className="rounded-3xl border border-[#e5ece2] bg-[#fbfdf9] p-4 shadow-[0_10px_24px_rgba(155,184,143,0.12)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <button
                        type="button"
                        onClick={() => setSelectedShipmentId(shipment.id)}
                        className="text-[15px] font-extrabold text-[#208640]"
                      >
                        {shipment.id}
                      </button>
                      <p className="mt-1 text-xs font-semibold text-[#788378]">
                        {shipment.service} | {formatCurrency(shipment.amount)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openShipmentDetail(shipment.id)}
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eef9e8] text-[#2f9344]"
                      aria-label="Tampilkan detail barang"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm">
                    <div className="rounded-2xl bg-white/70 p-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8a938a]">Pengirim</p>
                      <p className="mt-1 font-bold text-[#26332a]">{shipment.sender}</p>
                      <p className="text-xs text-[#707b71]">{shipment.senderCity} | {shipment.senderPhone || "-"}</p>
                    </div>
                    <div className="rounded-2xl bg-white/70 p-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8a938a]">Penerima</p>
                      <p className="mt-1 font-bold text-[#26332a]">{shipment.receiver}</p>
                      <p className="text-xs text-[#707b71]">{shipment.receiverCity}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#7c877d]">Status</span>
                    <select
                      value={shipment.status}
                      onChange={(event) => updateShipmentStatus(shipment.id, event.target.value as ShipmentStatus)}
                      className={`rounded-full px-3 py-1.5 text-xs font-bold outline-none ${statusBadgeTone(shipment.status)}`}
                    >
                      <option value="Dikirim">Dikirim</option>
                      <option value="Selesai">Selesai</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                </article>
              ))}

              {paginatedShipments.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-[#d9e3d8] p-6 text-center text-sm font-semibold text-[#7f887f]">
                  Belum ada transaksi yang cocok.
                </div>
              ) : null}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-left">
                <thead className="border-b border-[#edf0ea] text-[12px] uppercase tracking-[0.18em] text-[#97a196]">
                  <tr>
                    <th className="px-6 py-4">Resi</th>
                    <th className="px-6 py-4">Pengirim</th>
                    <th className="px-6 py-4">Telepon</th>
                    <th className="px-6 py-4">Penerima</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedShipments.map((shipment) => (
                    <tr key={shipment.id} className="border-b border-[#edf0ea] last:border-b-0">
                      <td className="px-6 py-5">
                        <button
                          type="button"
                          onClick={() => setSelectedShipmentId(shipment.id)}
                          className="font-bold text-[#2b8b45] transition hover:text-[#176b31]"
                        >
                          {shipment.id}
                        </button>
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-semibold text-[#2a332b] transition">{shipment.sender}</p>
                        <p className="text-sm text-[#8a938a] transition">{shipment.senderCity}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className="inline-block text-sm text-[#556055] transition"
                        >
                          {shipment.senderPhone || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-semibold text-[#2a332b] transition">{shipment.receiver}</p>
                        <p className="text-sm text-[#8a938a] transition">{shipment.receiverCity}</p>
                      </td>
                      <td className="px-6 py-5">
                        <select
                          value={shipment.status}
                          onChange={(event) =>
                            updateShipmentStatus(shipment.id, event.target.value as ShipmentStatus)
                          }
                          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold outline-none transition ${statusBadgeTone(shipment.status)}`}
                        >
                          <option value="Dikirim">Dikirim</option>
                          <option value="Selesai">Selesai</option>
                          <option value="Pending">Pending</option>
                        </select>
                      </td>
                      <td className="px-6 py-5 font-semibold text-[#444d44] transition">
                        {formatCurrency(shipment.amount)}
                      </td>
                      <td className="px-6 py-5">
                        <button
                          type="button"
                          onClick={() => openShipmentDetail(shipment.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#eef9e8] text-[#2f9344]"
                          aria-label="Tampilkan detail barang"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {paginatedShipments.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm font-semibold text-[#7f887f]">
                  Belum ada transaksi yang cocok.
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 border-t border-[#edf0ea] px-6 py-4 text-sm text-[#7f887f] sm:flex-row sm:items-center sm:justify-between">
              <p>
                Menampilkan {paginatedShipments.length} dari {filteredShipments.length} transaksi
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="rounded-full bg-[#f3f8ef] px-3 py-1.5 font-bold text-[#59705a] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Sebelumnya
                </button>
                <span className="font-semibold text-[#384138]">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-full bg-[#f3f8ef] px-3 py-1.5 font-bold text-[#59705a] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Berikutnya
                </button>
              </div>
              <div className="hidden">
                <button className="rounded-full bg-[#f3f8ef] px-3 py-1.5 text-[#59705a]">‹</button>
                <button className="rounded-full bg-[#f3f8ef] px-3 py-1.5 text-[#59705a]">›</button>
              </div>
            </div>
          </div>

          {isDetailModalOpen && selectedShipment ? (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-[#172118]/45 px-4 py-6 backdrop-blur-sm"
              role="dialog"
              aria-modal="true"
              aria-labelledby="shipment-detail-title"
              onClick={() => setIsDetailModalOpen(false)}
            >
              <article
                className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[28px] bg-white shadow-[0_28px_80px_rgba(21,38,25,0.28)]"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex flex-col gap-4 border-b border-[#edf1ea] bg-[#fbfdf9] px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#7e8d7f]">
                      Detail Resi
                    </p>
                    <h3 id="shipment-detail-title" className="mt-2 text-[26px] font-extrabold tracking-[-0.03em] text-[#223126]">
                      {selectedShipment.id}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-[#748076]">
                      {selectedShipment.itemName || "Barang"} - {selectedShipment.service}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={printShipmentLabel}
                      className="inline-flex items-center gap-2 rounded-full bg-[#9df28f] px-4 py-3 text-sm font-semibold text-[#175e35]"
                    >
                      <PrinterIcon className="h-4 w-4" />
                      Cetak Resi
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDetailModalOpen(false)}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#dfe7dd] bg-white text-[#5d6a60] transition hover:bg-[#f4f8f1]"
                      aria-label="Tutup detail barang"
                    >
                      <span className="text-2xl leading-none">&times;</span>
                    </button>
                  </div>
                </div>

                <div className="max-h-[calc(92vh-118px)] overflow-y-auto px-5 py-5 sm:px-6">
                  <div className="grid gap-4 lg:grid-cols-3">
                    <div className="rounded-[20px] border border-[#e8eee5] bg-[#f7faf4] p-4">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8e988f]">Pengirim</p>
                      <p className="mt-3 text-[17px] font-extrabold text-[#223126]">{selectedShipment.sender}</p>
                      <p className="mt-1 text-sm text-[#667269]">{selectedShipment.senderCity}</p>
                      <p className="text-sm text-[#667269]">{selectedShipment.senderPhone || "-"}</p>
                    </div>
                    <div className="rounded-[20px] border border-[#e8eee5] bg-[#f7faf4] p-4">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8e988f]">Penerima</p>
                      <p className="mt-3 text-[17px] font-extrabold text-[#223126]">{selectedShipment.receiver}</p>
                      <p className="mt-1 text-sm text-[#667269]">{selectedShipment.receiverCity}</p>
                      <p className="text-sm text-[#667269]">{selectedShipment.receiverPhone || "-"}</p>
                    </div>
                    <div className="rounded-[20px] border border-[#e8eee5] bg-[#f7faf4] p-4">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8e988f]">Layanan & Biaya</p>
                      <p className="mt-3 text-[17px] font-extrabold text-[#223126]">{selectedShipment.service}</p>
                      <p className="mt-1 text-sm font-bold text-[#1f8f4e]">{formatCurrency(selectedShipment.amount)}</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[22px] border border-[#e8eee5] bg-white p-4">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8e988f]">Detail Barang</p>
                        <h4 className="mt-2 text-xl font-extrabold text-[#223126]">
                          {selectedShipment.itemName || "-"}
                        </h4>
                      </div>
                      <span className="w-fit rounded-full bg-[#eaf8ee] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#1d7f33]">
                        {selectedShipment.status}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {[
                        ["Jenis Barang", selectedShipment.itemCategory || "-"],
                        ["Berat", `${(selectedShipment.weightKg || 0).toFixed(2)} kg`],
                        [
                          "Dimensi",
                          `${selectedShipment.lengthCm || 0} x ${selectedShipment.widthCm || 0} x ${selectedShipment.heightCm || 0} cm`
                        ],
                        ["Pembayaran", selectedShipment.payment],
                        ["Catatan Barang", selectedShipment.itemNote || "-"]
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-[16px] bg-[#f4f8f1] px-4 py-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8e988f]">{label}</p>
                          <p className="mt-2 text-sm font-bold text-[#273228]">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
