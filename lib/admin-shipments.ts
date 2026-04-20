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

const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  jakarta: { lat: -6.2088, lng: 106.8456 },
  bekasi: { lat: -6.2349, lng: 106.9896 },
  bandung: { lat: -6.9175, lng: 107.6191 },
  surabaya: { lat: -7.2575, lng: 112.7521 },
  depok: { lat: -6.4025, lng: 106.7942 },
  bogor: { lat: -6.5944, lng: 106.7892 },
  tangerang: { lat: -6.1781, lng: 106.63 },
  yogyakarta: { lat: -7.7956, lng: 110.3695 },
  semarang: { lat: -6.9667, lng: 110.4167 },
  medan: { lat: 3.5952, lng: 98.6722 },
  makassar: { lat: -5.1477, lng: 119.4327 },
  palembang: { lat: -2.9761, lng: 104.7754 },
  bali: { lat: -8.65, lng: 115.2167 }
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
  return (
    text
      .split(",")[0]
      ?.trim()
      .replace(/\s+/g, " ") || "Indonesia"
  );
}

function makeId() {
  const tail = String(Date.now()).slice(-6);
  return `SPG-${tail}-ID`;
}

function getCoordinateByText(text: string) {
  const normalized = text.toLowerCase();
  for (const [keyword, coord] of Object.entries(CITY_COORDINATES)) {
    if (normalized.includes(keyword)) {
      return coord;
    }
  }
  return CITY_COORDINATES.jakarta;
}

function getTransitPoint(origin: Waypoint, destination: Waypoint): Waypoint {
  return {
    label: `Transit ${destination.label}`,
    lat: Number(((origin.lat + destination.lat) / 2).toFixed(5)),
    lng: Number(((origin.lng + destination.lng) / 2).toFixed(5))
  };
}

function getWaypointsFromShipment(row: ShipmentRecord) {
  const senderArea = getPrimaryArea(row.senderAddress || row.destination.split("|")[0] || "Jakarta");
  const receiverArea = getPrimaryArea(row.receiverAddress || row.destination.split("|")[1] || "Bekasi");
  const originCoord = getCoordinateByText(senderArea);
  const destinationCoord = getCoordinateByText(receiverArea);
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
  const baseCost = safeWeight * 17000;
  const serviceCost = payload.service === "EKSPRES" ? 3500 : 1500;

  const next: ShipmentRecord = enrichShipment({
    id: makeId(),
    type: payload.service,
    sender: payload.senderName,
    receiver: payload.receiverName,
    destination: parseDestination(payload.pickupAddress, payload.destinationAddress),
    date: formatShipmentDate(now),
    payment: "BELUM BAYAR",
    shipment: "DIJADWALKAN",
    total: baseCost + serviceCost,
    createdAt: now,
    senderAddress: payload.pickupAddress,
    receiverAddress: payload.destinationAddress,
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
