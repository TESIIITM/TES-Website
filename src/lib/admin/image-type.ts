const signatures: { type: string; extension: string; matches: (bytes: Uint8Array) => boolean }[] = [
  { type: 'image/jpeg', extension: 'jpg', matches: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { type: 'image/png', extension: 'png', matches: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  {
    type: 'image/webp',
    extension: 'webp',
    matches: (b) => String.fromCharCode(...b.subarray(0, 4)) === 'RIFF' && String.fromCharCode(...b.subarray(8, 12)) === 'WEBP',
  },
];

/** Identifies the image from its bytes; the browser-supplied type is not trusted. */
export function detectImageType(bytes: Uint8Array) {
  return signatures.find((signature) => signature.matches(bytes)) ?? null;
}
