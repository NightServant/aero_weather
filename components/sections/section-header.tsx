import { GlassCard } from "@/components/aero/glass-card";

/** Consistent in-flow section header (kicker + h2 title + optional subtitle). */
export function SectionHeader({
  id,
  kicker,
  title,
  subtitle,
}: {
  id: string;
  kicker: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <GlassCard variant="glass" as="header" className="px-6 py-7 sm:px-10 sm:py-8">
      <p className="kicker">{kicker}</p>
      <h2 id={id} className="text-headline mt-3">
        {title}
      </h2>
      {subtitle ? <p className="text-subtitle mt-2 max-w-2xl">{subtitle}</p> : null}
    </GlassCard>
  );
}
