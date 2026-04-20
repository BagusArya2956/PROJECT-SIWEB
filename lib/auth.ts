export const ADMIN_SESSION_COOKIE = "shipin_admin_session";
export const ADMIN_USERNAME = "AdminShip1";
export const ADMIN_PASSWORD = "Admin123";

export function isValidAdminCredential(username: string, password: string) {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}
