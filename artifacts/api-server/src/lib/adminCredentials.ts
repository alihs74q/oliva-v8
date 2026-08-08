import { createHash, timingSafeEqual } from "node:crypto";

function required(name: "ADMIN_EMAIL" | "ADMIN_PASSWORD"): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable must be set`);
  }
  return value;
}

export function getAdminCredentials(): { email: string; password: string } {
  return {
    email: required("ADMIN_EMAIL").trim().toLowerCase(),
    password: required("ADMIN_PASSWORD"),
  };
}

export function secureStringEqual(left: string, right: string): boolean {
  const leftDigest = createHash("sha256").update(left).digest();
  const rightDigest = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftDigest, rightDigest);
}