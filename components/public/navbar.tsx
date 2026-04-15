import Link from "next/link";

const menuItems = [
  { href: "#beranda", label: "Beranda" },
  { href: "#cek-ongkir", label: "Cek Ongkir" },
  { href: "#ulasan", label: "Ulasan" },
  { href: "#kontak", label: "Kontak" },
  { href: "#lacak-paket", label: "Lacak Paket" }
];

export function PublicNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-[#fbfaf3]/85 backdrop-blur">
      <div className="shell flex h-20 items-center justify-between gap-6">
        <Link href="/" className="text-sm font-extrabold tracking-tight text-shipin-deep">
          SHIPIN GO
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-shipin-text lg:flex">
          {menuItems.map((item) => (
            <a key={item.href} href={item.href} className="hover:text-shipin-deep">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-full border border-shipin-deep/15 px-4 py-2 text-sm font-semibold text-shipin-deep hover:border-shipin-deep/30 hover:bg-white"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-shipin-deep px-4 py-2 text-sm font-semibold text-white shadow-soft hover:bg-[#12572f]"
          >
            Register
          </Link>
        </div>
      </div>
    </header>
  );
}
