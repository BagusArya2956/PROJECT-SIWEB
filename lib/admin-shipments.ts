import { estimateShippingCost, resolveAreaCoordinate } from "@/lib/shipping-pricing";

export type ShipmentStatus = "DALAM PERJALANAN" | "DIJADWALKAN" | "SAMPAI";
export type PaymentStatus = "LUNAS" | "BELUM BAYAR";
export type ServiceType = "REGULER" | "EKSPRES";

export type TrackingStatus =
  | "Pesanan diterima"
  | "Diproses di warehouse"
  | "Berangkat dari hub"
  | "Tiba di transit"
  | "Sedang dikirim"
  | "Terkirim";

export type TrackingEvent = {
  id: string;
  status: TrackingStatus;
  description: string;
  locationLabel: string;
  lat: number;
  lng: number;
  occurredAt: number;
};

export type ShipmentRecord = {
  id: string;
  type: string;
  sender: string;
  receiver: string;
  destination: string;
  date: string;
  payment: PaymentStatus;
  shipment: ShipmentStatus;
  total: number;
  createdAt: number;
  senderAddress?: string;
  receiverAddress?: string;
  originProvince?: string;
  destinationProvince?: string;
  originCity?: string;
  destinationCity?: string;
  senderPhone?: string;
  receiverPhone?: string;
  weightKg?: number;
  service?: ServiceType;
  estimatedArrivalAt?: number;
  latestLocationLabel?: string;
  latestLat?: number;
  latestLng?: number;
  trackingEvents?: TrackingEvent[];
  lastTrackingUpdateAt?: number;
};

export type CreateShipmentPayload = {
  senderName: string;
  pickupAddress: string;
  receiverName: string;
  destinationAddress: string;
  originProvince?: string;
  destinationProvince?: string;
  originCity?: string;
  destinationCity?: string;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  senderPhone?: string;
  receiverPhone?: string;
  weightKg: number;
  service: ServiceType;
};

const STORAGE_KEY = "shipin_admin_shipments_v1";

const TRACKING_STATUSES: TrackingStatus[] = [
  "Pesanan diterima",
  "Diproses di warehouse",
  "Berangkat dari hub",
  "Tiba di transit",
  "Sedang dikirim",
  "Terkirim"
];

type Waypoint = {
  label: string;
  lat: number;
  lng: number;
};

const SEED_SHIPMENTS: ShipmentRecord[] = [
  {
    id: "SPG-99281-ID",
    type: "EKSPRES",
    sender: "Budi Santoso",
    receiver: "Siti Aminah",
    destination: "Jakarta | Surabaya",
    date: "12 Okt 2023",
    payment: "LUNAS",
    shipment: "DALAM PERJALANAN",
    total: 1450000,
    createdAt: 1697068800000,
    senderAddress: "Jakarta",
    receiverAddress: "Surabaya",
    originProvince: "DKI Jakarta",
    destinationProvince: "Jawa Timur",
    originCity: "Kota Jakarta Pusat",
    destinationCity: "Kota Surabaya",
    weightKg: 2.5,
    service: "EKSPRES",
    senderPhone: "081200000001",
    receiverPhone: "081300000001"
  },
  {
    id: "SPG-88172-ID",
    type: "REGULER",
    sender: "UD Maju Jaya",
    receiver: "PT Logistik",
    destination: "Bandung | Medan",
    date: "10 Okt 2023",
    payment: "BELUM BAYAR",
    shipment: "DIJADWALKAN",
    total: 5200000,
    createdAt: 1696896000000,
    senderAddress: "Bandung",
    receiverAddress: "Medan",
    originProvince: "Jawa Barat",
    destinationProvince: "Sumatera Utara",
    originCity: "Kota Bandung",
    destinationCity: "Kota Medan",
    weightKg: 6.4,
    service: "REGULER",
    senderPhone: "081200000002",
    receiverPhone: "081300000002"
  }
];

function canUseStorage() {
  return typeof window !== "undefined";
}

function normalizeResi(value: string) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .trim();
}

function parseDestination(pickupAddress: string, destinationAddress: string) {
  const start = pickupAddress.split(",")[0]?.trim() || "Asal";
  const end = destinationAddress.split(",")[0]?.trim() || "Tujuan";
  return `${start} | ${end}`;
}

function getPrimaryArea(text: string) {
  const tokens = text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (!tokens.length) return "Indonesia";
  if (tokens.length >= 3) return tokens[tokens.length - 3];
  return tokens[0];
}

function makeId() {
  const tail = String(Date.now()).slice(-6);
  return `SPG-${tail}-ID`;
}

function getTransitPoint(origin: Waypoint, destination: Waypoint): Waypoint {
  return {
    label: `Transit ${destination.label}`,
    lat: Number(((origin.lat + destination.lat) / 2).toFixed(5)),
    lng: Number(((origin.lng + destination.lng) / 2).toFixed(5))
  };
}

