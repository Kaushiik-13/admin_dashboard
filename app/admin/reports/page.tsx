"use client";

import { useState, useEffect } from "react";
import StatCard from "../../components/StatCard";
import DataTable from "../../components/DataTable";
import ActionButton from "../../components/ActionButton";
import { apiGet, apiPatch } from "../../lib/api";

type ConfirmAction = "investigate" | "review" | "remove_post";

const priorityColorMap: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#22c55e",
};

const formatReportType = (type: string): string => {
  const map: Record<string, string> = {
    unpaid_wage: "Unpaid Wage",
    no_show: "No Show",
    fake_job_post: "Fake Job Post",
    harassment: "Harassment",
    other: "Other",
  };
  return map[type] || type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const getRelativeTime = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const getColumns = (
  onInvestigate: (id: string) => void,
  onReview: (id: string) => void,
  onRemovePost: (id: string) => void
) => [
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
        if ((row.type as string) === "Fake Job Post") {
          return <ActionButton label="Remove Post" variant="reject" onClick={() => onRemovePost(row.id as string)} />;
        }
        return <ActionButton label="Investigate" variant="approve" onClick={() => onInvestigate(row.id as string)} />;
      }
      return <ActionButton label="Review" variant="manual-review" onClick={() => onReview(row.id as string)} />;
    },
  },
];

