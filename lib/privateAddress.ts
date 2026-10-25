// Địa chỉ IP mà /api/fetch-exam không được phép gọi tới: mạng nội bộ, loopback,
// link-local (169.254.x.x là nơi các nhà cung cấp cloud để metadata/khoá), dải
// CGNAT, multicast… Tách riêng để test được mà không cần DNS.

import { isIP } from "node:net";

function privateV4(ip: string): boolean {
  const p = ip.split(".").map(Number);
  if (p.length !== 4 || p.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return true;
  const [a, b] = p;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) || // CGNAT 100.64.0.0/10
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0 && p[2] === 0) ||
    (a === 198 && (b === 18 || b === 19)) || // 198.18.0.0/15, mạng đo kiểm
    a >= 224 // multicast + dành riêng + 255.255.255.255
  );
}

/** true = không được gọi. Chuỗi không phải IP cũng tính là không được. */
export function isPrivateAddress(ip: string): boolean {
  const kind = isIP(ip);
  if (kind === 4) return privateV4(ip);
  if (kind !== 6) return true;

  const s = ip.toLowerCase();
  // IPv4 nằm trong IPv6 (::ffff:127.0.0.1, ::127.0.0.1): xét phần IPv4.
  const tail = s.match(/(\d+\.\d+\.\d+\.\d+)$/);
  if (tail) return privateV4(tail[1]);
  // ::ffff:7f00:1 — cùng địa chỉ trên, viết dạng hex.
  const mapped = s.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (mapped) {
    const hi = parseInt(mapped[1], 16);
    const lo = parseInt(mapped[2], 16);
    return privateV4(`${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`);
  }
  return (
    s === "::" ||
    s === "::1" ||
    /^f[cd]/.test(s) || // ULA fc00::/7
    /^fe[89ab]/.test(s) || // link-local fe80::/10
    /^ff/.test(s) // multicast
  );
}