function getWaypointsFromShipment(row: ShipmentRecord) {
  const senderArea =
    row.originCity ||
    getPrimaryArea(row.senderAddress || row.destination.split("|")[0] || "Jakarta");
  const receiverArea =
    row.destinationCity ||
    getPrimaryArea(row.receiverAddress || row.destination.split("|")[1] || "Bekasi");
  const originCoord = resolveAreaCoordinate({
    city: row.originCity || senderArea,
    province: row.originProvince
  });
  const destinationCoord = resolveAreaCoordinate({
    city: row.destinationCity || receiverArea,
    province: row.destinationProvince
  });
  return {
    senderArea,
    receiverArea,
    origin: { label: senderArea, ...originCoord } as Waypoint,
    destination: { label: receiverArea, ...destinationCoord } as Waypoint
  };
}

function inferProgressFromShipmentStatus(status: ShipmentStatus) {
  if (status === "SAMPAI") return TRACKING_STATUSES.length - 1;
  if (status === "DALAM PERJALANAN") return 4;
  return 1;
}

function deriveShipmentStatusFromProgress(progress: number): ShipmentStatus {
  if (progress >= TRACKING_STATUSES.length - 1) return "SAMPAI";
  if (progress >= 2) return "DALAM PERJALANAN";
  return "DIJADWALKAN";
}

function createBaseTrackingEvents(
  id: string,
  createdAt: number,
  origin: Waypoint,
  destination: Waypoint
) {
  const transit = getTransitPoint(origin, destination);
  const route: Array<{
    status: TrackingStatus;
    description: string;
    location: Waypoint;
  }> = [
    {
      status: "Pesanan diterima",
      description: "Pesanan telah dipindai dan masuk dalam sistem manifest utama.",
      location: origin
    },
    {
      status: "Diproses di warehouse",
      description: "Sortir paket berdasarkan wilayah tujuan selesai dilakukan.",
      location: {
        label: `${origin.label} Warehouse`,
        lat: origin.lat,
        lng: origin.lng
      }
    },
    {
      status: "Berangkat dari hub",
      description: "Paket berangkat dari hub asal menuju fasilitas transit resmi.",
      location: {
        label: `${origin.label} Hub`,
        lat: origin.lat + 0.02,
        lng: origin.lng + 0.02
      }
    },
    {
      status: "Tiba di transit",
      description: "Paket tiba di pusat transit dan siap diteruskan ke area tujuan.",
      location: transit
    },
    {
      status: "Sedang dikirim",
      description: "Kurir sedang mengantar paket ke alamat penerima.",
      location: {
        label: `Area ${destination.label}`,
        lat: destination.lat - 0.015,
        lng: destination.lng - 0.015
      }
    },
    {
      status: "Terkirim",
      description: "Paket telah diterima oleh penerima dengan kondisi baik.",
      location: destination
    }
  ];

  return route.map((event, index) => ({
    id: `${id}-EV-${index + 1}`,
    status: event.status,
    description: event.description,
    locationLabel: event.location.label,
    lat: Number(event.location.lat.toFixed(5)),
    lng: Number(event.location.lng.toFixed(5)),
    occurredAt: createdAt + index * 45 * 60 * 1000
  }));
}

function enrichShipment(row: ShipmentRecord): ShipmentRecord {
  const { senderArea, receiverArea, origin, destination } = getWaypointsFromShipment(row);
  const allEvents = createBaseTrackingEvents(row.id, row.createdAt, origin, destination);

  let progress = inferProgressFromShipmentStatus(row.shipment);
  if (row.trackingEvents?.length) {
    progress = Math.max(progress, row.trackingEvents.length - 1);
  }
  progress = Math.min(progress, allEvents.length - 1);
  const activeEvents = allEvents.slice(0, progress + 1);
  const latest = activeEvents[activeEvents.length - 1];
  const estimatedArrivalAt =
    row.estimatedArrivalAt ??
    (row.createdAt +
      (row.service === "EKSPRES" ? 24 : 72) * 60 * 60 * 1000);

  return {
    ...row,
    senderAddress: row.senderAddress || senderArea,
    receiverAddress: row.receiverAddress || receiverArea,
    service: row.service || (row.type === "EKSPRES" ? "EKSPRES" : "REGULER"),
    weightKg: row.weightKg ?? 1,
    trackingEvents: activeEvents,
    latestLocationLabel: latest.locationLabel,
    latestLat: latest.lat,
    latestLng: latest.lng,
    lastTrackingUpdateAt: latest.occurredAt,
    estimatedArrivalAt,
    shipment: deriveShipmentStatusFromProgress(progress),
    payment: row.payment
  };
}

function migrateRows(rows: ShipmentRecord[]) {
  return rows.map((row) => enrichShipment(row));
}

