export type ReviewItem = {
  id: string;
  initials: string;
  name: string;
  stars: number;
  text: string;
  meta: string;
  visible: boolean;
  avatarBg: string;
};

const STORAGE_KEY = "shipin_admin_reviews_v1";

const DEFAULT_REVIEWS: ReviewItem[] = [
  {
    id: "rv-1",
    initials: "AN",
    name: "Adi Nugroho",
    stars: 5,
    text: '"Pengiriman sangat cepat dan kurirnya ramah banget. Paket sampai dalam kondisi sempurna tanpa lecet sedikitpun. Pasti langganan terus!"',
    meta: "12 Okt 2023 | ID Transaksi: SHIP-9902",
    visible: true,
    avatarBg: "bg-[#d5efd8] text-[#11623a]"
  },
  {
    id: "rv-2",
    initials: "SP",
    name: "Siska Putri",
    stars: 3,
    text: '"Sedikit kecewa karena estimasi waktu meleset 2 jam, tapi barang masih aman. Mohon ditingkatkan lagi akurasi pelacakannya."',
    meta: "10 Okt 2023 | ID Transaksi: SHIP-9881",
    visible: false,
    avatarBg: "bg-[#f4d4e4] text-[#8b2558]"
  },
  {
    id: "rv-3",
    initials: "BW",
    name: "Budi Wijaya",
    stars: 5,
    text: '"Harga paling kompetitif untuk kiriman logistik antar kota. Dashboard-nya sangat membantu UMKM seperti saya."',
    meta: "08 Okt 2023 | ID Transaksi: SHIP-9870",
    visible: true,
    avatarBg: "bg-[#d5efd8] text-[#11623a]"
  }
];

function inBrowser() {
  return typeof window !== "undefined";
}

export function loadReviews() {
  if (!inBrowser()) return [...DEFAULT_REVIEWS];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_REVIEWS));
    return [...DEFAULT_REVIEWS];
  }
  try {
    const parsed = JSON.parse(raw) as ReviewItem[];
    if (!Array.isArray(parsed) || parsed.length === 0) return [...DEFAULT_REVIEWS];
    return parsed;
  } catch {
    return [...DEFAULT_REVIEWS];
  }
}

export function saveReviews(rows: ReviewItem[]) {
  if (!inBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

export function createReview(name: string, text: string, stars: number) {
  const now = Date.now();
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "US";

  const next: ReviewItem = {
    id: `rv-${now}`,
    initials,
    name,
    stars,
    text: `"${text}"`,
    meta: `${new Date(now).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })} | ID Transaksi: SHIP-${String(now).slice(-4)}`,
    visible: true,
    avatarBg: "bg-[#d5efd8] text-[#11623a]"
  };

  const updated = [next, ...loadReviews()];
  saveReviews(updated);
  return updated;
}

export function updateReview(id: string, patch: Partial<ReviewItem>) {
  const updated = loadReviews().map((row) => (row.id === id ? { ...row, ...patch } : row));
  saveReviews(updated);
  return updated;
}

export function deleteReview(id: string) {
  const updated = loadReviews().filter((row) => row.id !== id);
  saveReviews(updated);
  return updated;
}
