"use client";

import { useState } from "react";

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
  const [hoverData, setHoverData] = useState<{
    label: string;
    percentage: number;
    x: number;
    y: number;
    color: string;
  } | null>(null);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  // Build conic gradient stops
  let accumulated = 0;
  const gradientStops = data.map((d) => {
    const start = accumulated;
    accumulated += (d.value / total) * 360;
    return `${d.color} ${start}deg ${accumulated}deg`;
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (total === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const distance = Math.sqrt(x * x + y * y);

    // Check if within donut ring (distance > size * 0.5 can be fuzzy due to border, let's say size * 0.5)
    if (distance < size * 0.25 || distance > size * 0.5) {
      setHoverData(null);
      return;
    }

    let angle = Math.atan2(y, x) * (180 / Math.PI);
    angle += 90;
    if (angle < 0) angle += 360;

    let acc = 0;
    for (const d of data) {
      const segmentAngle = (d.value / total) * 360;
      if (angle >= acc && angle <= acc + segmentAngle) {
        setHoverData({
          label: d.label,
          percentage: Math.round((d.value / total) * 100),
          x: e.clientX,
          y: e.clientY,
          color: d.color,
        });
        break;
      }
      acc += segmentAngle;
    }
  };

  const handleMouseLeave = () => setHoverData(null);

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        {/* Donut chart */}
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: "50%",
            background: `conic-gradient(${gradientStops.join(", ")})`,
            position: "relative",
            flexShrink: 0,
            cursor: "pointer",
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
              pointerEvents: "none", // Ensure inner hole doesn't block mouse events
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

      {hoverData && (
        <div
          style={{
            position: "fixed",
            left: hoverData.x + 15,
            top: hoverData.y + 15,
            background: "#1f2937",
            color: "#fff",
            padding: "8px 12px",
            borderRadius: "6px",
            fontSize: "12px",
            pointerEvents: "none",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
        >
          <span
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "2px",
              background: hoverData.color,
            }}
          />
          <span style={{ fontWeight: 500 }}>{hoverData.label}</span>
          <span style={{ color: "#d1d5db" }}>{hoverData.percentage}%</span>
        </div>
      )}
    </>
  );
}
