'use client';

import { useFormStatus } from 'react-dom';

export function SubmitButton({ children, pendingLabel = 'Saving…' }: { children: string; pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="admin-button" type="submit" disabled={pending} aria-disabled={pending}>
      {pending ? pendingLabel : children}
    </button>
  );
}
