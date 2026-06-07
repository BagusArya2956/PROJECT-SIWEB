import Link from "next/link";

import { InstagramIcon, LinkedinIcon, XIcon } from "@/components/icons";

export function PublicFooter() {
  return (
    <footer className="mt-8 border-t border-[#e6ecdf] bg-[#fbfaf3]/90">
      <div className="shell py-10 sm:py-12">
        <div className="grid gap-8 border-b border-[#e2e8da] pb-8 sm:grid-cols-2 lg:grid-cols-[1.25fr_0.75fr_0.85fr_0.7fr] lg:gap-10">
          <div className="max-w-[390px]">
            <p className="text-[18px] font-extrabold tracking-[-0.03em] text-shipin-deep">SHIPIN GO</p>
            <p className="mt-4 max-w-[360px] text-[15px] leading-8 text-shipin-text">
              Solusi logistik terdepan di Indonesia. Menghubungkan orang dan bisnis melalui sistem
              pengiriman yang cerdas dan efisien.
            </p>
          </div>
          <div>
            <p className="text-[15px] font-bold text-shipin-ink">Menu</p>
            <ul className="mt-4 space-y-3 text-[15px] text-shipin-text">
              <li>
                <Link href="/#beranda" className="transition hover:text-shipin-deep">Beranda</Link>
              </li>
              <li>
                <Link href="/cek-ongkir" className="transition hover:text-shipin-deep">Cek Ongkir</Link>
              </li>
              <li>
                <Link href="/ulasan" className="transition hover:text-shipin-deep">Ulasan</Link>
              </li>
              <li>
                <Link href="/kontak" className="transition hover:text-shipin-deep">Kontak</Link>
              </li>
              <li>
                <Link href="/lacak-paket" className="transition hover:text-shipin-deep">Lacak Paket</Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-[15px] font-bold text-shipin-ink">Dukungan</p>
            <ul className="mt-4 space-y-3 text-[15px] text-shipin-text">
              <li>
                <Link href="/kontak" className="transition hover:text-shipin-deep">Pusat Bantuan</Link>
              </li>
              <li>
                <Link href="/kontak" className="transition hover:text-shipin-deep">Syarat &amp; Ketentuan</Link>
              </li>
              <li>
                <Link href="/kontak" className="transition hover:text-shipin-deep">Kebijakan Privasi</Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-[15px] font-bold text-shipin-ink">Sosial Media</p>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-shipin-deep/15 bg-white text-shipin-deep shadow-[0_10px_24px_rgba(27,67,50,0.08)] transition hover:-translate-y-0.5 hover:border-shipin-deep/35 hover:bg-[#edf7e8]"
                aria-label="Instagram SHIPIN GO"
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-shipin-deep/15 bg-white text-shipin-deep shadow-[0_10px_24px_rgba(27,67,50,0.08)] transition hover:-translate-y-0.5 hover:border-shipin-deep/35 hover:bg-[#edf7e8]"
                aria-label="LinkedIn SHIPIN GO"
              >
                <LinkedinIcon className="h-4 w-4" />
              </a>
              <a
                href="https://x.com/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-shipin-deep/15 bg-white text-shipin-deep shadow-[0_10px_24px_rgba(27,67,50,0.08)] transition hover:-translate-y-0.5 hover:border-shipin-deep/35 hover:bg-[#edf7e8]"
                aria-label="X SHIPIN GO"
              >
                <XIcon className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
        <div className="pt-6 text-[14px] text-shipin-text">
          <p>© 2026 SHIPIN GO. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
