"use client";

import { useEffect, useMemo, useState } from "react";

import { deleteReview, loadReviews, ReviewItem, updateReview } from "@/lib/admin-reviews";

function RatingStars({ stars }: { stars: number }) {
  return (
    <div className="mt-1.5 text-base tracking-[0.08em] text-[#f4aa00]">
      {"★".repeat(stars)}
      <span className="text-[#cfd5d2]">{"★".repeat(5 - stars)}</span>
    </div>
  );
}

export default function AdminUlasanPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [filter, setFilter] = useState<"all" | "unmoderated">("all");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setReviews(loadReviews());
  }, []);

  const bars = useMemo(() => {
    const all = reviews.length > 0 ? reviews : [];
    const total = all.length || 1;
    return [5, 4, 3, 2, 1].map((star) => {
      const count = all.filter((review) => review.stars === star).length;
      return { star, pct: Math.round((count / total) * 100) };
    });
  }, [reviews]);

  const average = useMemo(() => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, row) => sum + row.stars, 0);
    return Number((total / reviews.length).toFixed(1));
  }, [reviews]);

  const displayedReviews = useMemo(() => {
    if (filter === "unmoderated") return reviews.filter((review) => !review.visible);
    return reviews;
  }, [filter, reviews]);

  function handleToggleVisibility(id: string, visible: boolean) {
    const updated = updateReview(id, { visible: !visible });
    setReviews(updated);
    setMessage("Status moderasi ulasan diperbarui.");
  }

  function handleDeleteReview(id: string) {
    const updated = deleteReview(id);
    setReviews(updated);
    setMessage("Ulasan berhasil dihapus.");
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#f2f5f1] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1540px]">
        <section className="rounded-[34px] bg-gradient-to-r from-[#8be897] to-[#97e6a9] px-8 py-8 sm:px-10 sm:py-9">
          <h1 className="text-[clamp(1.8rem,2.3vw,3.2rem)] font-black italic leading-[0.98] tracking-tight text-[#0d4e32]">
            Kelola Ulasan Pelanggan
          </h1>
          <p className="mt-3 max-w-5xl text-[clamp(0.98rem,1.2vw,1.65rem)] leading-[1.12] text-[#1d6244]">
            Moderasi suara pelanggan Anda untuk menjaga kualitas layanan SHIPIN GO.
          </p>
        </section>

        <section className="mt-7 grid gap-6 lg:grid-cols-[390px_1fr]">
          <div className="space-y-6">
            <article className="rounded-[30px] bg-white px-7 py-7 shadow-[0_10px_30px_rgba(21,43,28,0.06)]">
              <h2 className="text-[clamp(1.7rem,1.8vw,2.55rem)] font-extrabold leading-[0.98] text-[#17362a]">
                Ringkasan
                <br />
                Rating
              </h2>

              <div className="mt-5 flex items-start gap-4">
                <p className="text-[clamp(3.1rem,3.8vw,4.8rem)] font-black leading-[0.9] text-[#1d5d40]">
                  {average || "0.0"}
                </p>
                <div className="pt-2.5">
                  <div className="text-base tracking-[0.1em] text-[#f4aa00]">★★★★☆</div>
                  <p className="mt-1 text-[clamp(1rem,1.15vw,1.45rem)] leading-[1.12] text-[#58645e]">
                    Dari {reviews.length}
                    <br />
                    Ulasan
                  </p>
                </div>
              </div>

              <div className="mt-7 space-y-3">
                {bars.map((bar) => (
                  <div key={bar.star} className="grid grid-cols-[16px_1fr_52px] items-center gap-3">
                    <span className="text-[clamp(0.95rem,1.2vw,1.35rem)] text-[#4e5b55]">{bar.star}</span>
                    <div className="h-3 overflow-hidden rounded-full bg-[#edf0ee]">
                      <div className="h-full rounded-full bg-[#1e7a45]" style={{ width: `${bar.pct}%` }} />
                    </div>
                    <span className="text-right text-[clamp(0.85rem,1vw,1.2rem)] text-[#4e5b55]">{bar.pct}%</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[30px] bg-[#18672f] px-7 py-7">
              <h3 className="text-[clamp(1.4rem,1.9vw,2.2rem)] font-extrabold leading-tight text-white">
                Butuh Bantuan?
              </h3>
              <p className="mt-3 text-[clamp(0.95rem,1.1vw,1.2rem)] leading-relaxed text-[#8ce7a1]">
                Tim moderasi kami siap membantu Anda menyaring ulasan yang melanggar aturan.
              </p>
              <button
                type="button"
                onClick={() => setMessage("Support dihubungi. Tim moderasi akan menindaklanjuti.")}
                className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#87ea90] px-6 text-base font-bold text-[#0e4728]"
              >
                Hubungi Support
              </button>
            </article>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-[clamp(1.85rem,2vw,2.7rem)] font-black leading-none text-[#17362a]">
                Ulasan Terbaru
              </h2>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className={`h-12 rounded-full px-7 text-[clamp(0.95rem,1.1vw,1.25rem)] font-bold ${
                    filter === "all" ? "bg-[#155a3a] text-white" : "border border-[#d1d7d3] bg-white text-[#334842]"
                  }`}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("unmoderated")}
                  className={`h-12 rounded-full px-7 text-[clamp(0.95rem,1.1vw,1.25rem)] font-medium ${
                    filter === "unmoderated"
                      ? "bg-[#155a3a] text-white"
                      : "border border-[#d1d7d3] bg-white text-[#334842]"
                  }`}
                >
                  Belum Dimoderasi
                </button>
              </div>
            </div>

            {message ? <p className="mt-3 text-[12px] font-semibold text-[#1f6a3f]">{message}</p> : null}

            <div className="mt-5 space-y-4">
              {displayedReviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-[28px] bg-white px-6 py-5 shadow-[0_10px_30px_rgba(21,43,28,0.06)]"
                >
                  <div className="flex gap-4">
                    <div
                      className={`mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl font-bold ${review.avatarBg}`}
                    >
                      {review.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[clamp(1.45rem,1.35vw,1.9rem)] font-extrabold leading-none text-[#153528]">
                          {review.name}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleToggleVisibility(review.id, review.visible)}
                          className={`rounded-lg px-3 py-1 text-xs font-extrabold tracking-wide ${
                            review.visible ? "bg-[#bde8c7] text-[#11623a]" : "bg-[#eceef1] text-[#46505a]"
                          }`}
                        >
                          {review.visible ? "TAMPILKAN" : "SEMBUNYIKAN"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteReview(review.id)}
                          className="rounded-lg bg-[#fde9e7] px-3 py-1 text-xs font-extrabold tracking-wide text-[#b9473f]"
                        >
                          HAPUS
                        </button>
                      </div>

                      <RatingStars stars={review.stars} />

                      <p className="mt-2 text-[clamp(0.98rem,1vw,1.18rem)] leading-relaxed text-[#26433a]">
                        {review.text}
                      </p>
                      <p className="mt-3 text-[clamp(0.82rem,0.88vw,0.98rem)] text-[#4f5c56]">{review.meta}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-8 flex justify-center pb-2">
              <button
                type="button"
                onClick={() => setMessage(`Total ulasan saat ini: ${reviews.length}`)}
                className="inline-flex h-12 items-center justify-center rounded-full border-2 border-[#8fd797] px-7 text-sm font-semibold text-[#257144] sm:h-12 sm:px-8 sm:text-base"
              >
                Lihat Lebih Banyak v
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
