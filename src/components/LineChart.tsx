type LineChartProps = {
  data: number[];
  label: string;
  description: string;
  color?: string;
  height?: number;
};

export default function LineChart({
  data,
  label,
  description,
  color = "#34d399",
  height = 120,
}: LineChartProps) {
  if (data.length === 0) {
    return null;
  }

  const width = 320;
  const padding = 10;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x =
      data.length === 1
        ? width / 2
        : padding + (index / (data.length - 1)) * (width - padding * 2);
    const y =
      height - padding - ((value - min) / range) * (height - padding * 2);
    return { x, y };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const areaPath =
    `${linePath} ` +
    `L ${points[points.length - 1].x} ${height - padding} ` +
    `L ${points[0].x} ${height - padding} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="h-full w-full"
      role="img"
      aria-label={label}
    >
      <desc>{description}</desc>
      <path d={areaPath} fill={color} fillOpacity={0.12} stroke="none" />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {points.map((point, index) => (
        <circle key={index} cx={point.x} cy={point.y} r={2.5} fill={color} />
      ))}
    </svg>
  );
}
