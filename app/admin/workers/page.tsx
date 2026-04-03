"use client";

import { useState, useEffect } from "react";
import StatCard from "../../components/StatCard";
import FilterTabs from "../../components/FilterTabs";
import DataTable from "../../components/DataTable";
import StatusBadge from "../../components/StatusBadge";
import ActionButton from "../../components/ActionButton";
import WorkerDetailsModal from "../../components/WorkerDetailsModal";
import { apiGet, apiPost } from "../../lib/api";

const filterTabs = [
  { label: "All" },
  { label: "Verified" },
  { label: "Pending", color: "#f59e0b" },
  { label: "Suspended", color: "#ef4444" },
  { label: "Electrician", color: "#2d6a4f" },
  { label: "Plumber", color: "#3b82f6" },
  { label: "Labour", color: "#6b7280" },
];

const getColumns = (
  onApprove: (id: string) => void,
  onReject: (id: string) => void,
  onView: (id: string) => void
) => [
  {
    key: "worker",
    header: "Worker",
    render: (_: unknown, row: Record<string, unknown>) => (
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "14px" }}>{row.avatar as string}</span>
        <span style={{ fontWeight: 500 }}>{row.worker as string}</span>
      </div>
    ),
  },
  { key: "skill", header: "Skill" },
  { key: "location", header: "Location" },
  { key: "jobsDone", header: "Jobs Done" },
  { key: "rating", header: "Rating" },
  {
    key: "status",
    header: "Status",
    render: (_: unknown, row: Record<string, unknown>) => (
      <StatusBadge
        label={row.status as string}
        variant={row.statusVariant as "active" | "pending" | "suspended"}
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
          {status === "pending" && (
            <>
              <ActionButton
                label="View"
                variant="view"
                onClick={() => onView(row.id as string)}
              />
              <ActionButton
                label="Verify"
                variant="verify"
                onClick={() => onApprove(row.id as string)}
              />
              <ActionButton
                label="Reject"
                variant="reject"
                onClick={() => onReject(row.id as string)}
              />
            </>
          )}
          {status === "active" && (
            <>
              <ActionButton
                label="View"
                variant="view"
                onClick={() => onView(row.id as string)}
              />
              <ActionButton
                label="Suspend"
                variant="suspend"
                onClick={() => onReject(row.id as string)}
              />
            </>
          )}
          {status === "suspended" && (
            <>
              <ActionButton
                label="View"
                variant="view"
                onClick={() => onView(row.id as string)}
              />
              <ActionButton
                label="Verify"
                variant="verify"
                onClick={() => onApprove(row.id as string)}
              />
            </>
          )}
        </div>
      );
    },
  },
];

