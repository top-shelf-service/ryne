import crypto from "node:crypto";
import QRCode from "qrcode";

const BASE32_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no I,L,O,1,0

function randomBytes(n = 10) {
  return crypto.randomBytes(n);
}

function encodeBase32(bytes: Buffer, len = 8) {
  let out = "";
  for (let i = 0; i < bytes.length && out.length < len; i++) {
    out += BASE32_ALPHABET[bytes[i] % BASE32_ALPHABET.length];
  }
  return out;
}

export function generateOrgUid(orgName: string) {
  const slug = orgName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 12);
  const fp = encodeBase32(randomBytes(6), 6);
  return `${slug || "org"}-${fp}`;
}

export function generateJoinCode() {
  return encodeBase32(randomBytes(10), 8);
}

export function buildInviteLink(baseUrl: string, orgUid: string, joinCode: string) {
  const url = new URL("/join", baseUrl);
  url.searchParams.set("org", orgUid);
  url.searchParams.set("code", joinCode);
  return url.toString();
}

export async function generateInviteQrDataUrl(inviteUrl: string) {
  return QRCode.toDataURL(inviteUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    scale: 6
  });
}
