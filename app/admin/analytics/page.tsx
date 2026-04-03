import StatCard from "../../components/StatCard";
import HorizontalBar from "../../components/HorizontalBar";

const jobCategories = [
  { label: "Electrician", percentage: 68, color: "#2d6a4f" },
  { label: "Labour", percentage: 45, color: "#ef4444" },
  { label: "Delivery", percentage: 38, color: "#3b82f6" },
  { label: "Plumber", percentage: 28, color: "#6366f1" },
];

const topCities = [
  { name: "Chennai", flag: "🏙️", users: "4,820", color: "#2d6a4f" },
  { name: "Coimbatore", flag: "🏙️", users: "2,140", color: "#3b82f6" },
  { name: "Madurai", flag: "🏙️", users: "1,380", color: "#f59e0b" },
  { name: "Bangalore", flag: "🏙️", users: "980", color: "#ef4444" },
];

export default function AnalyticsPage() {
  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>
          Platform Analytics
        </h1>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
        <StatCard
          title="HIRE SUCCESS RATE"
          value="74%"
          subtitle="↑ +4% vs last month"
          subtitleColor="#2d6a4f"
        />
        <StatCard
          title="AVG TIME TO HIRE"
          value="3.2h"
          subtitle="↑ 30% faster"
          subtitleColor="#2d6a4f"
        />
        <StatCard
          title="DAILY ACTIVE USERS"
          value="4,820"
          subtitle="↑ +12% WoW"
          subtitleColor="#2d6a4f"
        />
        <StatCard
          title="TOP CITY"
          value="Chennai"
          subtitle="38% of all jobs"
          subtitleColor="#6b7280"
        />
      </div>

      {/* Charts Row */}
      <div style={{ display: "flex", gap: "16px" }}>
        {/* Job Categories */}
        <div
          style={{
            flex: 1,
            background: "#ffffff",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            padding: "20px 24px",
          }}
        >
          <h3
            style={{
              fontSize: "15px",
              fontWeight: 600,
              margin: "0 0 20px 0",
            }}
          >
            Job Categories (top 5)
          </h3>
          <HorizontalBar data={jobCategories} />
        </div>

        {/* Top Cities by Activity */}
        <div
          style={{
            flex: 1,
            background: "#ffffff",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            padding: "20px 24px",
          }}
        >
          <h3
            style={{
              fontSize: "15px",
              fontWeight: 600,
              margin: "0 0 20px 0",
            }}
          >
            Top Cities by Activity
          </h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {topCities.map((city, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom:
                    idx < topCities.length - 1
                      ? "1px solid #f3f4f6"
                      : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "14px",
                    color: "#374151",
                  }}
                >
                  <span style={{ fontSize: "18px" }}>{city.flag}</span>
                  {city.name}
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: city.color,
                    background:
                      city.color === "#2d6a4f"
                        ? "#dcfce7"
                        : city.color === "#3b82f6"
                        ? "#dbeafe"
                        : city.color === "#f59e0b"
                        ? "#fef3c7"
                        : "#fef2f2",
                    padding: "4px 12px",
                    borderRadius: "12px",
                  }}
                >
                  {city.users} users
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
