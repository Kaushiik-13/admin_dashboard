import StatCard from "../../components/StatCard";
import DataTable from "../../components/DataTable";
import ActionButton from "../../components/ActionButton";

const disputesData = [
  {
    reportId: "#RPT-084",
    reportedBy: "Worker: Ramesh",
    against: "Chennai Repairs",
    type: "Unpaid wage",
    date: "Today",
    priority: "High",
    priorityColor: "#ef4444",
  },
  {
    reportId: "#RPT-083",
    reportedBy: "Employer: Ravi",
    against: "Worker: Muthu",
    type: "No-show",
    date: "Yesterday",
    priority: "Medium",
    priorityColor: "#f59e0b",
  },
  {
    reportId: "#RPT-079",
    reportedBy: "Worker: Suresh",
    against: "Quick Build Co.",
    type: "Fake job post",
    date: "3 days ago",
    priority: "High",
    priorityColor: "#ef4444",
  },
];

const columns = [
  { key: "reportId", header: "Report ID" },
  { key: "reportedBy", header: "Reported By" },
  { key: "against", header: "Against" },
  { key: "type", header: "Type" },
  { key: "date", header: "Date" },
  {
    key: "priority",
    header: "Priority",
    render: (_: unknown, row: Record<string, unknown>) => (
      <span
        style={{
          fontWeight: 600,
          color: row.priorityColor as string,
          fontSize: "13px",
        }}
      >
        {row.priority as string}
      </span>
    ),
  },
  {
    key: "action",
    header: "Action",
    render: (_: unknown, row: Record<string, unknown>) => {
      const priority = row.priority as string;
      if (priority === "High") {
        if ((row.type as string) === "Fake job post") {
          return <ActionButton label="Remove Post" variant="reject" />;
        }
        return <ActionButton label="Investigate" variant="approve" />;
      }
      return <ActionButton label="Review" variant="manual-review" />;
    },
  },
];

export default function ReportsPage() {
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
          Reports & Disputes
        </h1>
        <button
          style={{
            padding: "8px 20px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: 600,
            background: "#ef4444",
            color: "#ffffff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Download All Reports
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
        <StatCard
          title="OPEN DISPUTES"
          value="8"
          subtitle="↑ +2 this week"
          subtitleColor="#ef4444"
        />
        <StatCard
          title="RESOLVED THIS MONTH"
          value="34"
          subtitle="Good progress"
          subtitleColor="#2d6a4f"
        />
        <StatCard
          title="FRAUDULENT POSTS"
          value="3"
          subtitle="Removed"
          subtitleColor="#ef4444"
        />
        <StatCard
          title="AVG RESOLUTION TIME"
          value="1.4d"
          subtitle="↑ Faster"
          subtitleColor="#2d6a4f"
        />
      </div>

      {/* Open Disputes Table */}
      <DataTable
        title="Open Disputes"
        columns={columns}
        data={disputesData}
      />
    </div>
  );
}