export default function WorkersPage() {
  const [activeTab, setActiveTab] = useState("All");
  
  const [allWorkers, setAllWorkers] = useState<any[]>([]);
  const [verifiedWorkers, setVerifiedWorkers] = useState<any[]>([]);
  const [pendingWorkers, setPendingWorkers] = useState<any[]>([]);
  const [suspendedWorkers, setSuspendedWorkers] = useState<any[]>([]);

  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    suspended: 0,
  });

  const [viewWorkerId, setViewWorkerId] = useState<string | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    action: "approve" | "reject" | null;
    workerId: string | null;
  }>({
    isOpen: false,
    action: null,
    workerId: null,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      // Fire all 4 requests concurrently
      const [allRes, verifiedRes, pendingRes, suspendedRes] = await Promise.all([
        apiGet<any[]>("/workers").catch(() => []),
        apiGet<{ count: number; data: any[] }>("/admin/workers/approved").catch(() => ({ count: 0, data: [] })),
        apiGet<{ count: number; data: any[] }>("/admin/workers/pending").catch(() => ({ count: 0, data: [] })),
        apiGet<{ count: number; data: any[] }>("/admin/workers/rejected").catch(() => ({ count: 0, data: [] })),
      ]);

      const mapWorkers = (workersArray: any[], forceVariant?: string) => {
        return workersArray.map((worker) => {
          const isApproved = worker.approval_status === "approved" || worker.user_id?.approval_status === "approved";
          const isPending = worker.approval_status === "pending" || worker.user_id?.approval_status === "pending";
          const variant = forceVariant || (isApproved ? "active" : isPending ? "pending" : "suspended");
          const statusLabel = variant === "active" ? "Active" : variant === "pending" ? "Pending" : "Suspended";

          return {
            id: worker._id,
            worker: worker.user_id?.name || "Unknown Worker",
            avatar: worker.user_id?.profile_photo ? "📸" : "🟢",
            skill: worker.skills?.length > 0 ? worker.skills[0].skill_name || "General" : "General",
            location: worker.current_location || worker.user_id?.addresses?.[0]?.city || "N/A",
            jobsDone: worker.completed_jobs || 0,
            rating: worker.rating > 0 ? `⭐ ${worker.rating}` : "New",
            status: statusLabel,
            statusVariant: variant,
          };
        });
      };

      setAllWorkers(mapWorkers(Array.isArray(allRes) ? allRes : []));
      setVerifiedWorkers(mapWorkers(verifiedRes?.data || [], "active"));
      setPendingWorkers(mapWorkers(pendingRes?.data || [], "pending"));
      setSuspendedWorkers(mapWorkers(suspendedRes?.data || [], "suspended"));

      setStats({
        total: Array.isArray(allRes) ? allRes.length : 0,
        verified: verifiedRes?.count || 0,
        pending: pendingRes?.count || 0,
        suspended: suspendedRes?.count || 0,
      });
    } catch (err) {
      console.error("Failed to fetch workers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveWorker = async (id: string) => {
    try {
      setIsLoading(true);
      await apiPost(`/admin/workers/${id}/approve`, {});
      await fetchAllData();
    } catch (err) {
      console.error("Failed to approve worker:", err);
      setIsLoading(false); // Only toggle if failed to stop infinite loading if fetchAllData fails
    }
  };

  const handleRejectWorker = async (id: string) => {
    try {
      setIsLoading(true);
      await apiPost(`/admin/workers/${id}/reject`, {});
      await fetchAllData();
    } catch (err) {
      console.error("Failed to reject worker:", err);
      setIsLoading(false);
    }
  };

  const getFilteredData = () => {
    let sourceData = allWorkers;
    if (activeTab === "Verified") sourceData = verifiedWorkers;
    else if (activeTab === "Pending") sourceData = pendingWorkers;
    else if (activeTab === "Suspended") sourceData = suspendedWorkers;

    // Filter by skill for the standard groups
    if (["All", "Verified", "Pending", "Suspended"].includes(activeTab)) {
      return sourceData;
    }
    // E.g., Electrician, Plumber fallback. Since "Skill" is N/A right now, 
    // it will return empty but will gracefully start working later.
    return sourceData.filter((w) => w.skill === activeTab);
  };

  const requestApproveWorker = (id: string) => {
    setConfirmModal({ isOpen: true, action: "approve", workerId: id });
  };

  const requestRejectWorker = (id: string) => {
    setConfirmModal({ isOpen: true, action: "reject", workerId: id });
  };

  const columns = getColumns(requestApproveWorker, requestRejectWorker, setViewWorkerId);

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
          Worker Management
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <input
            type="text"
            placeholder="Search workers..."
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: "1px solid #e5e7eb",
              fontSize: "13px",
              outline: "none",
              width: "200px",
              background: "#ffffff",
            }}
          />
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
            Export CSV
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
        <StatCard
          title="TOTAL WORKERS"
          value={isLoading ? "..." : stats.total.toString()}
        />
        <StatCard
          title="VERIFIED"
          value={isLoading ? "..." : stats.verified.toString()}
        />
        <StatCard
          title="PENDING REVIEW"
          value={isLoading ? "..." : stats.pending.toString()}
        />
        <StatCard
          title="SUSPENDED"
          value={isLoading ? "..." : stats.suspended.toString()}
        />
      </div>

      {/* Filter Tabs */}
      <div style={{ marginBottom: "16px" }}>
        <FilterTabs
          tabs={filterTabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* Workers Table */}
      <DataTable
        title={isLoading ? "Loading Workers..." : "Workers List"}
        columns={columns}
        data={getFilteredData()}
      />

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
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
              Do you really want to {confirmModal.action === "approve" ? "verify" : "suspend"} this worker? This action can be undone later.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() =>
                  setConfirmModal({ isOpen: false, action: null, workerId: null })
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
                onClick={() => {
                  if (confirmModal.action === "approve") {
                    handleApproveWorker(confirmModal.workerId!);
                  } else if (confirmModal.action === "reject") {
                    handleRejectWorker(confirmModal.workerId!);
                  }
                  setConfirmModal({ isOpen: false, action: null, workerId: null });
                }}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  background: confirmModal.action === "approve" ? "#059669" : "#dc2626",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Yes, {confirmModal.action === "approve" ? "Verify" : "Suspend"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Worker Profile Details Modal */}
      {viewWorkerId && (
        <WorkerDetailsModal
          workerId={viewWorkerId}
          onClose={() => setViewWorkerId(null)}
        />
      )}
    </div>
  );
}
