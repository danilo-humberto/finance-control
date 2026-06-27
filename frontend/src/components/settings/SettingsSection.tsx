import { type ReactNode } from 'react';

type SettingsSectionProps = {
  title: string;
  children: ReactNode;
};

export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <section className="space-y-2" aria-labelledby={`settings-${title}`}>
      <h2
        id={`settings-${title}`}
        className="text-[0.94rem] font-semibold leading-tight text-app-muted"
      >
        {title}
      </h2>

      <div className="overflow-hidden rounded-2xl border border-app-border bg-app-surface/75 shadow-lg shadow-black/15">
        {children}
      </div>
    </section>
  );
}
