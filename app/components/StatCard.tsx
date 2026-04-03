interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  subtitleColor?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  subtitleColor = "#2d6a4f",
}: StatCardProps) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "8px",
        padding: "20px 24px",
        border: "1px solid #e5e7eb",
        flex: 1,
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: "11px",
          fontWeight: 600,
          color: "#9ca3af",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          marginBottom: "8px",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: "28px",
          fontWeight: 700,
          color: "#1a1a1a",
          lineHeight: 1.2,
          marginBottom: "4px",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "12px",
          color: subtitleColor,
        }}
      >
        {subtitle}
      </div>
    </div>
  );
}
