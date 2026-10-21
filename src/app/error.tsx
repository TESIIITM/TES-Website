'use client';

import { StatusPage } from '@/components/status-page';

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <StatusPage code="500" title="Something broke." detail="The page could not be loaded. It is usually temporary.">
      <button className="pill-button" onClick={reset}>Try again</button>
    </StatusPage>
  );
}
