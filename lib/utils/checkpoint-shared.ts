export const CHECKPOINT_STATUS = {
  PESANAN_DITERIMA: "PESANAN_DITERIMA",
  PICKUP_DIJADWALKAN: "PICKUP_DIJADWALKAN",
  DALAM_PERJALANAN: "DALAM_PERJALANAN",
  TIBA_KOTA_TRANSIT: "TIBA_KOTA_TRANSIT",
  DALAM_PENGIRIMAN: "DALAM_PENGIRIMAN",
  SELESAI: "SELESAI"
} as const;

export const CHECKPOINT_SEQUENCE = [
  CHECKPOINT_STATUS.PESANAN_DITERIMA,
  CHECKPOINT_STATUS.PICKUP_DIJADWALKAN,
  CHECKPOINT_STATUS.DALAM_PERJALANAN,
  CHECKPOINT_STATUS.TIBA_KOTA_TRANSIT,
  CHECKPOINT_STATUS.DALAM_PENGIRIMAN,
  CHECKPOINT_STATUS.SELESAI
] as const;

export type CheckpointStatus = (typeof CHECKPOINT_SEQUENCE)[number];

export type CheckpointRecord = {
  id: number;
  resi_id: string;
  waktu: string | Date;
  status: string;
  deskripsi: string | null;
  lokasi: string | null;
};

const STATUS_LABELS: Record<CheckpointStatus, string> = {
  PESANAN_DITERIMA: "Pesanan Diterima",
  PICKUP_DIJADWALKAN: "Pickup Dijadwalkan",
  DALAM_PERJALANAN: "Dalam Perjalanan",
  TIBA_KOTA_TRANSIT: "Tiba di Kota Transit",
  DALAM_PENGIRIMAN: "Dalam Pengiriman",
  SELESAI: "Paket Selesai"
};

export function getCheckpointOrder(status: string) {
  return CHECKPOINT_SEQUENCE.indexOf(status as CheckpointStatus);
}

export function getCheckpointLabel(status: string) {
  return STATUS_LABELS[status as CheckpointStatus] || status;
}

export function formatCheckpointTime(date: string | Date) {
  const bulanIndonesia = [
    "JANUARI",
    "FEBRUARI",
    "MARET",
    "APRIL",
    "MEI",
    "JUNI",
    "JULI",
    "AGUSTUS",
    "SEPTEMBER",
    "OKTOBER",
    "NOVEMBER",
    "DESEMBER"
  ];
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = bulanIndonesia[d.getMonth()] || "";
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day} ${month} ${year}, ${hours}.${minutes}`;
}
