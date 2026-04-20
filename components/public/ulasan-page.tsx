"use client";

import { useEffect, useMemo, useState } from "react";

import { StarIcon } from "@/components/icons";
import {
  createReview,
  deleteReview,
  loadReviews,
  ReviewItem,
  updateReview
} from "@/lib/admin-reviews";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const PUBLIC_OWNED_REVIEW_KEY = "shipin_public_owned_reviews_v1";

function ReviewStars({ stars }: { stars: number }) {
  return (
    <div className="inline-flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <StarIcon
          key={index}
          className={`h-3.5 w-3.5 ${index < stars ? "text-[#0f8d50]" : "text-[#d9ddd8]"}`}
        />
      ))}
    </div>
  );
}

export function UlasanPage() {
  const [rows, setRows] = useState<ReviewItem[]>([]);
  const [sort, setSort] = useState<"latest" | "top">("latest");
  const [ownedReviewIds, setOwnedReviewIds] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [stars, setStars] = useState(5);
  const [message, setMessage] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingText, setEditingText] = useState("");
  const [editingStars, setEditingStars] = useState(5);

  useEffect(() => {
    setRows(loadReviews());
    try {
      const raw = window.localStorage.getItem(PUBLIC_OWNED_REVIEW_KEY);
      const parsed = raw ? (JSON.parse(raw) as string[]) : [];
      setOwnedReviewIds(Array.isArray(parsed) ? parsed : []);
    } catch {
      setOwnedReviewIds([]);
    }
  }, []);

  const visibleRows = useMemo(() => rows.filter((row) => row.visible), [rows]);

  const displayedRows = useMemo(() => {
    const list = [...visibleRows];
    if (sort === "top") {
      return list.sort((a, b) => b.stars - a.stars);
    }
    return list.sort((a, b) => b.id.localeCompare(a.id));
  }, [sort, visibleRows]);

  const average = useMemo(() => {
    if (visibleRows.length === 0) return 0;
    const total = visibleRows.reduce((sum, row) => sum + row.stars, 0);
    return Number((total / visibleRows.length).toFixed(1));
  }, [visibleRows]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !text.trim()) {
      setMessage("Nama dan pesan ulasan wajib diisi.");
      return;
    }
    const updated = createReview(name.trim(), text.trim(), stars);
    setRows(updated);
    const createdId = updated[0]?.id;
    if (createdId) {
      const nextOwnedIds = [createdId, ...ownedReviewIds];
      setOwnedReviewIds(nextOwnedIds);
      window.localStorage.setItem(PUBLIC_OWNED_REVIEW_KEY, JSON.stringify(nextOwnedIds));
    }
    setName("");
    setText("");
    setStars(5);
    setMessage("Ulasan berhasil dikirim. Terima kasih atas masukan Anda.");
  }

  function handleStartEdit(review: ReviewItem) {
    setEditingReviewId(review.id);
    setEditingName(review.name);
    setEditingText(review.text.replace(/^"|"$/g, ""));
    setEditingStars(review.stars);
    setMessage("");
  }

  function handleCancelEdit() {
    setEditingReviewId(null);
    setEditingName("");
    setEditingText("");
    setEditingStars(5);
  }

  function handleSaveEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingReviewId) return;
    if (!editingName.trim() || !editingText.trim()) {
      setMessage("Nama dan pesan ulasan wajib diisi.");
      return;
    }
    const updated = updateReview(editingReviewId, {
      name: editingName.trim(),
      stars: editingStars,
      text: `"${editingText.trim()}"`,
      initials:
        editingName
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0]?.toUpperCase() ?? "")
          .join("") || "US"
    });
    setRows(updated);
    handleCancelEdit();
    setMessage("Ulasan berhasil diperbarui.");
  }

  function handleDeleteReview(id: string) {
    const updated = deleteReview(id);
    setRows(updated);
    const nextOwnedIds = ownedReviewIds.filter((item) => item !== id);
    setOwnedReviewIds(nextOwnedIds);
    window.localStorage.setItem(PUBLIC_OWNED_REVIEW_KEY, JSON.stringify(nextOwnedIds));
    if (editingReviewId === id) {
      handleCancelEdit();
    }
    setMessage("Ulasan berhasil dihapus.");
  }

  return (
    <main>
      <ScrollReveal />
      <section className="shell py-10 lg:py-14">
        <div className="mx-auto max-w-[1040px]">
          <div className="grid gap-5 lg:grid-cols-[1fr_310px] lg:items-end">
            <div className="reveal-on-scroll">
              <h1 className="max-w-[650px] text-[42px] font-extrabold leading-[1.02] tracking-[-0.04em] text-[#1f2622] sm:text-[58px]">
                Apa Kata Mereka Tentang
                <span className="text-[#127840]"> SHIPIN GO ?</span>
              </h1>
              <p className="mt-3 max-w-[620px] text-[14px] leading-7 text-[#6e766f] sm:text-[15px]">
                Kepercayaan Anda adalah prioritas kami. Kami bangga telah membantu ribuan
                bisnis mengirimkan paket dengan aman dan tepat waktu ke seluruh penjuru negeri.
              </p>
            </div>

            <article className="reveal-on-scroll reveal-delay-1 rounded-[18px] border border-[#e4e8e3] bg-[#f8faf7] px-6 py-6 text-center shadow-[0_12px_26px_rgba(173,183,168,0.14)]">
              <p className="text-[52px] font-black leading-none tracking-[-0.04em] text-[#0f8148]">
                {average}
                <span className="text-[28px] text-[#4d5a52]">/5.0</span>
              </p>
              <p className="mt-3 text-[12px] font-medium text-[#636f67]">
                Berdasarkan {visibleRows.length}+ ulasan terverifikasi
              </p>
            </article>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_320px]">
            <article className="reveal-on-scroll rounded-[20px] border border-[#e4e8e3] bg-[#f8faf7] p-5 shadow-[0_14px_28px_rgba(173,183,168,0.14)] sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[31px] font-extrabold tracking-[-0.03em] text-[#2c352f]">
                  Ulasan Terbaru
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSort("latest")}
                    className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${
                      sort === "latest" ? "bg-[#e4f4e5] text-[#126b39]" : "text-[#657068]"
                    }`}
                  >
                    Terbaru
                  </button>
                  <button
                    type="button"
                    onClick={() => setSort("top")}
                    className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${
                      sort === "top" ? "bg-[#e4f4e5] text-[#126b39]" : "text-[#657068]"
                    }`}
                  >
                    Terpopuler
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {(showAll ? displayedRows : displayedRows.slice(0, 3)).map((review) => (
                  <article
                    key={review.id}
                    className="rounded-[16px] border border-[#e8ece7] bg-white px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[18px] font-bold leading-none text-[#28342d]">{review.name}</p>
                        <p className="mt-0.5 text-[11px] text-[#788178]">Pelanggan aktif</p>
                      </div>
                      <ReviewStars stars={review.stars} />
                    </div>
                    <p className="mt-2 text-[13px] leading-6 text-[#5f6a62]">{review.text}</p>
                    {ownedReviewIds.includes(review.id) ? (
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(review)}
                          className="inline-flex h-8 items-center justify-center rounded-full border border-[#b8dec1] px-3 text-[11px] font-semibold text-[#1a7a44]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteReview(review.id)}
                          className="inline-flex h-8 items-center justify-center rounded-full border border-[#f3c9c9] px-3 text-[11px] font-semibold text-[#b54545]"
                        >
                          Hapus
                        </button>
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </article>

            <aside className="reveal-on-scroll reveal-delay-1 rounded-[20px] border border-[#e4e8e3] bg-[#f8faf7] p-5 shadow-[0_14px_28px_rgba(173,183,168,0.14)] sm:p-6">
              <h3 className="text-[28px] font-extrabold tracking-[-0.03em] text-[#2d362f]">
                {editingReviewId ? "Edit Ulasan" : "Kirim Ulasan"}
              </h3>
              <p className="mt-2 text-[12px] leading-5 text-[#6f786f]">
                {editingReviewId
                  ? "Perbarui ulasan Anda sebelum disimpan."
                  : "Bagikan pengalaman pengiriman Anda untuk membantu pelanggan lainnya."}
              </p>

              <form className="mt-4 space-y-3" onSubmit={editingReviewId ? handleSaveEdit : handleSubmit}>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#49524c]">
                    Beri Rating
                  </p>
                  <div className="mt-1.5 flex gap-1.5">
                    {Array.from({ length: 5 }).map((_, index) => {
                      const value = index + 1;
                      return (
                        <button
                          type="button"
                          key={value}
                          onClick={() => (editingReviewId ? setEditingStars(value) : setStars(value))}
                          className="text-[#0f8d50]"
                        >
                          <StarIcon
                            className={`h-4 w-4 ${
                              value <= (editingReviewId ? editingStars : stars) ? "opacity-100" : "opacity-25"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#49524c]">
                    Nama Lengkap
                  </label>
                  <input
                    value={editingReviewId ? editingName : name}
                    onChange={(event) =>
                      editingReviewId ? setEditingName(event.target.value) : setName(event.target.value)
                    }
                    className="mt-1.5 h-10 w-full rounded-[10px] border border-[#e0e6df] bg-[#f1f4ef] px-3 text-[13px] text-[#324039] outline-none"
                    placeholder="Masukkan nama Anda"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#49524c]">
                    Pesan Ulasan
                  </label>
                  <textarea
                    value={editingReviewId ? editingText : text}
                    onChange={(event) =>
                      editingReviewId ? setEditingText(event.target.value) : setText(event.target.value)
                    }
                    rows={4}
                    className="mt-1.5 w-full resize-none rounded-[10px] border border-[#e0e6df] bg-[#f1f4ef] px-3 py-2.5 text-[13px] text-[#324039] outline-none"
                    placeholder="Ceritakan pengalaman Anda..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="inline-flex h-10 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#168049] to-[#12a662] text-[13px] font-semibold text-white shadow-[0_10px_20px_rgba(21,143,82,0.3)]"
                  >
                    {editingReviewId ? "Simpan Perubahan" : "Kirim Ulasan"}
                  </button>
                  {editingReviewId ? (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="inline-flex h-10 w-full items-center justify-center rounded-full border border-[#d6ddd5] text-[13px] font-semibold text-[#58665d]"
                    >
                      Batal
                    </button>
                  ) : null}
                </div>

                {message ? (
                  <p className="text-[12px] font-medium text-[#1a7d45]">{message}</p>
                ) : null}
              </form>

              <div className="mt-4 flex items-center gap-2 text-[11px] text-[#778178]">
                <div className="flex -space-x-2">
                  {[0, 1, 2].map((dot) => (
                    <span
                      key={dot}
                      className="inline-block h-6 w-6 rounded-full border-2 border-[#f8faf7] bg-[#2c3a32]"
                    />
                  ))}
                </div>
                12 ulasan baru hari ini
              </div>
            </aside>
          </div>

          <div className="mt-7 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAll((prev) => !prev)}
              className="inline-flex h-11 items-center justify-center rounded-full border border-[#9ddeab] px-6 text-[13px] font-semibold text-[#1e7c46]"
            >
              {showAll
                ? "Tampilkan Ringkas"
                : displayedRows.length > 3
                  ? `Lihat ${displayedRows.length - 3}+ Ulasan Lainnya`
                  : "Lihat Semua Ulasan"}
            </button>
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
