/** A compass needle: a filled north half and an outlined south half. Rotated by CSS. */
export function NeedleIcon({ size = 14 }: { size?: number }) {
  return (
    <svg className="needle-icon" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 1.5 15.5 12h-7Z" fill="currentColor" />
      <path d="M12 22.5 8.5 12h7Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
