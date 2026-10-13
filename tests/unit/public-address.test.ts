import { describe, expect, it } from 'vitest';
import { isPublicAddress } from '@/lib/admin/public-address';

describe('isPublicAddress', () => {
  it('allows public IPv4 and IPv6 addresses', () => {
    for (const address of ['8.8.8.8', '104.16.0.1', '172.32.0.1', '2606:4700::6810:84e5']) expect(isPublicAddress(address)).toBe(true);
  });

  it('refuses loopback, private, link-local, and reserved ranges', () => {
    for (const address of [
      '127.0.0.1', '10.1.2.3', '172.16.0.1', '172.31.255.255', '192.168.1.1', '169.254.169.254', '100.64.0.1', '0.0.0.0', '224.0.0.1', '255.255.255.255',
      '::1', '::', 'fe80::1', 'fd00::1', '::ffff:127.0.0.1', '::ffff:10.0.0.1', '2001:db8::1', 'not-an-ip',
    ]) expect(isPublicAddress(address), address).toBe(false);
  });
});
