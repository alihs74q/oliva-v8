const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function getApprovedAdminEmails(): Set<string> {
  const raw = process.env.ADMIN_EMAILS ?? "";
  const emails = raw.split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
  if (emails.length !== 3 || new Set(emails).size !== 3 || emails.some((email) => !EMAIL_PATTERN.test(email))) {
    throw new Error("ADMIN_EMAILS must contain exactly three unique valid email addresses");
  }
  return new Set(emails);
}

export function isApprovedAdminEmail(email: string): boolean {
  try {
    return getApprovedAdminEmails().has(email.trim().toLowerCase());
  } catch {
    return false;
  }
}