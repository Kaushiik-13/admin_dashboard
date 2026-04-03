"use client";

interface FilterTabsProps {
  tabs: { label: string; color?: string }[];
  activeTab: string;
  onChange: (tab: string) => void;
}

export default function FilterTabs({
  tabs,
  activeTab,
  onChange,
}: FilterTabsProps) {
  return (
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.label;
        return (
          <button
            key={tab.label}
            onClick={() => onChange(tab.label)}
            style={{
              padding: "5px 16px",
              borderRadius: "16px",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
              border: isActive ? "1px solid #374151" : "1px solid #e5e7eb",
              background: isActive ? "#f3f4f6" : "transparent",
              color: tab.color && !isActive ? tab.color : "#374151",
              transition: "all 0.15s ease",
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
