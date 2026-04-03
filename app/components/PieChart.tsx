interface PieChartDataPoint {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartDataPoint[];
  size?: number;
}

export default function PieChart({ data, size = 140 }: PieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  // Build conic gradient stops
  let accumulated = 0;
  const gradientStops = data.map((d) => {
    const start = accumulated;
    accumulated += (d.value / total) * 360;
    return `${d.color} ${start}deg ${accumulated}deg`;
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
      {/* Donut chart */}
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "50%",
          background: `conic-gradient(${gradientStops.join(", ")})`,
          position: "relative",
          flexShrink: 0,
        }}
      >
        {/* Inner hole for donut */}
        <div
          style={{
            position: "absolute",
            top: "25%",
            left: "25%",
            width: "50%",
            height: "50%",
            borderRadius: "50%",
            background: "#ffffff",
          }}
        />
      </div>

      {/* Legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {data.map((d, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12px",
              color: "#374151",
            }}
          >
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "2px",
                background: d.color,
                flexShrink: 0,
              }}
            />
            {d.label} ({Math.round((d.value / total) * 100)}%)
          </div>
        ))}
      </div>
    </div>
  );
}
