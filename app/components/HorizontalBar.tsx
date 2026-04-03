interface HorizontalBarDataPoint {
  label: string;
  percentage: number;
  color: string;
}

interface HorizontalBarProps {
  data: HorizontalBarDataPoint[];
}

export default function HorizontalBar({ data }: HorizontalBarProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {data.map((item, idx) => (
        <div
          key={idx}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <span
            style={{
              fontSize: "13px",
              color: "#374151",
              width: "80px",
              flexShrink: 0,
              textAlign: "right",
            }}
          >
            {item.label}
          </span>
          <div
            style={{
              flex: 1,
              height: "12px",
              background: "#f3f4f6",
              borderRadius: "6px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${item.percentage}%`,
                height: "100%",
                background: item.color,
                borderRadius: "6px",
                transition: "width 0.5s ease",
              }}
            />
          </div>
          <span
            style={{
              fontSize: "13px",
              color: "#6b7280",
              width: "40px",
              flexShrink: 0,
            }}
          >
            {item.percentage}%
          </span>
        </div>
      ))}
    </div>
  );
}
