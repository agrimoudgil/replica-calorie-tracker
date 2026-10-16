type Point = { label: string; value: number | null };

type TrendChartProps = {
  kind: "bar" | "line";
  title: string;
  points: Point[];
  target?: number;
  unit: string;
};

const W = 320;
const H = 160;
const PAD = { top: 12, right: 8, bottom: 24, left: 8 };

/** Small SVG chart with a text summary and a hidden data table for screen readers. */
export function TrendChart({ kind, title, points, target, unit }: TrendChartProps) {
  const values = points.map((p) => p.value).filter((v): v is number => v !== null);
  if (values.length === 0) {
    return <p className="rounded-lg bg-surface p-6 text-center text-sm text-muted">No {title.toLowerCase()} yet.</p>;
  }
  const max = Math.max(...values, target ?? 0) * 1.1;
  const min = kind === "line" ? Math.min(...values) * 0.98 : 0;
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (innerW / points.length) * (i + 0.5);
  const y = (v: number) => PAD.top + innerH - ((v - min) / (max - min || 1)) * innerH;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const summary = `${title}: average ${Math.round(avg)} ${unit} over ${values.length} days${target ? `, target ${target} ${unit}` : ""}.`;
  const linePath = points
    .map((p, i) => (p.value === null ? null : `${x(i)},${y(p.value)}`))
    .filter(Boolean)
    .join(" L ");

  return (
    <figure className="flex flex-col gap-2">
      <svg role="img" aria-label={summary} viewBox={`0 0 ${W} ${H}`} className="w-full">
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={PAD.left} x2={W - PAD.right} y1={PAD.top + innerH * f} y2={PAD.top + innerH * f} stroke="var(--border)" />
        ))}
        {kind === "bar" &&
          points.map((p, i) =>
            p.value === null ? null : (
              <rect
                key={p.label}
                x={x(i) - 12}
                y={y(p.value)}
                width={24}
                height={PAD.top + innerH - y(p.value)}
                rx={4}
                fill={target && p.value > target ? "var(--warning)" : "var(--accent)"}
              />
            ),
          )}
        {kind === "line" && (
          <>
            <path d={`M ${linePath}`} fill="none" stroke="var(--accent)" strokeWidth={2.5} strokeLinejoin="round" />
            {points.map((p, i) => (p.value === null ? null : <circle key={p.label} cx={x(i)} cy={y(p.value)} r={3.5} fill="var(--accent)" />))}
          </>
        )}
        {target !== undefined && (
          <line x1={PAD.left} x2={W - PAD.right} y1={y(target)} y2={y(target)} stroke="var(--text-muted)" strokeDasharray="4 4" />
        )}
        {points.map((p, i) => (
          <text key={p.label} x={x(i)} y={H - 6} textAnchor="middle" fontSize={11} fill="var(--text-muted)">
            {p.label}
          </text>
        ))}
      </svg>
      <figcaption className="text-xs text-muted">{summary}</figcaption>
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr><th scope="col">Day</th><th scope="col">{unit}</th></tr>
        </thead>
        <tbody>
          {points.map((p) => (
            <tr key={p.label}><td>{p.label}</td><td>{p.value ?? "no entry"}</td></tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
