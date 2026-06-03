import bcrypt from "bcryptjs";
import { createHash } from "crypto";
import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_IDENTITY_COOKIE,
  ADMIN_SESSION_ROLE_COOKIE
} from "@/lib/auth";
import { pool } from "@/lib/db";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DIGIT_PATTERN = /\d/;
const ADMIN_CODE_PATTERN = /^[A-Z0-9_-]{6,64}$/;

type ExistingAdminRow = {
  id: string;
  username: string | null;
  email: string;
};

type AdminCodeRow = {
  id: string;
  code_hash: string;
  used_by_admin_id: string | null;
  used_at: string | null;
  is_active: boolean;
};

function normalizeAdminCode(value: string) {
  return value.trim().toUpperCase();
}

function getAdminCodePepper() {
  return process.env.ADMIN_CODE_PEPPER || process.env.DATABASE_URL || "shipin-go-admin-code";
}

function getAdminCodeFingerprint(code: string) {
  return createHash("sha256")
    .update(`${getAdminCodePepper()}:${normalizeAdminCode(code)}`)
    .digest("hex");
}

function getSeedAdminCodes() {
  return (process.env.ADMIN_REGISTER_CODES || "")
    .split(",")
    .map((code) => normalizeAdminCode(code))
    .filter((code) => ADMIN_CODE_PATTERN.test(code));
}

