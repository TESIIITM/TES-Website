import type { Metadata } from 'next';
import Link from 'next/link';
import { StatusPage } from '@/components/status-page';

export const metadata: Metadata = {
  title: 'Page not found',
};

export default function NotFound() {
  return (
    <StatusPage code="404" title="Off the map." detail="That page does not exist, or it has moved.">
      <Link className="text-action" href="/">Back to the society</Link>
    </StatusPage>
  );
}