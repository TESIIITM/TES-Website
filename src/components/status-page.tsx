import type { ReactNode } from 'react';

type Props = { code: string; title: string; detail: string; children: ReactNode };

export function StatusPage({ code, title, detail, children }: Props) {
  return (
    <main className="status-page">
      <span className="eyebrow">THE ENIGMA SOCIETY / {code}</span>
      <h1>{title}</h1>
      <p>{detail}</p>
      {children}
    </main>
  );
}
