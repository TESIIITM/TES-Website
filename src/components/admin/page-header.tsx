import Link from 'next/link';
import type { ReactNode } from 'react';

type Props = {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  action?: { href: string; label: string };
  back?: { href: string; label: string };
};

export function PageHeader({ eyebrow, title, description, action, back }: Props) {
  return (
    <header className="admin-page-header">
      <div>
        {back && <Link className="admin-back" href={back.href}>← {back.label}</Link>}
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action && <Link className="admin-button" href={action.href}>{action.label}</Link>}
    </header>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="admin-empty">{children}</div>;
}
