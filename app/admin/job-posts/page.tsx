import StatCard from "../../components/StatCard";
import DataTable from "../../components/DataTable";
import StatusBadge from "../../components/StatusBadge";
import ActionButton from "../../components/ActionButton";

const jobPostsData = [
  {
    jobTitle: "Electrician Needed",
    employer: "Ravi Electronics",
    city: "Chennai",
    type: "Daily",
    typeVariant: "worker",
    pay: "₹900/day",
    flagged: "Clean",
    flaggedDot: "#22c55e",
  },
  {
    jobTitle: "Helper (Full day)",
    employer: "Quick Build",
    city: "Coimbatore",
    type: "Full",
    typeVariant: "employer",
    pay: "₹18k/mo",
    flagged: "Review",
    flaggedDot: "#f59e0b",
  },
  {
    jobTitle: "AC Technician",
    employer: "CoolAir Svc",
    city: "Chennai",
    type: "Full",
    typeVariant: "employer",
    pay: "₹22k/mo",
    flagged: "Clean",
    flaggedDot: "#22c55e",
  },
];

const columns = [
  { key: "jobTitle", header: "Job Title" },
  { key: "employer", header: "Employer" },
  {
    key: "city",
    header: "City",
    render: (_: unknown, row: Record<string, unknown>) => (
      <span style={{ fontWeight: 500 }}>{row.city as string}</span>
    ),
  },
  {
    key: "type",
    header: "Type",
    render: (_: unknown, row: Record<string, unknown>) => (
      <StatusBadge
        label={row.type as string}
        variant={row.typeVariant as "worker" | "employer"}
      />
    ),
  },
  { key: "pay", header: "Pay" },
  {
    key: "flagged",
    header: "Flagged?",
    render: (_: unknown, row: Record<string, unknown>) => (
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: row.flaggedDot as string,
            flexShrink: 0,
          }}
        />
        {row.flagged as string}
      </div>
    ),
  },
  {
    key: "actions",
    header: "Actions",
    render: (_: unknown, row: Record<string, unknown>) => {
      const flagged = row.flagged as string;
      return (
        <div style={{ display: "flex", gap: "8px" }}>
          {flagged === "Review" ? (
            <>
              <ActionButton label="Inspect" variant="manual-review" />
              <ActionButton label="Remove" variant="reject" />
            </>
          ) : (
            <>
              <ActionButton label="Approve" variant="approve" />
              <ActionButton label="Remove" variant="reject" />
            </>
          )}
        </div>
      );
    },
  },
];

export default function JobPostsPage() {
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
          Job Post Moderation
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#ea580c",
            }}
          >
            12 Pending Review
          </span>
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
            Approve All Safe
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
        <StatCard
          title="TOTAL ACTIVE JOBS"
          value="847"
          subtitle="↑ +120 today"
          subtitleColor="#2d6a4f"
        />
        <StatCard
          title="PENDING APPROVAL"
          value="12"
          subtitle="Needs review"
          subtitleColor="#ea580c"
        />
        <StatCard
          title="FLAGGED / REPORTED"
          value="5"
          subtitle="Action needed"
          subtitleColor="#ef4444"
        />
        <StatCard
          title="JOBS FILLED TODAY"
          value="89"
          subtitle="↑ Good rate"
          subtitleColor="#2d6a4f"
        />
      </div>

      {/* Job Posts Table */}
      <DataTable
        title="Job Posts — Pending Review"
        columns={columns}
        data={jobPostsData}
      />
    </div>
  );
}
