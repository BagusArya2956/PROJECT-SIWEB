import Image from "next/image";
import Link from "next/link";

const adminMenu = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/kirim-paket", label: "Kirim Paket" },
  { href: "/admin/histori", label: "Histori" },
  { href: "/admin/profile", label: "Profile" },
  { href: "/admin/ulasan", label: "Ulasan" }
];

export function AdminSidebar() {
  return (
    <aside className="rounded-[30px] border border-white/80 bg-gradient-to-b from-[#f8fff8] to-white p-6 shadow-card">
      <div className="inline-flex items-center gap-2.5">
        <Image
          src="/images/shipin-logo.png"
          alt="SHIPIN GO Logo"
          width={72}
          height={72}
          className="h-[72px] w-[72px] rounded-md object-cover"
          priority
        />
        <p className="text-sm font-extrabold uppercase tracking-tight text-shipin-deep">SHIPIN GO</p>
      </div>
      <p className="mt-2 text-sm leading-7 text-shipin-text">
        Area admin terpisah dari landing page publik.
      </p>
      <nav className="mt-8 space-y-2">
        {adminMenu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-2xl px-4 py-3 text-sm font-semibold text-shipin-text hover:bg-[#edf7ee] hover:text-shipin-deep"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
