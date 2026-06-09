import { NextRequest, NextResponse } from "next/server";

function isMigrationAuthorized(request: NextRequest) {
  const secret = process.env.SHIPIN_MIGRATION_SECRET;
  const providedSecret = request.headers.get("x-migration-secret") || request.nextUrl.searchParams.get("secret");

  return Boolean(secret && providedSecret && providedSecret === secret);
}

function unauthorizedMigrationResponse() {
  return NextResponse.json({ message: "Akses migrasi tidak diizinkan." }, { status: 403 });
}

export async function POST(request: NextRequest) {
  if (!isMigrationAuthorized(request)) {
    return unauthorizedMigrationResponse();
  }

  try {
    const { db } = await import("@/lib/db");

    // Check if constraint already exists
    const constraintCheck = await db.query<{ exists: boolean }>(
      `SELECT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'riwayat_pengiriman_unique_resi_status'
      )`
    );

    if (constraintCheck.rows[0]?.exists) {
      return NextResponse.json({
        message: "ConstraintAlready exists, no changes made.",
        status: "skipped"
      });
    }

    // Add unique constraint
    await db.query(
      `ALTER TABLE riwayat_pengiriman
       ADD CONSTRAINT riwayat_pengiriman_unique_resi_status
       UNIQUE (resi_id, status)`
    );

    return NextResponse.json({
      message: "Constraint added successfully.",
      status: "success"
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Migration failed.",
        status: "error"
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  if (!isMigrationAuthorized(request)) {
    return unauthorizedMigrationResponse();
  }

  try {
    const { db } = await import("@/lib/db");

    const constraintCheck = await db.query<{ exists: boolean }>(
      `SELECT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'riwayat_pengiriman_unique_resi_status'
      )`
    );

    return NextResponse.json({
      constraint_exists: constraintCheck.rows[0]?.exists ?? false
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Check failed." },
      { status: 500 }
    );
  }
}
