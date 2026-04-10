"use client";

import { useEffect, useState } from "react";
import DataTable from "../../components/DataTable";
import StatusBadge from "../../components/StatusBadge";
import ActionButton from "../../components/ActionButton";
import FilterTabs from "../../components/FilterTabs";
import { apiGet, apiPost } from "../../lib/api";

const filterTabs = [
  { label: "Pending", color: "#f59e0b" },
  { label: "Approved" },
  { label: "Rejected", color: "#ef4444" },
];

const getColumns = (
  onApprove: (id: string) => void,
  onReject: (id: string) => void
) => [
  { key: "user", header: "User" },
  {
    key: "type",
    header: "Type",
    render: (_: unknown, row: Record<string, unknown>) => {
      // Fallback cleanly to worker/employer for the badge color map
      const variant =
        row.typeVariant === "employer" ? "employer" : "worker";
      const label = row.type as string;
      return <StatusBadge label={label} variant={variant} />;
    },
  },
  {
    key: "documentType",
    header: "Document Type",
    render: (_: unknown, row: Record<string, unknown>) => {
      const docType = row.documentType as string;
      return <span style={{ fontWeight: 500, color: "#374151" }}>{docType}</span>;
    },
  },
  {
    key: "documents",
    header: "Documents",
    render: (_: unknown, row: Record<string, unknown>) => {
      const url = row.documentUrl as string;
      if (url && url !== "string") {
        return (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            style={{
              color: "#2563eb",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            View File ↗
          </a>
        );
      }
      return <span style={{ color: "#9ca3af", fontStyle: "italic", fontSize: "13px" }}>No files uploaded</span>;
    },
  },
  {
    key: "docNumber",
    header: "Document No.",
    render: (_: unknown, row: Record<string, unknown>) => {
      const num = row.docNumber as string;
      if (!num || num === "N/A") {
        return <span style={{ color: "#9ca3af" }}>N/A</span>;
      }
      const last4 = num.slice(-4);
      const masked = "*".repeat(Math.max(0, num.length - 4)) + last4;
      return <span style={{ fontFamily: "monospace", letterSpacing: "2px", fontWeight: 500 }}>{masked}</span>;
    },
  },
  {
    key: "actions",
    header: "Actions",
    render: (_: unknown, row: Record<string, unknown>) => {
      const status = row.status as string;
      return (
        <div style={{ display: "flex", gap: "8px" }}>
          {status === "pending" && (
            <>
              <ActionButton
                label="Approve"
                variant="approve"
                onClick={() => onApprove(row.id as string)}
              />
              <ActionButton
                label="Reject"
                variant="reject"
                onClick={() => onReject(row.id as string)}
              />
            </>
          )}
          {status === "approved" && (
            <ActionButton
              label="Reject"
              variant="reject"
              onClick={() => onReject(row.id as string)}
            />
          )}
          {status === "rejected" && (
            <ActionButton
              label="Approve"
              variant="approve"
              onClick={() => onApprove(row.id as string)}
            />
          )}
        </div>
      );
    },
  },
];

export default function VerificationQueuePage() {
  const [activeTab, setActiveTab] = useState("Pending");

  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<any[]>([]);
  const [rejectedUsers, setRejectedUsers] = useState<any[]>([]);
  
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Modal State for safety execution
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    action: "approve" | "reject" | null;
    userId: string | null;
  }>({ isOpen: false, action: null, userId: null });

  const fetchUsers = async () => {
    try {
      setIsLoading(true);

      const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
        apiGet<{ count: number; data: any[] }>("/admin/users/pending").catch(() => ({ count: 0, data: [] })),
        apiGet<{ count: number; data: any[] }>("/admin/users/approved").catch(() => ({ count: 0, data: [] })),
        apiGet<{ count: number; data: any[] }>("/admin/users/rejected").catch(() => ({ count: 0, data: [] })),
      ]);

      const mapData = (arr: any[], status: string) => {
        return (arr || []).map((u) => {
          const rawRole = u.roles && u.roles.length > 0 ? u.roles[0] : "worker";
          const formattedRole =
            rawRole.charAt(0).toUpperCase() + rawRole.slice(1);

          // Friendly date formatting
          const dateObj = new Date(u.createdAt);
          const dateStr = !isNaN(dateObj.getTime())
            ? dateObj.toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })
            : "N/A";

          const primaryDoc =
            u.identity_docs && u.identity_docs.length > 0
              ? u.identity_docs[0]
              : null;

          return {
            id: u._id,
            user: u.name || "Unknown User",
            type: formattedRole,
            typeVariant: rawRole,
            status: status, // mapped status for actions
            documentType: primaryDoc?.document_type || "N/A",
            documentUrl: primaryDoc?.document_url || null,
            docNumber: primaryDoc?.document_number || "N/A",
          };
        });
      };

      setPendingUsers(mapData(pendingRes?.data || [], "pending"));
      setApprovedUsers(mapData(approvedRes?.data || [], "approved"));
      setRejectedUsers(mapData(rejectedRes?.data || [], "rejected"));

      setStats({
        pending: pendingRes?.count || 0,
        approved: approvedRes?.count || 0,
        rejected: rejectedRes?.count || 0,
      });
    } catch (e) {
      console.error("Failed to fetch verifications", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      setIsLoading(true);
      await apiPost(`/admin/users/${id}/approve`, {});
      setConfirmModal({ isOpen: false, action: null, userId: null });
      fetchUsers();
    } catch (e) {
      console.error("Failed to approve user", e);
      setIsLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setIsLoading(true);
      // Assuming symmetric reject endpoint
      await apiPost(`/admin/users/${id}/reject`, {});
      setConfirmModal({ isOpen: false, action: null, userId: null });
      fetchUsers();
    } catch (e) {
      console.error("Failed to reject user", e);
      setIsLoading(false);
    }
  };

  const getFilteredData = () => {
    if (activeTab === "Pending") return pendingUsers;
    if (activeTab === "Approved") return approvedUsers;
    if (activeTab === "Rejected") return rejectedUsers;
    return pendingUsers;
  };

  const columns = getColumns(
    (id) => setConfirmModal({ isOpen: true, action: "approve", userId: id }),
    (id) => setConfirmModal({ isOpen: true, action: "reject", userId: id })
  );

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
          Verification Queue
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
           <span
              style={{
                fontSize: "13px",
                fontWeight: 600,
                background: "#fef3c7",
                color: "#d97706",
                padding: "4px 12px",
                borderRadius: "9999px",
                border: "1px solid #fde68a",
              }}
            >
              {isLoading ? "..." : stats.pending} pending
            </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ marginBottom: "16px" }}>
        <FilterTabs
          tabs={filterTabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          counts={{
            Pending: stats.pending,
            Approved: stats.approved,
            Rejected: stats.rejected,
          }}
        />
      </div>

      {/* Pending KYC Verifications Table */}
      <DataTable
        title={isLoading ? "Loading queue..." : `${activeTab} Verifications`}
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
              Confirm Action
            </h3>
            <p
              style={{
                margin: "0 0 24px 0",
                fontSize: "14px",
                color: "#4b5563",
                lineHeight: 1.5,
              }}
            >
              Are you sure you want to{" "}
              {confirmModal.action === "approve" ? "verify" : "reject"} this user?
              This action executes immediately.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() =>
                  setConfirmModal({ isOpen: false, action: null, userId: null })
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
                    handleApprove(confirmModal.userId!);
                  } else if (confirmModal.action === "reject") {
                    handleReject(confirmModal.userId!);
                  }
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
                Yes, {confirmModal.action === "approve" ? "Verify" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