export function formatShipmentDate(time: number) {
  return new Date(time).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

export function formatDateTime(time: number) {
  return new Date(time).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function loadShipments() {
  if (!canUseStorage()) return migrateRows([...SEED_SHIPMENTS]);

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = migrateRows(SEED_SHIPMENTS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  try {
    const parsed = JSON.parse(raw) as ShipmentRecord[];
    if (!Array.isArray(parsed)) return migrateRows([...SEED_SHIPMENTS]);
    const migrated = migrateRows(parsed);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    return migrated;
  } catch {
    return migrateRows([...SEED_SHIPMENTS]);
  }
}

export function saveShipments(rows: ShipmentRecord[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

export function createShipment(payload: CreateShipmentPayload) {
  const now = Date.now();
  const safeWeight = Math.max(1, payload.weightKg);
  const originCity = payload.originCity || getPrimaryArea(payload.pickupAddress);
  const destinationCity = payload.destinationCity || getPrimaryArea(payload.destinationAddress);
  const originProvince = payload.originProvince || "Indonesia";
  const destinationProvince = payload.destinationProvince || "Indonesia";
  const pricing = estimateShippingCost({
    originCity,
    destinationCity,
    originProvince,
    destinationProvince,
    weightKg: safeWeight,
    lengthCm: payload.lengthCm,
    widthCm: payload.widthCm,
    heightCm: payload.heightCm,
    service: payload.service
  });

  const next: ShipmentRecord = enrichShipment({
    id: makeId(),
    type: payload.service,
    sender: payload.senderName,
    receiver: payload.receiverName,
    destination: parseDestination(payload.pickupAddress, payload.destinationAddress),
    date: formatShipmentDate(now),
    payment: "BELUM BAYAR",
    shipment: "DIJADWALKAN",
    total: pricing.total,
    createdAt: now,
    senderAddress: payload.pickupAddress,
    receiverAddress: payload.destinationAddress,
    originProvince,
    destinationProvince,
    originCity,
    destinationCity,
    senderPhone: payload.senderPhone,
    receiverPhone: payload.receiverPhone,
    weightKg: safeWeight,
    service: payload.service
  });

  const current = loadShipments();
  const updated = [next, ...current];
  saveShipments(updated);
  return next;
}

export function updateShipment(id: string, patch: Partial<ShipmentRecord>) {
  const current = loadShipments();
  const updated = current.map((row) => {
    if (row.id !== id) return row;

    const merged = { ...row, ...patch };
    const desiredProgress = patch.shipment
      ? inferProgressFromShipmentStatus(patch.shipment)
      : (merged.trackingEvents?.length || 1) - 1;
    const base = enrichShipment(merged);
    const { origin, destination } = getWaypointsFromShipment(base);
    const allEvents = createBaseTrackingEvents(base.id, base.createdAt, origin, destination);
    const clippedProgress = Math.min(Math.max(0, desiredProgress), allEvents.length - 1);
    const activeEvents = allEvents.slice(0, clippedProgress + 1);
    const latest = activeEvents[activeEvents.length - 1];

    return {
      ...base,
      trackingEvents: activeEvents,
      latestLocationLabel: latest.locationLabel,
      latestLat: latest.lat,
      latestLng: latest.lng,
      lastTrackingUpdateAt: latest.occurredAt,
      shipment: deriveShipmentStatusFromProgress(clippedProgress),
      payment: patch.payment || base.payment
    };
  });
  saveShipments(updated);
  return updated;
}

export function deleteShipment(id: string) {
  const current = loadShipments();
  const updated = current.filter((row) => row.id !== id);
  saveShipments(updated);
  return updated;
}

export function findShipmentByResi(resi: string) {
  const keyword = normalizeResi(resi);
  if (!keyword) return null;
  const rows = loadShipments();
  const exact = rows.find((row) => normalizeResi(row.id) === keyword);
  if (exact) return exact;
  return rows.find((row) => normalizeResi(row.id).includes(keyword)) ?? null;
}

export function getShipmentStorageKey() {
  return STORAGE_KEY;
}

export function refreshTrackingProgress() {
  const rows = loadShipments();
  const now = Date.now();
  let changed = false;

  const updated = rows.map((row) => {
    const events = row.trackingEvents || [];
    const currentProgress = Math.max(0, events.length - 1);
    const elapsedSeconds = Math.max(0, Math.floor((now - row.createdAt) / 1000));
    const targetProgress = Math.min(TRACKING_STATUSES.length - 1, Math.floor(elapsedSeconds / 30));

    if (targetProgress <= currentProgress) return row;

    const base = enrichShipment(row);
    const { origin, destination } = getWaypointsFromShipment(base);
    const allEvents = createBaseTrackingEvents(base.id, base.createdAt, origin, destination);
    const activeEvents = allEvents.slice(0, targetProgress + 1);
    const latest = activeEvents[activeEvents.length - 1];
    changed = true;

    return {
      ...base,
      trackingEvents: activeEvents,
      latestLocationLabel: latest.locationLabel,
      latestLat: latest.lat,
      latestLng: latest.lng,
      lastTrackingUpdateAt: latest.occurredAt,
      shipment: deriveShipmentStatusFromProgress(targetProgress),
      payment: targetProgress >= 2 ? "LUNAS" : base.payment
    };
  });

  if (changed) {
    saveShipments(updated);
  }

  return updated;
}
