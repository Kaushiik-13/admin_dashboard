import StatCard from "../../components/StatCard";
import BarChart from "../../components/BarChart";
import PieChart from "../../components/PieChart";

const revenueData = [
  { label: "Sep", value1: 60, value2: 40 },
  { label: "Oct", value1: 70, value2: 45 },
  { label: "Nov", value1: 65, value2: 42 },
  { label: "Dec", value1: 75, value2: 50 },
  { label: "Jan", value1: 90, value2: 55 },
  { label: "Feb", value1: 110, value2: 65 },
];

const planDistribution = [
  { label: "Free", value: 55, color: "#1b4332" },
  { label: "Pro ₹499", value: 20, color: "#ea580c" },
  { label: "Business ₹1499", value: 16, color: "#3b82f6" },
  { label: "Trial", value: 9, color: "#95d5b2" },
];

export default function RevenuePage() {
  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}
      >
        <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>
          Revenue & Subscription Plans
        </h1>
        <button
          style={{
            padding: "8px 20px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: 600,
            background: "#1a1a1a",
            color: "#ffffff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Download Invoice Report
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
        <StatCard
          title="MONTHLY REVENUE"
          value="₹1.8L"
          subtitle="↑ +24% MoM"
          subtitleColor="#2d6a4f"
        />
        <StatCard
          title="PRO PLAN USERS"
          value="648"
          subtitle="↑ +42 this month"
          subtitleColor="#2d6a4f"
        />
        <StatCard
          title="BUSINESS PLAN USERS"
          value="187"
          subtitle="↑ +18 this month"
          subtitleColor="#2d6a4f"
        />
        <StatCard
          title="FREE USERS"
          value="2,369"
          subtitle="Conversion target: 30%"
          subtitleColor="#6b7280"
        />
      </div>

      {/* Charts Row */}
      <div style={{ display: "flex", gap: "16px" }}>
        {/* Monthly Revenue Bar Chart */}
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
              margin: "0 0 16px 0",
            }}
          >
            Monthly Revenue (₹ Lakh)
          </h3>
          <BarChart data={revenueData} />
        </div>

        {/* Plan Distribution Pie Chart */}
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
              margin: "0 0 16px 0",
            }}
          >
            Plan Distribution
          </h3>
          <PieChart data={planDistribution} />
        </div>
      </div>
    </div>
  );
}