export default function ReportsPage() {
  const [stats, setStats] = useState({
    openDisputes: 0,
    openDisputesTrend: 0,
    resolvedThisMonth: 0,
    fraudulentPosts: 0,
    avgResolutionTime: 0,
  });
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    action: ConfirmAction | null;
    reportId: string | null;
  }>({
    isOpen: false,
    action: null,
    reportId: null,
  });

  const mapReports = (data: any[]): any[] =>
    data.map((report) => {
      const priority = (report.priority || "").toLowerCase();
      return {
        id: report._id,
        reportId: report.reportId
          ? `#${report.reportId}`
          : `#RPT-${report._id?.slice(-3)}`,
        reportedBy: report.reportedBy?.name
          ? `${(report.reportedBy.userType || "").charAt(0).toUpperCase() + (report.reportedBy.userType || "").slice(1)}: ${report.reportedBy.name}`
          : "Unknown",
        against: report.against?.name || "Unknown",
        type: formatReportType(report.type || ""),
        date: report.createdAt ? getRelativeTime(report.createdAt) : "N/A",
        priority: priority.charAt(0).toUpperCase() + priority.slice(1),
        priorityColor: priorityColorMap[priority] || "#6b7280",
        rawType: report.type || "",
      };
    });

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, reportsRes] = await Promise.all([
        apiGet<any>("/reports/stats").catch(() => ({
          openDisputes: 0,
          openDisputesTrend: 0,
          resolvedThisMonth: 0,
          fraudulentPosts: 0,
          avgResolutionTime: 0,
        })),
        apiGet<{ data: any[]; total: number }>("/reports?status=open").catch(() => ({
          data: [],
          total: 0,
        })),
      ]);

      setStats({
        openDisputes: statsRes.openDisputes || 0,
        openDisputesTrend: statsRes.openDisputesTrend || 0,
        resolvedThisMonth: statsRes.resolvedThisMonth || 0,
        fraudulentPosts: statsRes.fraudulentPosts || 0,
        avgResolutionTime: statsRes.avgResolutionTime || 0,
      });

      const dataArray = Array.isArray(reportsRes)
        ? reportsRes
        : Array.isArray(reportsRes?.data)
          ? reportsRes.data
          : [];
      setReports(mapReports(dataArray));
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleInvestigate = async (id: string) => {
    try {
      setIsLoading(true);
      await apiPatch(`/reports/${id}/investigate`, {});
      await fetchAllData();
    } catch (err) {
      console.error("Failed to investigate report:", err);
      setIsLoading(false);
    }
  };

  const handleReview = async (id: string) => {
    try {
      setIsLoading(true);
      await apiPatch(`/reports/${id}/review`, {});
      await fetchAllData();
    } catch (err) {
      console.error("Failed to review report:", err);
      setIsLoading(false);
    }
  };

  const handleRemovePost = async (id: string) => {
    try {
      setIsLoading(true);
      await apiPatch(`/reports/${id}/resolve`, {
        action: "post_removed",
        resolutionNote: "Fraudulent post removed by admin",
      });
      await fetchAllData();
    } catch (err) {
      console.error("Failed to remove post:", err);
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch("http://35.154.208.82:3000/reports/export", {
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error(`Export failed (${res.status})`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "reports.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export reports:", err);
    }
  };

  const requestInvestigate = (id: string) =>
    setConfirmModal({ isOpen: true, action: "investigate", reportId: id });
  const requestReview = (id: string) =>
    setConfirmModal({ isOpen: true, action: "review", reportId: id });
  const requestRemovePost = (id: string) =>
    setConfirmModal({ isOpen: true, action: "remove_post", reportId: id });

  const handleConfirmAction = () => {
    const { action, reportId } = confirmModal;
    setConfirmModal({ isOpen: false, action: null, reportId: null });
    if (!action || !reportId) return;
    if (action === "investigate") handleInvestigate(reportId);
    else if (action === "review") handleReview(reportId);
    else if (action === "remove_post") handleRemovePost(reportId);
  };

  const columns = getColumns(requestInvestigate, requestReview, requestRemovePost);

  const getOpenSubtitle = () => {
    const trend = stats.openDisputesTrend;
    if (trend > 0) return { text: `↑ +${trend} this month`, color: "#ef4444" };
    if (trend < 0) return { text: `↓ ${trend} this month`, color: "#2d6a4f" };
    return { text: "No new this week", color: "#2d6a4f" };
  };

  const confirmModalConfig: Record<ConfirmAction, { message: string; buttonLabel: string; buttonColor: string }> = {
    investigate: {
      message: "Are you sure you want to start investigating this dispute?",
      buttonLabel: "Yes, Investigate",
      buttonColor: "#059669",
    },
    review: {
      message: "Are you sure you want to mark this dispute for review?",
      buttonLabel: "Yes, Review",
      buttonColor: "#d97706",
    },
    remove_post: {
      message: "Are you sure you want to remove this fraudulent post and resolve this dispute? This action cannot be undone.",
      buttonLabel: "Yes, Remove",
      buttonColor: "#dc2626",
    },
  };

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
          onClick={handleExport}
          disabled={isLoading}
          style={{
            padding: "8px 20px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: 600,
            background: isLoading ? "#fca5a5" : "#ef4444",
            color: "#ffffff",
            border: "none",
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          Download All Reports
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
        <StatCard
          title="OPEN DISPUTES"
          value={isLoading ? "..." : stats.openDisputes.toString()}
          subtitle={isLoading ? "..." : getOpenSubtitle().text}
          subtitleColor={isLoading ? "#9ca3af" : getOpenSubtitle().color}
        />
        <StatCard
          title="RESOLVED THIS MONTH"
          value={isLoading ? "..." : stats.resolvedThisMonth.toString()}
          subtitle="Good progress"
          subtitleColor="#2d6a4f"
        />
        <StatCard
          title="FRAUDULENT POSTS"
          value={isLoading ? "..." : stats.fraudulentPosts.toString()}
          subtitle="Removed"
          subtitleColor="#ef4444"
        />
        <StatCard
          title="AVG RESOLUTION TIME"
          value={isLoading ? "..." : `${stats.avgResolutionTime}d`}
          subtitle="↑ Faster"
          subtitleColor="#2d6a4f"
        />
      </div>

      {/* Open Disputes Table */}
      <DataTable
        title={isLoading ? "Loading Reports..." : "Open Disputes"}
        columns={columns}
        data={reports}
      />

      {/* Confirmation Modal */}
      {confirmModal.isOpen && confirmModal.action && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "24px",
              borderRadius: "12px",
              width: "350px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: 700 }}>
              Are you sure?
            </h3>
            <p
              style={{
                margin: "0 0 24px 0",
                fontSize: "14px",
                color: "#4b5563",
                lineHeight: 1.5,
              }}
            >
              {confirmModalConfig[confirmModal.action].message}
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() =>
                  setConfirmModal({ isOpen: false, action: null, reportId: null })
                }
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  background: "#f3f4f6",
                  color: "#374151",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  background: confirmModalConfig[confirmModal.action].buttonColor,
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                {confirmModalConfig[confirmModal.action].buttonLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}