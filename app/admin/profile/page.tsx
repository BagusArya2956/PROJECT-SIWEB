import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminProfilePage() {
  return (
    <AdminShell
      title="Profile Admin"
      description="Informasi akun admin SHIPIN GO dan preferensi area kerja."
    >
      <section className="rounded-[30px] border border-white/80 bg-white p-6 shadow-card">
        <h2 className="text-xl font-bold text-shipin-ink">Profil admin</h2>
        <p className="mt-3 text-sm leading-7 text-shipin-text">
          Halaman ini dipisahkan jelas dari beranda pengguna untuk menjaga flow akses tetap bersih dan terstruktur.
        </p>
      </section>
    </AdminShell>
  );
}
