import { describe, expect, it } from 'vitest';
import { detectImageType } from '@/lib/admin/image-type';

const bytes = (...values: (number | string)[]) =>
  new Uint8Array(values.flatMap((value) => (typeof value === 'string' ? [...value].map((c) => c.charCodeAt(0)) : [value])));

describe('detectImageType', () => {
  it('recognises JPEG, PNG, and WebP by their signatures', () => {
    expect(detectImageType(bytes(0xff, 0xd8, 0xff, 0xe0))?.type).toBe('image/jpeg');
    expect(detectImageType(bytes(0x89, 'PNG', 0x0d, 0x0a))?.extension).toBe('png');
    expect(detectImageType(bytes('RIFF', 0, 0, 0, 0, 'WEBPVP8 '))?.type).toBe('image/webp');
  });

  it('rejects other content regardless of the claimed file type', () => {
    expect(detectImageType(bytes('<svg xmlns="http://www.w3.org/2000/svg">'))).toBeNull();
    expect(detectImageType(bytes('GIF89a'))).toBeNull();
    expect(detectImageType(bytes('RIFF', 0, 0, 0, 0, 'WAVE'))).toBeNull();
    expect(detectImageType(new Uint8Array())).toBeNull();
  });
});