async function ensureAdminCodeTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS shipin_admin_codes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      code_fingerprint TEXT NOT NULL UNIQUE,
      code_hash TEXT NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      used_by_admin_id UUID UNIQUE REFERENCES shipin_users(id) ON DELETE SET NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_shipin_admin_codes_unused
      ON shipin_admin_codes (code_fingerprint)
      WHERE used_at IS NULL AND is_active = TRUE
  `);
}

async function seedAdminCodesFromEnv() {
  const codes = getSeedAdminCodes();
  if (!codes.length) return;

  await Promise.all(
    codes.map(async (code) => {
      const fingerprint = getAdminCodeFingerprint(code);
      const hash = await bcrypt.hash(code, 10);
      await pool.query(
        `
          INSERT INTO shipin_admin_codes (code_fingerprint, code_hash)
          VALUES ($1, $2)
          ON CONFLICT (code_fingerprint) DO NOTHING
        `,
        [fingerprint, hash]
      );
    })
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fullName = String(body.fullName || "").trim();
    const username = String(body.username || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const adminCode = normalizeAdminCode(String(body.adminCode || ""));
    const password = String(body.password || "");
    const remember = Boolean(body.remember);

    if (!fullName) {
      return NextResponse.json({ field: "fullName", message: "Nama lengkap tidak boleh kosong" }, { status: 400 });
    }

    if (!username) {
      return NextResponse.json({ field: "username", message: "Username tidak boleh kosong" }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ field: "email", message: "Email tidak boleh kosong" }, { status: 400 });
    }

    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ field: "email", message: "Format email tidak valid" }, { status: 400 });
    }

    if (!adminCode) {
      return NextResponse.json({ field: "adminCode", message: "Kode Admin tidak boleh kosong." }, { status: 400 });
    }

    if (!ADMIN_CODE_PATTERN.test(adminCode)) {
      return NextResponse.json({ field: "adminCode", message: "Kode Admin tidak valid." }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ field: "password", message: "Password tidak boleh kosong" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ field: "password", message: "Password minimal 8 karakter" }, { status: 400 });
    }

    if (!DIGIT_PATTERN.test(password)) {
      return NextResponse.json({ field: "password", message: "Password harus mengandung angka" }, { status: 400 });
    }

    const existingResult = await pool.query<ExistingAdminRow>(
      `
        SELECT id, username, email
        FROM shipin_users
        WHERE LOWER(email) = $1
          OR LOWER(COALESCE(username, '')) = $2
        LIMIT 2
      `,
      [email, username.toLowerCase()]
    );

    const existingEmail = existingResult.rows.find((row) => row.email.toLowerCase() === email);
    if (existingEmail) {
      return NextResponse.json({ field: "email", message: "Email sudah digunakan" }, { status: 409 });
    }

    const existingUsername = existingResult.rows.find(
      (row) => (row.username || "").toLowerCase() === username.toLowerCase()
    );
    if (existingUsername) {
      return NextResponse.json({ field: "username", message: "Username sudah digunakan" }, { status: 409 });
    }

    await ensureAdminCodeTable();
    await seedAdminCodesFromEnv();

    const adminCodeFingerprint = getAdminCodeFingerprint(adminCode);
    const codeResult = await pool.query<AdminCodeRow>(
      `
        SELECT id, code_hash, used_by_admin_id, used_at, is_active
        FROM shipin_admin_codes
        WHERE code_fingerprint = $1
        LIMIT 1
      `,
      [adminCodeFingerprint]
    );
    const codeRow = codeResult.rows[0];

    if (!codeRow || !codeRow.is_active) {
      return NextResponse.json({ field: "adminCode", message: "Kode Admin tidak valid." }, { status: 403 });
    }

    if (codeRow.used_at || codeRow.used_by_admin_id) {
      return NextResponse.json({ field: "adminCode", message: "Kode Admin tidak valid." }, { status: 409 });
    }

    const isCodeValid = await bcrypt.compare(adminCode, codeRow.code_hash);
    if (!isCodeValid) {
      return NextResponse.json({ field: "adminCode", message: "Kode Admin tidak valid." }, { status: 403 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const client = await pool.connect();
    let admin: {
      id: string;
      username: string | null;
      email: string;
    };

    try {
      await client.query("BEGIN");

      const lockedCode = await client.query<AdminCodeRow>(
        `
          SELECT id, code_hash, used_by_admin_id, used_at, is_active
          FROM shipin_admin_codes
          WHERE code_fingerprint = $1
          FOR UPDATE
        `,
        [adminCodeFingerprint]
      );
      const lockedCodeRow = lockedCode.rows[0];

      if (!lockedCodeRow || !lockedCodeRow.is_active) {
        await client.query("ROLLBACK");
        return NextResponse.json({ field: "adminCode", message: "Kode Admin tidak valid." }, { status: 403 });
      }

      if (lockedCodeRow.used_at || lockedCodeRow.used_by_admin_id) {
        await client.query("ROLLBACK");
        return NextResponse.json({ field: "adminCode", message: "Kode Admin tidak valid." }, { status: 409 });
      }

      const inserted = await client.query<{
        id: string;
        username: string | null;
        email: string;
      }>(
        `
          INSERT INTO shipin_users (
            full_name,
            username,
            email,
            role,
            password_hash,
            account_status
          )
          VALUES ($1, $2, $3, 'ADMIN', $4, 'AKTIF')
          RETURNING id, username, email
        `,
        [fullName, username, email, passwordHash]
      );

      admin = inserted.rows[0];

      await client.query(
        `
          UPDATE shipin_admin_codes
          SET used_by_admin_id = $1, used_at = NOW()
          WHERE id = $2
        `,
        [admin.id, lockedCodeRow.id]
      );

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

    const maxAge = remember ? 60 * 60 * 24 * 7 : 60 * 60 * 6;
    const identityMaxAge = 60 * 60 * 24 * 30;

    const response = NextResponse.json({
      ok: true,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email
      }
    });

    response.cookies.set(ADMIN_SESSION_COOKIE, "active", {
      path: "/",
      maxAge,
      sameSite: "lax"
    });
    response.cookies.set(ADMIN_SESSION_IDENTITY_COOKIE, admin.id, {
      path: "/",
      maxAge: identityMaxAge,
      sameSite: "lax"
    });
    response.cookies.set(ADMIN_SESSION_ROLE_COOKIE, "ADMIN", {
      path: "/",
      maxAge: identityMaxAge,
      sameSite: "lax"
    });

    return response;
  } catch (error) {
    console.error("POST /api/admin/register failed", error);
    return NextResponse.json({ message: "Gagal menyimpan data, coba lagi" }, { status: 500 });
  }
}
