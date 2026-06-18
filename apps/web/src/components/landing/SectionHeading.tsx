import { ReactNode } from 'react';

export default function SectionHeading({
  label,
  title,
  subtitle,
  center = false,
  light = false,
}: {
  label: string;
  title: ReactNode;
  subtitle?: ReactNode;
  center?: boolean;
  light?: boolean;
}) {
  return (
    <div className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <p
        className={`text-xs font-semibold uppercase tracking-[0.18em] ${
          light ? 'text-brand-200' : 'text-brand-600'
        }`}
      >
        {label}
      </p>
      <h2
        className={`font-display mt-3 text-3xl font-bold leading-[1.12] tracking-tight sm:text-[2.5rem] ${
          light ? 'text-white' : 'text-slate-900'
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-4 text-lg leading-relaxed ${center ? 'mx-auto' : ''} ${
            light ? 'text-slate-300' : 'text-slate-600'
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
