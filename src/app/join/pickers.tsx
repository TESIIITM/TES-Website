/* The role and domain questions as illustrated radio groups. */

import type { ReactNode } from 'react';

const icon = (children: ReactNode) => (
  <svg className="join-role-icon" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const ROLE_ICONS: Record<string, ReactNode> = {
  technical: icon(<><path d="M8 7l-5 5 5 5" /><path d="M16 7l5 5-5 5" /><path d="M13.5 4l-3 16" /></>),
  mentor: icon(<><circle cx="8" cy="7" r="3" /><path d="M2.5 20c0-3.6 2.4-6.2 5.5-6.2s5.5 2.6 5.5 6.2" /><circle cx="17.5" cy="10" r="2.2" /><path d="M14.6 20c.2-2.6 1.3-4.6 2.9-4.6s2.7 2 2.9 4.6" /><path d="M11.5 8.5l3.2 1.2" strokeDasharray="1 1.6" /></>),
  domain_lead: icon(<><path d="M5 21V3.5" /><path d="M5 4h12l-2.5 4L17 12H5" /></>),
  operations: icon(<><circle cx="12" cy="12" r="3.2" />{[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <path key={a} d="M12 3.5v2.6" transform={`rotate(${a} 12 12)`} />)}<circle cx="12" cy="12" r="6.2" /></>),
  design: icon(<><path d="M12 2.8l6.2 8.4L12 21.2l-6.2-10z" /><path d="M12 2.8v7.4" /><circle cx="12" cy="11.6" r="1.4" /></>),
  promotions: icon(<><path d="M3 10v4h3.2L15 18.5v-13L6.2 10z" /><path d="M18.2 9.2a4 4 0 0 1 0 5.6" /><path d="M20.4 7a7 7 0 0 1 0 10" /><path d="M7 14l1.2 5h2.2l-1-4.4" /></>),
};

const ROLE_NOTES: Record<string, string> = {
  technical: 'Build in one domain',
  mentor: 'Guide newer members',
  domain_lead: 'Run a domain',
  operations: 'Keep things running',
  design: 'Shape how TES looks',
  promotions: 'Tell people about it',
};

type PickerProps = { value: string[]; onChange: (value: string[]) => void; describedBy?: string };

const toggle = (list: string[], item: string) => (list.includes(item) ? list.filter((entry) => entry !== item) : [...list, item]);

/** Only the roles open to the chosen year are offered; none until a year is chosen. Any number can be picked. */
export function RolePicker({ roles, disabled, value, onChange, describedBy }: PickerProps & { roles: { value: string; label: string }[]; disabled: boolean }) {
  if (disabled) return <p className="join-picker-empty" id="roles">Choose your year of study to see the roles open to you.</p>;
  return (
    <div className="join-roles" id="roles" role="group" aria-labelledby="roles-label" aria-describedby={describedBy}>
      {roles.map((role) => (
        <label key={role.value} className="join-role">
          <input type="checkbox" name="roles" value={role.value} checked={value.includes(role.value)} onChange={() => onChange(toggle(value, role.value))} />
          {ROLE_ICONS[role.value]}
          <b>{role.label}</b>
          <small>{ROLE_NOTES[role.value]}</small>
        </label>
      ))}
    </div>
  );
}

/** Up to `max` domains; once that many are picked, the rest wait until one is unpicked. */
export function DomainPicker({ domains, max, value, onChange, describedBy }: PickerProps & { domains: string[]; max: number }) {
  const full = value.length >= max;
  return (
    <div className="join-domains" id="domains" role="group" aria-labelledby="domains-label" aria-describedby={describedBy}>
      {domains.map((domain) => {
        const checked = value.includes(domain);
        return (
          <label key={domain} className="join-domain">
            <input type="checkbox" name="domains" value={domain} checked={checked} disabled={full && !checked} onChange={() => onChange(toggle(value, domain))} />
            <span>{domain}</span>
          </label>
        );
      })}
    </div>
  );
}
