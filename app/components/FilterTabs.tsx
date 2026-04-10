"use client";

interface FilterTabsProps {
  tabs: { label: string; color?: string }[];
  activeTab: string | string[];
  onChange: (tab: string) => void;
  counts?: Record<string, number>;
}

export default function FilterTabs({
  tabs,
  activeTab,
  onChange,
  counts,
}: FilterTabsProps) {
  return (
    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", flex: 1 }}>
      {tabs.map((tab) => {
        const isActive = Array.isArray(activeTab)
          ? activeTab.includes(tab.label)
          : activeTab === tab.label;
          
        const tabCount = counts ? counts[tab.label] : null;

        return (
          <button
            key={tab.label}
            onClick={() => onChange(tab.label)}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              border: isActive ? "1px solid #111827" : "1px solid #e5e7eb",
              background: isActive ? "#111827" : "#ffffff",
              color: isActive ? "#ffffff" : "#374151",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.15s ease",
            }}
          >
            {tab.color && (
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: tab.color,
                }}
              />
            )}
            {tab.label}
            {tabCount !== null && tabCount !== undefined && (
              <span
                style={{
                  backgroundColor: isActive ? "rgba(255,255,255,0.2)" : "#f3f4f6",
                  color: isActive ? "#ffffff" : "#6b7280",
                  padding: "2px 8px",
                  borderRadius: "10px",
                  fontSize: "11px",
                  fontWeight: 600,
                }}
              >
                {tabCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
