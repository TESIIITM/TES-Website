import type { ReactNode } from 'react';
import { GitBranch } from 'lucide-react';

type Props = { code: string; title: string; detail: string; children: ReactNode };

export function StatusPage({ code, title, detail, children }: Props) {
  return (
    <main className="status-page">
      <span className="status-chip"><GitBranch size={14} aria-hidden="true" />{code === '404' ? 'HEAD detached at 404' : 'Checks failing with 500'}</span>
      <h1>{title}</h1>
      <p>{detail}</p>
      {children}
    </main>
  );
}
