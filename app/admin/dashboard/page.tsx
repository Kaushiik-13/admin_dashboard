"use client";

import { useEffect, useState } from "react";
import StatCard from "../../components/StatCard";
import BarChart from "../../components/BarChart";
import PieChart from "../../components/PieChart";
import DataTable from "../../components/DataTable";
import StatusBadge from "../../components/StatusBadge";
import ActionButton from "../../components/ActionButton";
import { apiGet } from "../../lib/api";

const registrationData = [
  { label: "Mon", value1: 85, value2: 65 },
  { label: "Tue", value1: 92, value2: 70 },
  { label: "Wed", value1: 78, value2: 55 },
  { label: "Thu", value1: 65, value2: 50 },
  { label: "Fri", value1: 40, value2: 35 },
  { label: "Sat", value1: 95, value2: 60 },
  { label: "Sun", value1: 88, value2: 45 },
];

const skillColors = ["#1b4332", "#2d6a4f", "#52b788", "#95d5b2", "#74c69d", "#b7e4c7", "#3b82f6", "#f59e0b"];

const columns = [
  { key: "name", header: "Name" },
  {
    key: "role",
    header: "Role",
    render: (_: unknown, row: Record<string, unknown>) => (
      <StatusBadge
        label={row.role as string}
        variant={row.roleVariant as "worker" | "employer"}
      />
    ),
  },
  { key: "location", header: "Location" },
  { key: "registered", header: "Registered" },
  {
    key: "status",
    header: "Status",
    render: (_: unknown, row: Record<string, unknown>) => (
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: row.statusDot as string,
            flexShrink: 0,
          }}
        />
        {row.status as string}
      </div>
    ),
  },
  {
    key: "action",
    header: "Action",
    render: (_: unknown, row: Record<string, unknown>) => (
      <ActionButton
        label={row.actionLabel as string}
        variant={row.action as "approve" | "view" | "suspend"}
      />
    ),
  },
];

const getRelativeTime = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffHrs < 1) return "Just now";
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
};

const getRoleVariant = (roles: string[]): "worker" | "employer" => {
  if (roles.includes("service_provider") || roles.includes("worker")) return "worker";
  return "employer";
};

const formatRole = (roles: string[]): string => {
  const role = roles[0] || "user";
  return role.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

export default function DashboardPage() {
  const [username, setUsername] = useState("Admin");
  const [usersCount, setUsersCount] = useState<string | number>("...");
  const [workersCount, setWorkersCount] = useState<string | number>("...");
  const [employersCount, setEmployersCount] = useState<string | number>("...");
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [skillDistribution, setSkillDistribution] = useState<any[]>([]);

  useEffect(() => {
    // Fetch users
    apiGet<{ count: number; users: any[] }>("/users")
      .then((res) => {
        if (typeof res?.count === "number") {
          setUsersCount(res.count);
        } else {
          setUsersCount(0);
        }
        if (Array.isArray(res?.users)) {
          const mapped = res.users.slice(0, 5).map((user: any) => {
            const isPending = user.approval_status === "pending";
            const isApproved = user.approval_status === "approved";
            return {
              name: user.name,
              role: formatRole(user.roles || []),
              roleVariant: getRoleVariant(user.roles || []),
              location: user.addresses?.[0]?.city || "N/A",
              registered: getRelativeTime(user.createdAt),
              status: isPending ? "Pending" : isApproved ? "Active" : "Inactive",
              statusDot: isPending ? "#f59e0b" : isApproved ? "#22c55e" : "#6b7280",
              action: isPending ? "approve" : "view",
              actionLabel: isPending ? "Approve" : "View",
            };
          });
          setRecentUsers(mapped);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch users:", err);
        setUsersCount("Error");
      });

    // Fetch workers count
    apiGet<any[]>("/workers")
      .then((res) => {
        if (Array.isArray(res)) {
          setWorkersCount(res.length);
        } else {
          setWorkersCount(0);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch workers count:", err);
        setWorkersCount("Error");
      });

    // Fetch employers count
    apiGet<any[]>("/employers")
      .then((res) => {
        if (Array.isArray(res)) {
          setEmployersCount(res.length);
        } else {
          setEmployersCount(0);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch employers:", err);
        setEmployersCount("Error");
      });

    // Fetch skill distribution
    apiGet<any[]>("/admin/dashboard/skills-stats")
      .then((res) => {
        if (Array.isArray(res)) {
          const distribution = res
            .map((item: any, i: number) => ({
              label: item.skill_name,
              value: item.count,
              color: skillColors[i % skillColors.length],
            }));
          setSkillDistribution(distribution);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch skills stats:", err);
      });

    try {
      const email = localStorage.getItem("email");
      if (email) {
        setUsername(email.split("@")[0]);
      } else {
        // Try decoding JWT
        const token = localStorage.getItem("token");
        if (token && token.includes(".")) {
          const base64Url = token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const payload = JSON.parse(window.atob(base64));
          if (payload.email) {
            setUsername(payload.email.split("@")[0]);
            localStorage.setItem("email", payload.email);
          } else if (payload.name) {
             setUsername(payload.name);
          }
        }
      }
    } catch (e) {
      // failed to parse token or read local storage
      console.warn("Could not extract username from token", e);
    }
  }, []);

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
        <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0, textTransform: "capitalize" }}>
          Hi, {username}
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "13px", color: "#6b7280" }}>March 2025</span>
          <button
            style={{
              padding: "6px 16px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 600,
              background: "#ef4444",
              color: "#ffffff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Export Report
          </button>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "#e5e7eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: 600,
              color: "#374151",
            }}
          >
            AD
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
        <StatCard
          title="TOTAL WORKERS"
          value={workersCount.toString()}
        />
        <StatCard
          title="TOTAL EMPLOYERS"
          value={employersCount.toString()}
        />
        <StatCard
          title="ACTIVE JOBS"
          value="847"
        />
        <StatCard
          title="TOTAL USERS"
          value={usersCount.toString()}
        />
      </div>

      {/* Charts Row */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
        {/* Bar Chart */}
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
            New Registrations (7 days)
          </h3>
          <BarChart data={registrationData} />
        </div>

        {/* Pie Chart */}
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
            Skill Distribution
          </h3>
          {skillDistribution.length > 0 ? (
            <PieChart data={skillDistribution} />
          ) : (
            <p style={{ fontSize: "13px", color: "#9ca3af" }}>No skill data available</p>
          )}
        </div>
      </div>

      {/* Recent User Registrations Table */}
      <DataTable
        title="Recent User Registrations"
        columns={columns}
        data={recentUsers}
        headerRight={
          <>
            <button
              style={{
                padding: "6px 16px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 500,
                background: "#ffffff",
                color: "#374151",
                border: "1px solid #e5e7eb",
                cursor: "pointer",
              }}
            >
              Filter
            </button>
            <button
              style={{
                padding: "6px 16px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 600,
                background: "#1a1a1a",
                color: "#ffffff",
                border: "none",
                cursor: "pointer",
              }}
            >
              View All
            </button>
          </>
        }
      />
    </div>
  );
}
