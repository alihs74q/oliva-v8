import { randomUUID } from "node:crypto";

const SIDECAR_ENDPOINT = "http://127.0.0.1:1106";

function privateObjectDir(): string {
  const value = process.env.PRIVATE_OBJECT_DIR?.trim();
  if (!value) throw new Error("PRIVATE_OBJECT_DIR is not configured");
  return value.replace(/\/+$/, "");
}

function objectLocation(id: string): { bucketName: string; objectName: string; objectPath: string } {
  if (!/^[a-zA-Z0-9_-]{16,80}$/.test(id)) throw new Error("Invalid object id");
  const fullPath = `${privateObjectDir()}/oliva-promotions/${id}`;
  const parts = fullPath.replace(/^\/+/, "").split("/");
  if (parts.length < 2) throw new Error("Invalid object storage path");
  return {
    bucketName: parts[0],
    objectName: parts.slice(1).join("/"),
    objectPath: `/objects/${parts.slice(1).join("/")}`,
  };
}

async function signedObjectUrl(
  id: string,
  method: "GET" | "PUT",
): Promise<string> {
  const location = objectLocation(id);
  const response = await fetch(`${SIDECAR_ENDPOINT}/object-storage/signed-object-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bucket_name: location.bucketName,
      object_name: location.objectName,
      method,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`Unable to sign object URL (${response.status})`);
  const data = await response.json() as { signed_url?: string };
  if (!data.signed_url) throw new Error("Object storage returned no signed URL");
  return data.signed_url;
}

export async function uploadPromotionImage(buffer: Buffer, contentType: string): Promise<string> {
  const id = randomUUID().replace(/-/g, "");
  const uploadUrl = await signedObjectUrl(id, "PUT");
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: buffer,
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) throw new Error(`Unable to upload image (${response.status})`);
  return id;
}

export async function downloadPromotionImage(id: string): Promise<Response> {
  return fetch(await signedObjectUrl(id, "GET"), {
    signal: AbortSignal.timeout(30_000),
  });
}
