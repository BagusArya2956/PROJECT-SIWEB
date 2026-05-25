import { NextResponse } from "next/server";

import { pool } from "@/lib/db";

export async function GET() {
  const result = await pool.query(`
    SELECT
      v.id,
      COALESCE(v.vehicle_name, v.vehicle_type || ' ' || v.plate_number) AS vehicle_name,
      v.vehicle_type,
      v.plate_number,
      v.capacity_kg,
      v.vehicle_status,
      h.hub_name,
      h.city
    FROM shipin_vehicles v
    JOIN shipin_hubs h ON h.id = v.home_hub_id
    ORDER BY v.id
  `);

  return NextResponse.json({ vehicles: result.rows });
}
