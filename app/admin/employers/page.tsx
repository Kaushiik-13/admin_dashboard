import StatCard from "../../components/StatCard";
import DataTable from "../../components/DataTable";
import StatusBadge from "../../components/StatusBadge";
import ActionButton from "../../components/ActionButton";

const employersData = [
  {
    business: "Ravi Electronics",
    owner: "R. Krishnan",
    city: "Chennai",
    plan: "Pro",
    planVariant: "pro",
    jobsPosted: 23,
    status: "Verified",
    statusVariant: "verified",
  },
  {
    business: "Quick Build Co.",
    owner: "Bala Subramaniam",
    city: "Coimbatore",
    plan: "Free",
    planVariant: "free",
    jobsPosted: 8,
    status: "Review",
    statusVariant: "review",
  },
];

const columns = [
  { key: "business", header: "Business" },
  { key: "owner", header: "Owner" },
  {
    key: "city",
    header: "City",
    render: (_: unknown, row: Record<string, unknown>) => (
      <span style={{ fontWeight: 500 }}>{row.city as string}</span>
    ),
  },
  {
    key: "plan",
    header: "Plan",
    render: (_: unknown, row: Record<string, unknown>) => (
      <StatusBadge
        label={row.plan as string}
        variant={row.planVariant as "pro" | "free"}
      />
    ),
  },
  { key: "jobsPosted", header: "Jobs Posted" },
  {
    key: "status",
    header: "Status",
    render: (_: unknown, row: Record<string, unknown>) => (
      <StatusBadge
        label={row.status as string}
        variant={row.statusVariant as "verified" | "review"}
      />
    ),
  },
  {
    key: "actions",
    header: "Actions",
    render: (_: unknown, row: Record<string, unknown>) => {
      const status = row.statusVariant as string;
      return (
        <div style={{ display: "flex", gap: "8px" }}>
          <ActionButton label="View" variant="view" />
          {status === "review" && (
            <ActionButton label="Flag" variant="flag" />
          )}
        </div>
      );
    },
  },
];

export default function EmployersPage() {
  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>
          Employer Management
        </h1>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
        <StatCard
          title="TOTAL EMPLOYERS"
          value="3,204"
          subtitle="↑ +88 this week"
          subtitleColor="#2d6a4f"
        />
        <StatCard
          title="VERIFIED BUSINESSES"
          value="2,701"
          subtitle="84.3% rate"
          subtitleColor="#6b7280"
        />
        <StatCard
          title="PRO / BUSINESS PLAN"
          value="835"
          subtitle="26% paid"
          subtitleColor="#2d6a4f"
        />
        <StatCard
          title="BLACKLISTED"
          value="9"
          subtitle="fraud / abuse"
          subtitleColor="#ef4444"
        />
      </div>

      {/* Employer List Table */}
      <DataTable
        title="Employer List"
        columns={columns}
        data={employersData}
      />
    </div>
  );
}
