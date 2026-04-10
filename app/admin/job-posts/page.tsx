"use client";

import { useState, useEffect } from "react";
import StatCard from "../../components/StatCard";
import FilterTabs from "../../components/FilterTabs";
import DataTable from "../../components/DataTable";
import StatusBadge from "../../components/StatusBadge";
import ActionButton from "../../components/ActionButton";
import ListingDetailsModal from "../../components/ListingDetailsModal";
import { apiGet, apiPost } from "../../lib/api";

const statusTabs = [
  { label: "All" },
  { label: "Pending", color: "#f59e0b" },
  { label: "Approved", color: "#22c55e" },
  { label: "Rejected", color: "#ef4444" },
];

const getColumns = (
  onApprove: (id: string) => void,
  onReject: (id: string) => void,
  onView: (id: string) => void
) => [
    {
      key: "jobTitle",
      header: "Job Title",
      render: (_: unknown, row: Record<string, unknown>) => (
        <span style={{ fontWeight: 500 }}>{row.jobTitle as string}</span>
      ),
    },
    {
      key: "employer",
      header: "Employer",
      render: (_: unknown, row: Record<string, unknown>) => (
        <span style={{ fontWeight: 500 }}>{row.employer as string}</span>
      ),
    },
    { key: "city", header: "City" },
    {
      key: "type",
      header: "Type",
      render: (_: unknown, row: Record<string, unknown>) => {
        const jobType = row.type as string;
        const label = jobType === "full-time" ? "Full Time" : jobType === "part-time" ? "Part Time" : jobType === "daily" ? "Daily" : jobType;
        return <StatusBadge label={label} variant={row.typeVariant as "worker" | "employer"} />;
      },
    },
    { key: "pay", header: "Salary" },
    {
      key: "skills",
      header: "Skills",
      render: (_: unknown, row: Record<string, unknown>) => {
        const skills = row.skills as string[];
        if (!skills || skills.length === 0) return <span style={{ color: "#9ca3af" }}>N/A</span>;
        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
            {skills.slice(0, 3).map((skill, i) => (
              <span
                key={i}
                style={{
                  background: "#e0e7ff",
                  color: "#4f46e5",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  fontSize: "11px",
                  fontWeight: 500,
                }}
              >
                {skill}
              </span>
            ))}
            {skills.length > 3 && (
              <span style={{ fontSize: "11px", color: "#6b7280" }}>+{skills.length - 3}</span>
            )}
          </div>
        );
      },
    },
    { key: "posted", header: "Posted" },
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
        const statusVariant = row.statusVariant as string;
        return (
          <div style={{ display: "flex", gap: "8px" }}>
            <ActionButton
              label="View"
              variant="view"
              onClick={() => onView(row.id as string)}
            />
            {statusVariant === "pending" && (
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
            {statusVariant === "active" && (
              <ActionButton
                label="Reject"
                variant="reject"
                onClick={() => onReject(row.id as string)}
              />
            )}
            {statusVariant === "suspended" && (
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

export default function JobPostsPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [filterTabs, setFilterTabs] = useState(statusTabs);

  const [allListings, setAllListings] = useState<any[]>([]);
  const [pendingListings, setPendingListings] = useState<any[]>([]);
  const [approvedListings, setApprovedListings] = useState<any[]>([]);
  const [rejectedListings, setRejectedListings] = useState<any[]>([]);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const [viewListingId, setViewListingId] = useState<string | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    action: "approve" | "reject" | "delete" | null;
    listingId: string | null;
  }>({
    isOpen: false,
    action: null,
    listingId: null,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      console.log("🔄 Fetching API data...");

      const [allRes, pendingRes, approvedRes, rejectedRes] = await Promise.all([
        apiGet<any[]>("/listings").catch((e) => { console.error("❌ /listings error:", e); return []; }),
        apiGet<{ count: number; data: any[] }>("/listings/admin/pending").catch((e) => { console.error("❌ /listings/admin/pending error:", e); return { count: 0, data: [] }; }),
        apiGet<{ count: number; data: any[] }>("/listings/admin/approved").catch((e) => { console.error("❌ /listings/admin/approved error:", e); return { count: 0, data: [] }; }),
        apiGet<{ count: number; data: any[] }>("/listings/admin/rejected").catch((e) => { console.error("❌ /listings/admin/rejected error:", e); return { count: 0, data: [] }; }),
      ]);

      console.log("✅ API Responses:");
      console.log("  /listings:", allRes);
      console.log("  /listings/admin/pending:", pendingRes);
      console.log("  /listings/admin/approved:", approvedRes);
      console.log("  /listings/admin/rejected:", rejectedRes);

      const mapListings = (listingsArray: any[], forceVariant?: string) => {
        return listingsArray.map((listing) => {
          const status = listing.approval_status || forceVariant || "pending";
          const isApproved = status === "approved";
          const isPending = status === "pending";
          const isRejected = status === "rejected";
          const variant = isApproved ? "active" : isPending ? "pending" : isRejected ? "suspended" : "pending";
          const statusLabel = isApproved ? "Approved" : isPending ? "Pending" : isRejected ? "Rejected" : "Pending";

          const jobDetails = listing.job_details || {};
          const jobType = jobDetails.job_type || "full-time";
          const jobTypeVariant = jobType.toLowerCase().includes("part") || jobType.toLowerCase().includes("daily") ? "worker" : "employer";

          const skills = jobDetails.required_skills?.map((s: any) => s.skill_name) || [];

          const salaryMin = jobDetails.salary_min;
          const salaryMax = jobDetails.salary_max;
          const formatDate = (dateStr: string) => {
            if (!dateStr) return "N/A";
            const date = new Date(dateStr);
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
          };

          const pay = salaryMin && salaryMax
            ? `₹${salaryMin.toLocaleString()} - ₹${salaryMax.toLocaleString()}`
            : "N/A";

          const postedDate = formatDate(listing.createdAt);

          return {
            id: listing._id,
            jobTitle: listing.title || "Untitled Job",
            employer: listing.created_by?.name || "Unknown Employer",
            city: listing.address?.city || "N/A",
            type: jobType,
            typeVariant: jobTypeVariant as "worker" | "employer",
            pay: pay,
            skills: skills,
            posted: postedDate,
            status: statusLabel,
            statusVariant: variant,
          };
        });
      };

      const mappedAll = mapListings(Array.isArray(allRes) ? allRes : []);
      const mappedPending = mapListings(Array.isArray(pendingRes) ? pendingRes : (pendingRes?.data || []), "pending");
      const mappedApproved = mapListings(Array.isArray(approvedRes) ? approvedRes : (approvedRes?.data || []), "approved");
      const mappedRejected = mapListings(Array.isArray(rejectedRes) ? rejectedRes : (rejectedRes?.data || []), "rejected");

      console.log("📊 Mapped Data:");
      console.log("  All Listings:", mappedAll);
      console.log("  Pending:", mappedPending);
      console.log("  Stats:", {
        total: Array.isArray(allRes) ? allRes.length : 0,
        pending: Array.isArray(pendingRes) ? pendingRes.length : (pendingRes?.count || 0)
      });

      setAllListings(mappedAll);
      setPendingListings(mappedPending);
      setApprovedListings(mappedApproved);
      setRejectedListings(mappedRejected);

      setStats({
        total: Array.isArray(allRes) ? allRes.length : 0,
        pending: Array.isArray(pendingRes) ? pendingRes.length : (pendingRes?.count || 0),
        approved: Array.isArray(approvedRes) ? approvedRes.length : (approvedRes?.count || 0),
        rejected: Array.isArray(rejectedRes) ? rejectedRes.length : (rejectedRes?.count || 0),
      });
      console.log("✅ Data state updated!");
    } catch (err) {
      console.error("❌ Failed to fetch listings:", err);
    } finally {
      setIsLoading(false);
      console.log("🏁 Loading complete");
    }
  };

  const handleApproveListing = async (id: string) => {
    try {
      setIsLoading(true);
      await apiPost(`/listings/${id}/approve`, {});
      await fetchAllData();
    } catch (err) {
      console.error("Failed to approve listing:", err);
      setIsLoading(false);
    }
  };

  const handleRejectListing = async (id: string) => {
    try {
      setIsLoading(true);
      await apiPost(`/listings/${id}/reject`, {});
      await fetchAllData();
    } catch (err) {
      console.error("Failed to reject listing:", err);
      setIsLoading(false);
    }
  };

  const handleDeleteListing = async (id: string) => {
    try {
      setIsLoading(true);
      await apiPost(`/listings/${id}/reject`, {});
      await fetchAllData();
    } catch (err) {
      console.error("Failed to delete listing:", err);
      setIsLoading(false);
    }
  };

  const getFilteredData = () => {
    let sourceData = allListings;
    if (activeTab === "Pending") sourceData = pendingListings;
    else if (activeTab === "Approved") sourceData = approvedListings;
    else if (activeTab === "Rejected") sourceData = rejectedListings;

    if (["All", "Pending", "Approved", "Rejected"].includes(activeTab)) {
      return sourceData;
    }
    return sourceData.filter((l) => l.type === activeTab);
  };

  const requestApproveListing = (id: string) => {
    setConfirmModal({ isOpen: true, action: "approve", listingId: id });
  };

  const requestRejectListing = (id: string) => {
    setConfirmModal({ isOpen: true, action: "reject", listingId: id });
  };

  const columns = getColumns(requestApproveListing, requestRejectListing, setViewListingId);

  return (
    <div>
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
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#ea580c" }}>
            {stats.pending} Pending Review
          </span>
          <input
            type="text"
            placeholder="Search job posts..."
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

      <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
        <StatCard
          title="TOTAL JOBS"
          value={isLoading ? "..." : stats.total.toString()}
          subtitle="↑ +120 today"
          subtitleColor="#2d6a4f"
        />
        <StatCard
          title="PENDING APPROVAL"
          value={isLoading ? "..." : stats.pending.toString()}
          subtitle="Needs review"
          subtitleColor="#ea580c"
        />
        <StatCard
          title="APPROVED"
          value={isLoading ? "..." : stats.approved.toString()}
        />
        <StatCard
          title="REJECTED"
          value={isLoading ? "..." : stats.rejected.toString()}
        />
      </div>

      <div style={{ marginBottom: "16px" }}>
        <FilterTabs
          tabs={filterTabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          counts={{
            All: stats.total,
            Pending: stats.pending,
            Approved: stats.approved,
            Rejected: stats.rejected,
          }}
        />
      </div>

      <DataTable
        title={isLoading ? "Loading Job Posts..." : `Job Posts — ${activeTab}`}
        columns={columns}
        data={getFilteredData()}
      />

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
              {confirmModal.action === "approve"
                ? "Do you really want to approve this listing? It will be published."
                : confirmModal.action === "reject"
                  ? "Do you really want to reject this listing? This action can be undone later."
                  : "Do you really want to delete this listing? This action cannot be undone."}
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() =>
                  setConfirmModal({ isOpen: false, action: null, listingId: null })
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
                    handleApproveListing(confirmModal.listingId!);
                  } else if (confirmModal.action === "reject") {
                    handleRejectListing(confirmModal.listingId!);
                  } else if (confirmModal.action === "delete") {
                    handleDeleteListing(confirmModal.listingId!);
                  }
                  setConfirmModal({ isOpen: false, action: null, listingId: null });
                }}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  background:
                    confirmModal.action === "approve"
                      ? "#059669"
                      : confirmModal.action === "reject"
                        ? "#dc2626"
                        : "#dc2626",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                {confirmModal.action === "approve"
                  ? "Yes, Approve"
                  : confirmModal.action === "reject"
                    ? "Yes, Reject"
                    : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewListingId && (
        <ListingDetailsModal
          listingId={viewListingId}
          onClose={() => setViewListingId(null)}
        />
      )}
    </div>
  );
}