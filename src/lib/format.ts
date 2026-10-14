// ─── Timestamp Formatting ───────────────────────────────────────────────────

// hh:mm:ss for table rows
export function formatTs(ms: number): string {
  const d = new Date(ms); // ts is in MILLISECONDS
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// Full date + time for tooltips
export function formatDateTs(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  );
}

// ─── Byte Size Formatting ───────────────────────────────────────────────────

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1_073_741_824) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  return `${(bytes / 1_073_741_824).toFixed(2)} GB`;
}

// ─── Bit Rate & Volume Formatting (PPS / BPS) ────────────────────────────────
// Matches dev_backend/static/js/app.js fmtBits exactly
export function fmtBitsParts(
  bits: number,
  perSec: boolean,
): { value: string; unit: string } {
  const u = perSec
    ? ["bit/s", "Kbit/s", "Mbit/s", "Gbit/s", "Tbit/s"]
    : ["bit", "Kbit", "Mbit", "Gbit", "Tbit"];
  let v = Math.max(0, bits);
  let i = 0;
  while (v >= 1000 && i < u.length - 1) {
    v /= 1000;
    i++;
  }
  return {
    value: i ? v.toFixed(2) : String(Math.round(v)),
    unit: u[i],
  };
}

export function fmtBits(bits: number, perSec: boolean): string {
  const { value, unit } = fmtBitsParts(bits, perSec);
  return `${value} ${unit}`;
}

// ─── Number Formatting ───────────────────────────────────────────────────────

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

export function formatPct(pct: number): string {
  return `${pct.toFixed(1)}%`;
}

// ─── DNS RCode Names ────────────────────────────────────────────────────────
// Source: RFC 1035 & dev_backend/static/js/app.js RCODE mapping

const RCODE_NAMES: Record<number, string> = {
  0: "NOERROR",
  1: "FORMERR",
  2: "SERVFAIL",
  3: "NXDOMAIN",
  4: "NOTIMP",
  5: "REFUSED",
  6: "YXDOMAIN",
  7: "YXRRSET",
  8: "NXRRSET",
  9: "NOTAUTH",
  10: "NOTZONE",
};

export function rcodeName(code: number): string {
  return RCODE_NAMES[code] ?? String(code);
}

// ─── ISO DateTime with Offset (Matches backend fromisoformat) ─────────────────
export function isoWithOffset(value: string | Date | number): string {
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  const off = -d.getTimezoneOffset();
  const a = Math.abs(off);
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` +
    `${off >= 0 ? "+" : "-"}${pad(Math.floor(a / 60))}:${pad(a % 60)}`
  );
}
