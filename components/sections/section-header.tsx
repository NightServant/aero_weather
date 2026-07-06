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
    <div>
      <p className="kicker">{kicker}</p>
      <h2 id={id} className="text-headline mt-3">
        {title}
      </h2>
      {subtitle ? <p className="text-subtitle mt-2 max-w-2xl">{subtitle}</p> : null}
    </div>
  );
}
