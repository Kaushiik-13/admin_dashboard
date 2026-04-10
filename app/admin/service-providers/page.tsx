"use client";

import { useState, useEffect } from "react";
import StatCard from "../../components/StatCard";
import FilterTabs from "../../components/FilterTabs";
import DataTable from "../../components/DataTable";
import StatusBadge from "../../components/StatusBadge";
import ActionButton from "../../components/ActionButton";
import ServiceProviderDetailsModal from "../../components/ServiceProviderDetailsModal";
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
    key: "provider",
    header: "Service Provider",
    render: (_: unknown, row: Record<string, unknown>) => (
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "14px" }}>{row.avatar as string}</span>
        <span style={{ fontWeight: 500 }}>{row.provider as string}</span>
      </div>
    ),
  },
  { key: "skill", header: "Skill" },
  { key: "location", header: "Location" },
  { key: "servicesDone", header: "Services Done" },
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

export default function ServiceProvidersPage() {
  const [activeTab, setActiveTab] = useState("All");

  const [allProviders, setAllProviders] = useState<any[]>([]);
  const [verifiedProviders, setVerifiedProviders] = useState<any[]>([]);
  const [pendingProviders, setPendingProviders] = useState<any[]>([]);
  const [suspendedProviders, setSuspendedProviders] = useState<any[]>([]);

  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    suspended: 0,
  });

  const [viewProviderId, setViewProviderId] = useState<string | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    action: "approve" | "reject" | null;
    providerId: string | null;
  }>({
    isOpen: false,
    action: null,
    providerId: null,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const [allRes, verifiedRes, pendingRes, suspendedRes] = await Promise.all([
        apiGet<any[]>("/service-providers").catch(() => []),
        apiGet<{ count: number; data: any[] }>("/admin/service-providers/approved").catch(() => ({ count: 0, data: [] })),
        apiGet<{ count: number; data: any[] }>("/admin/service-providers/pending").catch(() => ({ count: 0, data: [] })),
        apiGet<{ count: number; data: any[] }>("/admin/service-providers/rejected").catch(() => ({ count: 0, data: [] })),
      ]);

      const mapProviders = (providersArray: any[], forceVariant?: string) => {
        return providersArray.map((provider) => {
          const actualStatus = provider.approval_status || provider.user_id?.approval_status || "pending";
          const isApproved = actualStatus === "approved";
          const isPending = actualStatus === "pending";
          const variant = forceVariant || (isApproved ? "active" : isPending ? "pending" : "suspended");
          const statusLabel = variant === "active" ? "Active" : variant === "pending" ? "Pending" : "Suspended";

          return {
            id: provider._id,
            provider: provider.user_id?.name || "Unknown Provider",
            avatar: provider.user_id?.profile_photo ? "📸" : "🟢",
            skill: provider.skills?.length > 0 ? provider.skills[0].skill_name || provider.job_title || "General" : provider.job_title || "General",
            location: provider.current_location || provider.user_id?.addresses?.[0]?.city || "N/A",
            servicesDone: provider.completed_services || 0,
            rating: provider.rating > 0 ? `⭐ ${provider.rating}` : "New",
            status: statusLabel,
            statusVariant: variant,
          };
        });
      };

      setAllProviders(mapProviders(Array.isArray(allRes) ? allRes : []));
      setVerifiedProviders(mapProviders(verifiedRes?.data || [], "active"));
      setPendingProviders(mapProviders(pendingRes?.data || [], "pending"));
      setSuspendedProviders(mapProviders(suspendedRes?.data || [], "suspended"));

      setStats({
        total: Array.isArray(allRes) ? allRes.length : 0,
        verified: verifiedRes?.count || 0,
        pending: pendingRes?.count || 0,
        suspended: suspendedRes?.count || 0,
      });
    } catch (err) {
      console.error("Failed to fetch service providers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveProvider = async (id: string) => {
    try {
      setIsLoading(true);
      await apiPost(`/admin/service-providers/${id}/approve`, {});
      await fetchAllData();
    } catch (err) {
      console.error("Failed to approve service provider:", err);
      setIsLoading(false);
    }
  };

  const handleRejectProvider = async (id: string) => {
    try {
      setIsLoading(true);
      await apiPost(`/admin/service-providers/${id}/reject`, {});
      await fetchAllData();
    } catch (err) {
      console.error("Failed to reject service provider:", err);
      setIsLoading(false);
    }
  };

  const getFilteredData = () => {
    let sourceData = allProviders;
    if (activeTab === "Verified") sourceData = verifiedProviders;
    else if (activeTab === "Pending") sourceData = pendingProviders;
    else if (activeTab === "Suspended") sourceData = suspendedProviders;
    return sourceData;
  };

  const requestApproveProvider = (id: string) => {
    setConfirmModal({ isOpen: true, action: "approve", providerId: id });
  };

  const requestRejectProvider = (id: string) => {
    setConfirmModal({ isOpen: true, action: "reject", providerId: id });
  };

  const columns = getColumns(requestApproveProvider, requestRejectProvider, setViewProviderId);

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
          Service Provider Management
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#ea580c" }}>
            {stats.pending} Pending Review
          </span>
          <input
            type="text"
            placeholder="Search providers..."
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
          title="TOTAL PROVIDERS"
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

      {/* Service Providers Table */}
      <DataTable
        title={isLoading ? "Loading Providers..." : "Service Providers List"}
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
              Do you really want to {confirmModal.action === "approve" ? "verify" : "suspend"} this service provider? This action can be undone later.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() =>
                  setConfirmModal({ isOpen: false, action: null, providerId: null })
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
                    handleApproveProvider(confirmModal.providerId!);
                  } else if (confirmModal.action === "reject") {
                    handleRejectProvider(confirmModal.providerId!);
                  }
                  setConfirmModal({ isOpen: false, action: null, providerId: null });
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

      {/* Service Provider Profile Details Modal */}
      {viewProviderId && (
        <ServiceProviderDetailsModal
          providerId={viewProviderId}
          onClose={() => setViewProviderId(null)}
        />
      )}
    </div>
  );
}
