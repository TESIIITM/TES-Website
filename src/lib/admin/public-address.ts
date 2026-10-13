import { isIPv4, isIPv6 } from 'node:net';

// Loopback, private, link-local, carrier-grade NAT, benchmarking, multicast, and reserved ranges.
const blockedV4: [number, number][] = [
  [0x00000000, 8], [0x0a000000, 8], [0x64400000, 10], [0x7f000000, 8], [0xa9fe0000, 16],
  [0xac100000, 12], [0xc0000000, 24], [0xc0000200, 24], [0xc0a80000, 16], [0xc6120000, 15],
  [0xc6336400, 24], [0xcb007100, 24], [0xe0000000, 3],
];

function v4ToNumber(address: string): number {
  return address.split('.').reduce((total, part) => total * 256 + Number(part), 0);
}

function isPublicV4(address: string): boolean {
  const value = v4ToNumber(address);
  return !blockedV4.some(([base, bits]) => Math.floor(value / 2 ** (32 - bits)) === Math.floor(base / 2 ** (32 - bits)));
}

/**
 * Whether an address is on the public internet. Used before fetching a link an
 * admin pasted, so the server can't be pointed at itself or its network.
 */
export function isPublicAddress(address: string): boolean {
  if (isIPv4(address)) return isPublicV4(address);
  if (!isIPv6(address)) return false;
  const lower = address.toLowerCase();
  const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPublicV4(mapped[1]);
  // Global unicast is 2000::/3; everything else (loopback, ULA, link-local, multicast, NAT64…) stays out.
  return /^[23]/.test(lower) && !lower.startsWith('2001:db8') && !lower.startsWith('2002:');
}
