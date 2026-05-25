import { NextRequest, NextResponse } from "next/server";

import { pool } from "@/lib/db";
import { getCheckpointsByResi, syncShipmentCheckpoints } from "@/lib/utils/checkpoint";

/**
 * GET /api/checkpoints?resi=SPG-123456-ID
 * Fetch checkpoint/riwayat data for a specific shipment resi.
 */
export async function GET(request: NextRequest) {
  const resi = request.nextUrl.searchParams.get("resi");

  if (!resi) {
    return NextResponse.json({ checkpoints: [] });
  }

  try {
    const shipment = await pool.query<{
      origin_city: string;
      destination_city: string;
      shipment_status: string;
      waktu_berangkat: string | null;
      durasi_estimasi_ms: string | null;
    }>(
      `
        SELECT
          oa.city AS origin_city,
          da.city AS destination_city,
          s.shipment_status,
          s.waktu_berangkat,
          s.durasi_estimasi_ms
        FROM shipin_shipments s
        JOIN shipin_addresses oa ON oa.id = s.origin_address_id
        JOIN shipin_addresses da ON da.id = s.destination_address_id
        WHERE s.resi_code = $1
        LIMIT 1
      `,
      [resi]
    );

    if (shipment.rows[0]) {
      await syncShipmentCheckpoints({
        resi,
        originCity: shipment.rows[0].origin_city,
        destinationCity: shipment.rows[0].destination_city,
        shipmentStatus: shipment.rows[0].shipment_status,
        waktuBerangkat: shipment.rows[0].waktu_berangkat,
        durasiEstimasiMs: shipment.rows[0].durasi_estimasi_ms
      });
    }

    const checkpoints = await getCheckpointsByResi(resi);
    return NextResponse.json({ checkpoints });
  } catch {
    return NextResponse.json({ checkpoints: [] });
  }
}
