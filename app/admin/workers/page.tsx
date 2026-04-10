"use client";

import { useState, useEffect, useRef } from "react";
import StatCard from "../../components/StatCard";
import DataTable from "../../components/DataTable";
import StatusBadge from "../../components/StatusBadge";
import ActionButton from "../../components/ActionButton";
import WorkerDetailsModal from "../../components/WorkerDetailsModal";
import { apiGet, apiPost } from "../../lib/api";

const statusTabs = [
  { label: "All" },
  { label: "Verified" },
  { label: "Pending", color: "#f59e0b" },
  { label: "Suspended", color: "#ef4444" },
];

const skillColors = ["#2d6a4f", "#3b82f6", "#6b7280", "#8b5cf6", "#f59e0b", "#ec4899", "#14b8a6", "#f97316"];
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
          <ActionButton
            label="View"
            variant="view"
            onClick={() => onView(row.id as string)}
          />
          {status === "pending" && (
            <>
              <ActionButton
                label="Verify"
                variant="verify"
                onClick={() => onApprove(row.id as string)}
              />
              <ActionButton
                label="Suspend"
                variant="suspend"
                onClick={() => onReject(row.id as string)}
              />
            </>
          )}
          {status === "active" && (
            <ActionButton
              label="Suspend"
              variant="suspend"
              onClick={() => onReject(row.id as string)}
            />
          )}
          {status === "suspended" && (
            <ActionButton
              label="Verify"
              variant="verify"
              onClick={() => onApprove(row.id as string)}
            />
          )}
        </div>
      );
    },
  },
];

export default function WorkersPage() {
  const [activeStatuses, setActiveStatuses] = useState<string[]>(["All"]);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [filterTabs, setFilterTabs] = useState(statusTabs);
  
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchAllData();
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const res = await apiGet<any[]>("/skills");
      if (Array.isArray(res)) {
        const skillTabs = res.map((skill, i) => ({
          label: skill.name || skill.skill_name || skill.title || "Unknown",
          color: skillColors[i % skillColors.length],
        }));
        setFilterTabs([...statusTabs, ...skillTabs]);
      }
    } catch (err) {
      console.error("Failed to fetch skills:", err);
    }
  };

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
          const actualStatus = worker.approval_status || worker.user_id?.approval_status || "pending";
          const isApproved = actualStatus === "approved";
          const isPending = actualStatus === "pending";
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

    if (!activeStatuses.includes("All")) {
      sourceData = sourceData.filter((w) => {
        if (activeStatuses.includes("Verified") && w.statusVariant === "active") return true;
        if (activeStatuses.includes("Pending") && w.statusVariant === "pending") return true;
        if (activeStatuses.includes("Suspended") && w.statusVariant === "suspended") return true;
        return false;
      });
    }

    if (activeRole) {
      sourceData = sourceData.filter((w) => w.skill === activeRole);
    }

    return sourceData;
  };

  const requestApproveWorker = (id: string) => {
    setConfirmModal({ isOpen: true, action: "approve", workerId: id });
  };

  const requestRejectWorker = (id: string) => {
    setConfirmModal({ isOpen: true, action: "reject", workerId: id });
  };

  const columns = getColumns(requestApproveWorker, requestRejectWorker, setViewWorkerId);

  const skillCounts = (() => {
    const counts: Record<string, number> = {
      All: allWorkers.length,
      Verified: verifiedWorkers.length,
      Pending: pendingWorkers.length,
      Suspended: suspendedWorkers.length,
    };
    
    // Skill counts reflect the currently active statuses
    let baseForSkills = allWorkers;
    if (!activeStatuses.includes("All")) {
      baseForSkills = baseForSkills.filter((w) => {
        if (activeStatuses.includes("Verified") && w.statusVariant === "active") return true;
        if (activeStatuses.includes("Pending") && w.statusVariant === "pending") return true;
        if (activeStatuses.includes("Suspended") && w.statusVariant === "suspended") return true;
        return false;
      });
    }

    baseForSkills.forEach((w) => {
      if (w.skill) {
        counts[w.skill] = (counts[w.skill] || 0) + 1;
      }
    });
    return counts;
  })();

  const toggleStatus = (label: string) => {
    if (label === "All") {
      setActiveStatuses(["All"]);
    } else {
      let newStatuses = activeStatuses.filter(s => s !== "All");
      if (newStatuses.includes(label)) {
        newStatuses = newStatuses.filter(s => s !== label);
        if (newStatuses.length === 0) newStatuses = ["All"];
      } else {
        newStatuses.push(label);
      }
      setActiveStatuses(newStatuses);
    }
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
          Worker Management
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#ea580c" }}>
            {stats.pending} Pending Review
          </span>
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

      {/* Filters Section */}
      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        
        {/* Status Pills */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", flex: 1 }}>
          {statusTabs.map((tab) => {
            const isActive = activeStatuses.includes(tab.label);
            const count = skillCounts[tab.label] || 0;
            return (
              <button
                key={tab.label}
                onClick={() => toggleStatus(tab.label)}
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
                  transition: "all 0.15s ease"
                }}
              >
                {tab.color && (
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: tab.color }} />
                )}
                {tab.label}
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
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Roles Dropdown Button */}
        <div ref={dropdownRef} style={{ position: "relative" }}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: activeRole ? "1px solid #111827" : "1px solid #e5e7eb",
              background: activeRole ? "#f9fafb" : "#ffffff",
              color: "#374151",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
              transition: "all 0.15s ease",
            }}
            title="Filter by Role"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6H20M7 12H17M10 18H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {isDropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: "8px",
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                zIndex: 50,
                width: "260px",
                maxHeight: "350px",
                overflowY: "auto",
                padding: "8px 0",
              }}
            >
              {filterTabs
                .slice(statusTabs.length)
                .sort((a, b) => {
                  const countA = skillCounts[a.label] || 0;
                  const countB = skillCounts[b.label] || 0;
                  return countB - countA;
                })
                .map((tab) => {
                const count = skillCounts[tab.label] || 0;
                const isActiveRole = activeRole === tab.label;
                return (
                  <div
                    key={tab.label}
                    onClick={() => {
                      setActiveRole(isActiveRole ? null : tab.label);
                      setIsDropdownOpen(false);
                    }}
                    style={{
                      padding: "10px 16px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      background: isActiveRole ? "#f9fafb" : "transparent",
                      borderLeft: isActiveRole ? "3px solid #111827" : "3px solid transparent",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActiveRole) e.currentTarget.style.background = "#f3f4f6";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActiveRole) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {tab.color && (
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: tab.color,
                          }}
                        />
                      )}
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: isActiveRole ? 600 : 500,
                          color: isActiveRole ? "#111827" : "#4b5563",
                        }}
                      >
                        {tab.label}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        background: "#f3f4f6",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontWeight: 600,
                      }}
                    >
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
