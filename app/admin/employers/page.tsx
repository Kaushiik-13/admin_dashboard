"use client";

import { useState, useEffect } from "react";
import StatCard from "../../components/StatCard";
import FilterTabs from "../../components/FilterTabs";
import DataTable from "../../components/DataTable";
import StatusBadge from "../../components/StatusBadge";
import ActionButton from "../../components/ActionButton";
import EmployerDetailsModal from "../../components/EmployerDetailsModal";
import { apiGet, apiPost } from "../../lib/api";

const filterTabs = [
  { label: "All" },
  { label: "Verified" },
  { label: "Pending", color: "#f59e0b" },
  { label: "Suspended", color: "#ef4444" },
];

const getColumns = (
  onApprove: (id: string) => void,
  onReject: (id: string) => void,
  onView: (id: string) => void
) => [
  {
    key: "business",
    header: "Business",
    render: (_: unknown, row: Record<string, unknown>) => (
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "14px" }}>{row.avatar as string}</span>
        <span style={{ fontWeight: 500 }}>{row.business as string}</span>
      </div>
    ),
  },
  { key: "owner", header: "Owner" },
  { key: "city", header: "Location" },
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

export default function EmployersPage() {
  const [activeTab, setActiveTab] = useState("All");

  const [allEmployers, setAllEmployers] = useState<any[]>([]);
  const [verifiedEmployers, setVerifiedEmployers] = useState<any[]>([]);
  const [pendingEmployers, setPendingEmployers] = useState<any[]>([]);
  const [suspendedEmployers, setSuspendedEmployers] = useState<any[]>([]);

  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    suspended: 0,
  });

  const [viewEmployerId, setViewEmployerId] = useState<string | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    action: "approve" | "reject" | null;
    employerId: string | null;
  }>({
    isOpen: false,
    action: null,
    employerId: null,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const [allRes, verifiedRes, pendingRes, suspendedRes] = await Promise.all([
        apiGet<any[]>("/employers").catch(() => []),
        apiGet<{ count: number; data: any[] }>("/admin/employers/approved").catch(() => ({ count: 0, data: [] })),
        apiGet<{ count: number; data: any[] }>("/admin/employers/pending").catch(() => ({ count: 0, data: [] })),
        apiGet<{ count: number; data: any[] }>("/admin/employers/rejected").catch(() => ({ count: 0, data: [] })),
      ]);

      const mapEmployers = (employersArray: any[], forceVariant?: string) => {
        return employersArray.map((employer) => {
          const actualStatus = employer.approval_status || employer.user_id?.approval_status || "pending";
          const isApproved = actualStatus === "approved";
          const isPending = actualStatus === "pending";
          const variant = forceVariant || (isApproved ? "active" : isPending ? "pending" : "suspended");
          const statusLabel = variant === "active" ? "Active" : variant === "pending" ? "Pending" : "Suspended";

          return {
            id: employer._id,
            business: employer.business_name || "Unknown Business",
            owner: employer.user_id?.name || "N/A",
            avatar: employer.logo_url ? "🏢" : "🏢",
            city: employer.user_id?.addresses?.[0]?.city || "N/A",
            status: statusLabel,
            statusVariant: variant,
          };
        });
      };

      setAllEmployers(mapEmployers(Array.isArray(allRes) ? allRes : []));
      setVerifiedEmployers(mapEmployers(verifiedRes?.data || [], "active"));
      setPendingEmployers(mapEmployers(pendingRes?.data || [], "pending"));
      setSuspendedEmployers(mapEmployers(suspendedRes?.data || [], "suspended"));

      setStats({
        total: Array.isArray(allRes) ? allRes.length : 0,
        verified: verifiedRes?.count || 0,
        pending: pendingRes?.count || 0,
        suspended: suspendedRes?.count || 0,
      });
    } catch (err) {
      console.error("Failed to fetch employers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveEmployer = async (id: string) => {
    try {
      setIsLoading(true);
      await apiPost(`/admin/employers/${id}/approve`, {});
      await fetchAllData();
    } catch (err) {
      console.error("Failed to approve employer:", err);
      setIsLoading(false);
    }
  };

  const handleRejectEmployer = async (id: string) => {
    try {
      setIsLoading(true);
      await apiPost(`/admin/employers/${id}/reject`, {});
      await fetchAllData();
    } catch (err) {
      console.error("Failed to reject employer:", err);
      setIsLoading(false);
    }
  };

  const getFilteredData = () => {
    let sourceData = allEmployers;
    if (activeTab === "Verified") sourceData = verifiedEmployers;
    else if (activeTab === "Pending") sourceData = pendingEmployers;
    else if (activeTab === "Suspended") sourceData = suspendedEmployers;
    return sourceData;
  };

  const requestApproveEmployer = (id: string) => {
    setConfirmModal({ isOpen: true, action: "approve", employerId: id });
  };

  const requestRejectEmployer = (id: string) => {
    setConfirmModal({ isOpen: true, action: "reject", employerId: id });
  };

  const columns = getColumns(requestApproveEmployer, requestRejectEmployer, setViewEmployerId);

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
          Employer Management
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#ea580c" }}>
            {stats.pending} Pending Review
          </span>
          <input
            type="text"
            placeholder="Search employers..."
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
          title="TOTAL EMPLOYERS"
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
          counts={{
            All: stats.total,
            Verified: stats.verified,
            Pending: stats.pending,
            Suspended: stats.suspended,
          }}
        />
      </div>

      {/* Employers Table */}
      <DataTable
        title={isLoading ? "Loading Employers..." : "Employers List"}
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
              Do you really want to {confirmModal.action === "approve" ? "verify" : "suspend"} this employer? This action can be undone later.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() =>
                  setConfirmModal({ isOpen: false, action: null, employerId: null })
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
                    handleApproveEmployer(confirmModal.employerId!);
                  } else if (confirmModal.action === "reject") {
                    handleRejectEmployer(confirmModal.employerId!);
                  }
                  setConfirmModal({ isOpen: false, action: null, employerId: null });
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

      {/* Employer Profile Details Modal */}
      {viewEmployerId && (
        <EmployerDetailsModal
          employerId={viewEmployerId}
          onClose={() => setViewEmployerId(null)}
        />
      )}
    </div>
  );
}
