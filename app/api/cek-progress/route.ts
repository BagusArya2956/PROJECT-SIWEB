import { NextResponse } from "next/server";

import { pool } from "@/lib/db";
import { syncShipmentCheckpoints } from "@/lib/utils/checkpoint";

type ProgressRow = {
  resi_code: string;
  destination_city: string;
  origin_city: string;
  waktu_berangkat: string | null;
  durasi_estimasi_ms: string | null;
};

function toNumber(value: string | null) {
  if (!value) return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

export async function GET() {
  try {
    const result = await pool.query<ProgressRow>(
      `
        SELECT
          s.resi_code,
          oa.city AS origin_city,
          da.city AS destination_city,
          s.waktu_berangkat,
          s.durasi_estimasi_ms
        FROM shipin_shipments s
        JOIN shipin_addresses oa ON oa.id = s.origin_address_id
        JOIN shipin_addresses da ON da.id = s.destination_address_id
        WHERE s.shipment_status = 'DALAM_PERJALANAN'
      `
    );

    let updated = 0;

    for (const row of result.rows) {
      const waktuBerangkat = toNumber(row.waktu_berangkat);
      const durasiEstimasiMs = toNumber(row.durasi_estimasi_ms);

      if (!waktuBerangkat || !durasiEstimasiMs || durasiEstimasiMs <= 0) {
        continue;
      }

      const progress = (Date.now() - waktuBerangkat) / durasiEstimasiMs;
      if (progress < 1) {
        continue;
      }

      await syncShipmentCheckpoints({
        resi: row.resi_code,
        originCity: row.origin_city,
        destinationCity: row.destination_city,
        shipmentStatus: "DALAM_PERJALANAN",
        waktuBerangkat,
        durasiEstimasiMs
      });

      updated += 1;
    }

    return NextResponse.json({
      ok: true,
      checked: result.rows.length,
      updated
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Gagal mengecek progress pengiriman."
      },
      { status: 500 }
    );
  }
}
