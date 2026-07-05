"use client";

/** Shared below-fold detail tile: icon + caps label, big value + unit, caption. */
export function DetailTile({
  icon,
  label,
  value,
  unit,
  caption,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  caption?: React.ReactNode;
}) {
  return (
    <div className="tint-card flex flex-col p-5" data-animate="">
      <div className="mb-3 flex items-center gap-2 text-muted-foreground">
        {icon}
        <h3 className="card-subtitle-caps">{label}</h3>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="stat-value text-3xl">{value}</span>
        {unit ? <span className="caption">{unit}</span> : null}
      </div>
      {caption ? <p className="caption mt-3">{caption}</p> : null}
    </div>
  );
}
