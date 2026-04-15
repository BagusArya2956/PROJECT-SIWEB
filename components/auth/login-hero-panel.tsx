import Image from "next/image";

import { TruckIcon } from "@/components/icons";

export function LoginHeroPanel() {
  return (
    <section className="relative min-h-[360px] overflow-hidden rounded-[30px] bg-[#0f5b32] text-white shadow-soft lg:min-h-[760px]">
      <Image
        src="/images/login-truck.svg"
        alt="Armada logistik SHIPIN GO"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,63,34,0.42)_0%,rgba(16,100,55,0.72)_35%,rgba(17,88,49,0.92)_100%)]" />
      <div className="absolute right-7 top-7 rounded-[24px] border border-white/12 bg-white/8 p-5 text-white/20 backdrop-blur-[2px]">
        <TruckIcon className="h-20 w-20 stroke-[1.2]" />
      </div>
      <div className="relative flex h-full flex-col justify-between p-8 sm:p-10 lg:p-12">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/12 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/90">
            <span className="h-2 w-2 rounded-full bg-[#c6ffd2]" />
            Modern Logistics
          </div>
          <h2 className="mt-8 max-w-[520px] text-4xl font-extrabold leading-[0.94] sm:text-5xl lg:text-[68px]">
            <span className="block">Solusi Cerdas</span>
            <span className="block">Untuk</span>
            <span className="block text-[#8FF29F]">Pengiriman</span>
            <span className="block text-[#8FF29F]">Global.</span>
          </h2>
          <p className="mt-7 max-w-[470px] text-sm leading-8 text-white/86 sm:text-base">
            Bergabunglah dengan ribuan bisnis yang telah mengoptimalkan rantai pasok mereka
            bersama ekosistem SHIPIN GO yang efisien dan transparan.
          </p>
        </div>

        <div className="grid max-w-[320px] grid-cols-2 gap-8 pt-10">
          <div>
            <p className="text-3xl font-extrabold text-white">99.9%</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/72">
              Akurasi Waktu
            </p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-white">50+</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/72">
              Partner Kurir
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
