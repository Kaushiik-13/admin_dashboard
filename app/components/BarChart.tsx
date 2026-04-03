interface BarChartDataPoint {
  label: string;
  value1: number;
  value2: number;
}

interface BarChartProps {
  data: BarChartDataPoint[];
  maxValue?: number;
}

export default function BarChart({ data, maxValue }: BarChartProps) {
  const max = maxValue || Math.max(...data.map((d) => d.value1 + d.value2)) * 1.2;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: "16px",
        height: "160px",
        padding: "0 8px",
      }}
    >
      {data.map((item, idx) => (
        <div
          key={idx}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            height: "100%",
            justifyContent: "flex-end",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "3px",
              alignItems: "flex-end",
              width: "100%",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "40%",
                height: `${(item.value1 / max) * 140}px`,
                background: "#2d6a4f",
                borderRadius: "3px 3px 0 0",
                minHeight: "4px",
                transition: "height 0.3s ease",
              }}
            />
            <div
              style={{
                width: "40%",
                height: `${(item.value2 / max) * 140}px`,
                background: "#d1d5db",
                borderRadius: "3px 3px 0 0",
                minHeight: "4px",
                transition: "height 0.3s ease",
              }}
            />
          </div>
          <span
            style={{
              fontSize: "11px",
              color: "#9ca3af",
              fontWeight: 500,
            }}
          >
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
