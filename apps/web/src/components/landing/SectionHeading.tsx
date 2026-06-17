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
    <div className={center ? 'text-center' : ''}>
      <p
        className={`text-[13px] font-bold uppercase tracking-[0.15em] ${
          light ? 'text-blue-400' : 'text-brand-700'
        }`}
      >
        {label}
      </p>
      <h2
        className={`mt-3 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl ${
          light ? 'text-white' : 'text-ink'
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-4 max-w-2xl text-lg leading-relaxed ${center ? 'mx-auto' : ''} ${
            light ? 'text-slate-300' : 'text-muted'
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
